const jwt = require('jsonwebtoken')

const { User } = require("../models/User");

const { createErr } = require("../helpers");

const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [bearer, token] = authorization.split(' ')
    if(bearer !== 'Bearer') {
        throw createErr(401)
    }
  } catch (err) {}
};

module.exports = auth;
