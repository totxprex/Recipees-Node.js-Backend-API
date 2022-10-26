const mongoose = require("mongoose")
const validator = require("validator")



const userSchema = new mongoose.Schema({
  photo: {
    type: String,
    trim: true,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  age: {
    type: Number,
    max: 80,
    required: [true, "Age is required"]
  },
  name: {
    type: String,
    required: [true, "Name must be present"],
    maxlength: 100,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email must be present"],
    validate: {
      validator: validator.isEmail,
      message: "Email verification failed"
    }
  },
  username: {
    type: String,
    trim: true,
    maxlength: 100,
    required: true
  },
  password: {
    type: String,
    required: [true, "Password must be present"],
    select: false
  },
  likedRecipes: [String],
  myPostedRecipes: [{
    type: mongoose.Schema.ObjectId,
    ref: "Recipes"
  }],
  recipesRecommendedToMe: [String]
})

userSchema.index({ username: 1 }, { unique: true })



const recipeSchema = new mongoose.Schema({
  publisher: {
    type: String,
    required: [true, "Recipe must have a publisher"]
  },
  ingredients: [{
    type: String,
    maxlength: 300
  }],
  source_url: {
    type: String,
    default: ""
  },
  image_url: {
    type: String,
    required: [true, "Recipe must have an image"]
  },
  social_rank: {
    type: Number,
    default: 0
  },
  publisher_url: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    maxlength: 200,
    required: [true, "Recipe must have a name"]
  },
  recipeOwner: {
    type: mongoose.Schema.ObjectId,
    ref: "Users"
  }
})

recipeSchema.index({ title: 1 }, { unique: true })

recipeSchema.post("save", async (obj, next) => {
  try {
    const userID = obj.recipeOwner

    const { myPostedRecipes } = await dbUsers.findById(userID)

    myPostedRecipes.push(obj._id)

    await dbUsers.findByIdAndUpdate(userID, { myPostedRecipes: myPostedRecipes })
    next()
  }
  catch (err) {
    console.log(err)
  }
})







const dbUsers = mongoose.model("Users", userSchema)
const dbRecipees = mongoose.model("Recipes", recipeSchema)



module.exports = { dbUsers, dbRecipees }