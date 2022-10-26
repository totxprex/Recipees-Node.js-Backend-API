const nodemailer = require("nodemailer")


const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 25,
  auth: {
    user: "ee3ae1e1718976",
    pass: "7b92081c0d5267"
  },
  secure: false,
})


function emailer(options) {

  transport.sendMail(options).then(function () {
    console.log("Email sent")
  }).catch(function (err) {
    console.log(err.message)
  })
}

module.exports = { emailer }