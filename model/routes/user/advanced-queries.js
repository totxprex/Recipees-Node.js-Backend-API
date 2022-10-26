const { errorResponce, responce } = require("../../../server-returns/returns.js")
const { dbUsers } = require("../../../database/schemas.js")



function userAdvancedQueryMiddleware() {

  return async function (req, res) {

    try {
      const query = { ...req.query }

      const excludedFields = ["limit", "fields", "sort", "page"]

      excludedFields.forEach((e) => {
        delete query[e]
      })

      const newQuery = JSON.stringify(query).replace(/\b(lte|gt|gte|lt)\b/g, (match) => `$${match}`)


      const startFinding = dbUsers.find(JSON.parse(newQuery))

      if (req.query.fields) startFinding.select(req.query.fields.replaceAll(",", ` `))


      if (req.query.sort) startFinding.sort(req.query.sort.replaceAll(",", ` `))


      if (req.query.page && req.query.limit) {
        const skip = Number(req.query.limit) * Number(req.query.page) - 1
        const limit = Number(req.query.limit)

        startFinding.skip(skip).limit(limit)
      }

      const result = await startFinding

      responce(res, "Found users", result)
    }

    catch (err) {
      errorResponce(res, err)
    }

  }
}


module.exports = { userAdvancedQueryMiddleware }