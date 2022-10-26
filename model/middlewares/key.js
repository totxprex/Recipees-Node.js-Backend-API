const { errorResponce, responce } = require("../../server-returns/returns.js")

function VerifyKey() {
  return function (req, res, next) {
    if (req.params.key !== "1680") return errorResponce(res, "Invalid Key")

    else next()
  }
}


module.exports = { VerifyKey }