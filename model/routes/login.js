const { dbUsers } = require("../../database/schemas.js")
const jwt = require("jsonwebtoken")
const { errorResponce, responce } = require("../../server-returns/returns.js")
const bcrypt = require("bcryptjs")

function login() {

  return async function (req, res) {
    try {
      const username = req.params.username
      const password = req.params.password

      const startFinding = dbUsers.findOne({ username, username }).select("+password")

      const user = await startFinding

      if (!user.name) throw new Error("User not found")

      const verified = await bcrypt.compare(password, user.password)

      if (!verified) throw new Error("Password Incorrect")

      const token = jwt.sign({ username: username }, process.env.jwtkey, {
        expiresIn: "24h"
      })

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: false,
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      })

      res.status(200).header({
        "content-type": "application/json"
      }).send({
        status: "User Logged In and Verified",
        token: token,
        username: username
      })

    }

    catch (err) {
      errorResponce(res, "username or password incorrect")
    }

  }
}


module.exports = { login }