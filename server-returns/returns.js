const errorResponce = function (resOBJ, message) {
  return resOBJ.status(404).header({
    "content-type": "application/json"
  }).send({
    status: "Internal server error",
    message: message || "None"
  })
}

const responce = function (resOBJ, status, data) {

  return resOBJ.status(200).header({
    "content-type": "application/json"
  }).send({
    status: status || "Succesful",
    data: data || "No data"
  })
}


function noRoute() {
  return function (req, res) {
    return errorResponce(res, "Route unavialable in this server")
  }
}





module.exports = { errorResponce, responce, noRoute }