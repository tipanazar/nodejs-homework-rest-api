const nodemailer = require("nodemailer");

const { USER_EMAIL, USER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: USER_EMAIL,
    pass: USER_PASSWORD,
  },
});

module.exports = transporter;
