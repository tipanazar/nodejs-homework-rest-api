const nodemailer = require("nodemailer");

const { USER_EMAIL, USER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: USER_EMAIL,
    pass: USER_PASSWORD,
  },
});

module.exports = transporter;
