const { errorResponce, responce } = require("../../../server-returns/returns.js")
const { dbUsers } = require("../../../database/schemas.js")
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { s3 } = require("../../../controller/aws.js")

const getUser = function () {

  return async function (req, res) {
    try {
      if (req.params.username) {
        const starFinding = dbUsers.findOne({ username: req.params.username }).populate({
          path: "myPostedRecipes"
        })

        const user = await starFinding

        if (user.photo !== "") {
          const command = new GetObjectCommand({
            Key: user.photo,
            Bucket: "recipees-aws"
          })

          const url = await getSignedUrl(s3, command)
          user.photo = url
        }

        responce(res, "User found by username", user)
      }
      else if (req.query.id) {
        const startFinding = dbUsers.findById(req.query.id)
        const user = await startFinding

        if (user.photo !== "") {
          const command = new GetObjectCommand({
            Key: user.photo,
            Bucket: "recipees-aws"
          })

          const url = await getSignedUrl(s3, command)
          user.photo = url
        }

        responce(res, "User found by id", user)
      }
    }
    catch {
      errorResponce(res, "User not found")
    }
  }
}







module.exports = { getUser }