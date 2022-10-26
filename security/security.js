const jwt = require("jsonwebtoken")
const { errorResponce } = require("../server-returns/returns.js")

const verifyToken = function () {
  return function (req, res, next) {
    if (!req.params.token) return next()

    jwt.verify(req.params.token, process.env.jwtkey, (err, obj) => {
      if (err) return errorResponce(res, "Authentication failed")

      else {
        req.usernameFromToken = obj.username
        next()
      }
    })
  }
}

module.exports = { verifyToken }