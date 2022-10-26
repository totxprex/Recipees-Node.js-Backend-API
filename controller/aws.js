const express = require("express")
const { errorResponce, responce } = require("../server-returns/returns.js")
const { dbUsers } = require("../database/schemas.js")
const multer = require("multer")
const sharp = require("sharp")
const upload = multer({ storage: multer.memoryStorage() })


const { PutObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

const s3 = new S3Client({
  region: process.env.awsRegion,
  credentials: {
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey
  }
})


const fileapp = express.Router()

//update profile pic router
fileapp.route("/:username/:filename?")
  .patch(upload.single("photo"), async (req, res) => {
    const username = req.params.username
    if (!req.file.buffer) return errorResponce(res, "Invalid file")

    try {
      const filename = `user-${username}-${Date.now()}-aws.jpeg`

      const bufferDone = await sharp(req.file.buffer).resize(200, 200).toFormat("jpeg").jpeg({ quality: 80 }).toBuffer()

      const command = new PutObjectCommand({
        Key: filename,
        Body: bufferDone,
        mimetype: req.file.mimetype,
        Bucket: "recipees-aws"
      })

      await s3.send(command)

      await dbUsers.findOneAndUpdate({ username: username }, { photo: filename }, {
        runValidators: true
      })

      responce(res, "User profile picture updated successfully", filename)

    }
    catch (err) {
      errorResponce(res, err)
    }
  })
  .get(async (req, res) => {
    const filename = req.params.filename

    try {
      const command = new GetObjectCommand({
        Key: filename,
        Bucket: "recipees-aws"
      })

      const url = await getSignedUrl(s3, command, {
        expiresIn: 3000
      })

      responce(res, "Found Image Url", url)
    }

    catch {
      errorResponce(res, "Image Url fetch failed")
    }
  })





module.exports = { fileapp, s3 }