const { errorResponce, responce } = require("../../server-returns/returns.js")
const { dbUsers } = require("../../database/schemas.js")
const { emailer } = require("../../controller/emailer.js")
const { emitEmailPage } = require("../../miscellaneous/emailHtml.js")


function signup() {
  return function (req, res) {
    if (!req.body.name) return errorResponce(res, "No user present")

    dbUsers.create(req.body).then(function () {

      const options = {
        from: "recipees@gmail.com",
        to: `${req.body.email}`,
        subject: "Welcome to Recipees!",
        text: `Hello ${req.body.name}!\n\nThank you for joining Recipees, your one stop platform for everything food. Browse our array of food catalogues, share a recipe, and ensure you never miss out on trending recipees by adding recipes to your Favourite list.\n\nGet cooking!`,
        html: emitEmailPage(`Hello ${req.body.name}! \n\nThank you for joining Recipees, your one stop platform for everything food. Browse our array of food catalogues, share a recipe, and ensure you never miss out on trending recipees by adding recipes to your Favourite list.\n\n Get cooking!`)
      }


      emailer(options)


      responce(res, "User created", "")
    }).catch(function (err) {
      errorResponce(res, err.message)
    })
  }
}


module.exports = { signup }