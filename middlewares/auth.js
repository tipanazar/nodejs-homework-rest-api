const jwt = require("jsonwebtoken");

const { User } = require("../models/User");
const createErr = require("../helpers/createError");

const { SECRET_KEY } = process.env;

const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw createErr(403, "Token is required");
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw createErr(401, "Token is required");
    }
    try {
      const { id } = jwt.verify(token, SECRET_KEY);
      const user = await User.findById(id);
      if (!user || user.token !== token) {
        throw createErr(401, "Not authorized");
      }
      req.user = user;
      next();
    } catch (err) {
      throw createErr(401, "Not authorized");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
