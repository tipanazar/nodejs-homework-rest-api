const createError = require("./createError");
const transporter = require("./transporter");
const emailTemplate = require('./emailTemplate')

module.exports = {
  createError,
  transporter,
  emailTemplate
};
