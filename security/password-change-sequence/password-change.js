const express = require("express")
const { emailer } = require("../../controller/emailer.js")
const jwt = require("jsonwebtoken")
const { dbUsers } = require("../../database/schemas.js")
const { errorResponce, responce } = require("../../server-returns/returns")

const securityApp = express.Router()


//request password change and get token
securityApp.post("/:initiate", async (req, res) => {
  try {
    const email = req.body.email

    if (!email) throw new Error("Email not found")

    const user = await dbUsers.findOne({ email: email })

    if (!user) throw new Error("User not found")

    const token = jwt.sign({ email: email }, process.env.jwtkey, {
      expiresIn: "10m"
    })

    const options = {
      from: "recipees@gmail.com",
      to: email,
      subject: "PASSWORD RESET CHANGE",
      text: `Hello,\n\nYou have requested a password change for your account. See reset link below:\n\n${token}.\n\nIf you did not make this request, contact support immediately.`
    }

    emailer(options)

    responce(res, "Reset link sent to email")
  }
  catch (err) {
    errorResponce(res, err)
  }
})



//change password with sent token
securityApp.patch("/change", (req, res) => {
  const token = req.body.token
  const newPassword = req.body.password

  jwt.verify(token, process.env.jwtkey, async (err, obj) => {
    if (err) return errorResponce(res, "Email Auth Failed")
    const email = obj.email

    try {
      await dbUsers.findOneAndUpdate({ email: email }, { password: newPassword })
      responce(res, "Password change succesful")
    }

    catch {
      errorResponce(res, "Error changing password")
    }

  })
})



module.exports = { securityApp }