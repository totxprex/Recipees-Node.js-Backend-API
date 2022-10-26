const express = require("express")
const { errorResponce, responce } = require("../../../server-returns/returns.js")
const { dbUsers, dbRecipees } = require("../../../database/schemas.js")
const { s3 } = require("../../../controller/aws.js")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })
const sharp = require("sharp")


const recipeApp = express.Router()

//Like a recipe
recipeApp.get("/like/:username/:recipeID", async function (req, res) {
  try {
    const recipeID = req.params.recipeID
    const username = req.params.username

    const { likedRecipes } = await dbUsers.findOne({ username: username })
    likedRecipes.push(recipeID)

    const data = await dbUsers.findOneAndUpdate({ username: username }, { likedRecipes: likedRecipes }, {
      new: true
    })

    responce(res, "Recipe liked", data)

  }

  catch {
    errorResponce(res, "Error liking recipe")
  }
})




//Post a recipe

const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")


recipeApp.post("/post", upload.single("image_url"), async function (req, res) {
  if (!req.file.buffer || !req.body.publisher) return errorResponce(res, "Invalid Image")

  const recipe = req.body

  try {
    const filename = `recipe-${recipe.title.replaceAll(` `, "-")}-${Date.now()}.jpeg`

    const file = await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 80 }).toBuffer()

    const command = new PutObjectCommand({
      Key: filename,
      Body: file,
      mimetype: req.file.mimetype,
      Bucket: "recipees-aws"
    })

    await s3.send(command)

    req.body.ingredients = req.body.ingredients.replaceAll(" ", "")
    req.body.image_url = filename
    req.body.ingredients = req.body.ingredients.split(",")

    const data = await dbRecipees.create(req.body)

    responce(res, "Recipe posted", data)

  }

  catch {
    errorResponce(res, "Error saving post")
  }
})




//Get a recipe by ID

recipeApp.get("/get/:recipeID", async function (req, res) {
  try {
    const startFinding = await dbRecipees.findById(req.params.recipeID).populate({
      path: "recipeOwner",
      select: "name photo likedRecipes myPostedRecipes recipesRecommendedToMe username"
    })

    const recipe = await startFinding

    const command = new GetObjectCommand({
      Key: recipe.image_url,
      Bucket: "recipees-aws"
    })

    const url = await getSignedUrl(s3, command)

    recipe.image_url = url

    responce(res, "Found recipe", recipe)
  }

  catch {
    errorResponce(res,"Error generating recipe")
  }

})





module.exports = { recipeApp }