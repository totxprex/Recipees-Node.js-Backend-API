const bcrypt = require("bcryptjs")
const { errorResponce } = require("../../server-returns/returns.js")

function hashPassword() {
  return async function (req, res, next) {
    if (req.body.password) {
      try {
        const password = await bcrypt.hash(req.body.password, 12)
        req.body.password = password
        next()
      }

      catch {
        errorResponce(res, "Unable to process request")
      }
    }

    else next()

  }
}


module.exports = { hashPassword }