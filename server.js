const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })
const express = require("express")
const mongoose = require("mongoose")
const helmet = require("helmet")
const cors = require("cors")
const morgan = require("morgan")
const { VerifyKey } = require("./model/middlewares/key.js")
const { hashPassword } = require("./model/middlewares/password.js")
const { signup } = require("./model/routes/signup.js")
const apiVersion = process.env.apiVersion
const { noRoute } = require("./server-returns/returns.js")
const { login } = require("./model/routes/login.js")
const { verifyToken } = require("./security/security.js")
const { getUser } = require("./model/routes/user/user.js")




const app = express()
app.listen(5500, "127.0.0.1", () => {
  console.log("Server started at 127.0.0.1:5500")
})
mongoose.connect(process.env.mongo, {
  useFindAndModify: false,
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Recipees Database connected")).catch((err) => console.log(err))

app.use(morgan("dev"))
app.use(express.json())
app.use(express.static("./public"))
app.use(helmet())
app.use(cors({
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  origin: "*"
}))



//Custom middlewares

//Verify Key

app.param("key", VerifyKey())



//verify token
app.param("token", verifyToken())


//hash user password upon signup
app.use(hashPassword())





//signup
app.post(`/recipees/api/${apiVersion}/:key/signup`, signup())


//Login and get token
app.get(`/recipees/api/${apiVersion}/:key/login/:username/:password`, login())



//Get one user
app.get(`/recipees/api/${apiVersion}/:key/:token/getuser/:username?`, getUser())




//update profile pic and get signed url router through aws
const { fileapp } = require("./controller/aws.js")


app.use(`/recipees/api/${apiVersion}/:key/:token/updatepic`, fileapp)




//recipe router
const { recipeApp } = require("./model/routes/recipes/recipe.js")

app.use(`/recipees/api/${apiVersion}/:key/:token/recipe`, recipeApp)





//Change password sequence

//request password change and get token and //change password with token
const { securityApp } = require("./security/password-change-sequence/password-change")

app.use(`/recipees/api/${apiVersion}/:key/password`, securityApp)




//Advances queries
const { userAdvancedQueryMiddleware } = require("./model/routes/user/advanced-queries.js")

app.get(`/recipees/api/${apiVersion}/:key/:token/advanced/user`, userAdvancedQueryMiddleware())






























































app.use(noRoute())