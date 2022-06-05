const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const router = express.Router();

const { User, schemas } = require("../../models/User");
const { auth } = require("../../middlewares");
const { upload } = require("../../middlewares");
const { createError } = require("../../helpers");
const { emailSender } = require("../../helpers");

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

const { SECRET_KEY } = process.env;

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = schemas.add.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw createError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const result = await User.create({
      email,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    await emailSender(verificationToken, email);
    res.status(201).json({
      user: {
        email: result.email,
        subscription: result.subscription,
      },
      message: "Verification letter sent on your email",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = schemas.add.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, "Email is wrong");
    }
    if (!user.verify) {
      throw createError(403, "Verify your email first!");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw createError(401, "Password is wrong");
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.status(200).json({
      token,
      user: {
        email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json();
  } catch (err) {
    router.get("/current", auth, async (req, res, next) => {
      try {
        const { email, subscription } = req.user;
        res.json({ email, subscription });
      } catch (err) {
        next(err);
      }
    });
    next(err);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const verificationToken = req.params;
    const user = await User.findOne(verificationToken);
    if (!user) {
      throw createError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({ message: "Verification successful" });
  } catch (err) {
    next(err);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const userEmail = req.body;
    const { error } = schemas.emailValidation.validate(userEmail);
    if (error) {
      throw createError(400, error.message);
    }
    const user = await User.findOne(userEmail);
    if (!user) {
      throw createError(404, "No user with this Email");
    }
    if (user.verify) {
      throw createError(400, "Verification has already been passed");
    }

    if (!user.verificationToken) {
      throw createError(
        404,
        "We can't verify your email, please write to support"
      );
    }
    await emailSender(user.verificationToken, user.email);
    res.json({ message: "Verification email sent" });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { path: tempDir, filename } = req.file;
      const resultDir = path.join(avatarsDir, filename);
      await fs.rename(tempDir, resultDir);
      const avatarExtention = filename.split(".").reverse();
      const avatarName = `${_id}.${avatarExtention[0]}`;
      const image = await Jimp.read(resultDir);
      await image.resize(250, 250).write(resultDir);
      const avatarURL = path.join("avatars", avatarName);
      await User.findByIdAndUpdate(_id, { avatarURL });
      res.json({ avatarURL });
    } catch (err) {
      next(err);
    }
  }
);

router.patch("/", auth, async (req, res, next) => {
  try {
    const { error } = schemas.subUpd.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }
    const { _id } = req.user;
    const { subscription } = req.body;
    const subMatch = await User.findOne({ _id, subscription });
    if (subMatch) {
      throw createError(
        409,
        `Your subscription is already: ${subMatch.subscription}`
      );
    }
    console.log(subMatch);
    const result = await User.findByIdAndUpdate(
      _id,
      { subscription },
      {
        new: true,
      }
    );
    res.json({ email: result.email, subscription: result.subscription });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
