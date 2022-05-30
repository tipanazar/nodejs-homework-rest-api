const express = require("express");

const router = express.Router();

const { Contact, schemas } = require("../../models/Contact");

const createError = require("../../helpers/createErr");

const { auth } = require("../../middlewares");

router.get("/", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { page, limit, favorite } = req.query;
    const favoriteVar = favorite ? { favorite: favorite } : null;
    const result = await Contact.find({ owner: _id, ...favoriteVar }, "", {
      skip: (page - 1) * limit,
      limit: limit,
    }).populate("owner", "email");
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const contactId = req.params;
    const result = await Contact.findById(contactId.id);
    if (!result) {
      throw createError(404);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const newContact = req.body;
    const { error } = schemas.add.validate(newContact);
    if (error) {
      throw createError(400, "missing required name field");
    }
    const result = await Contact.create({ ...newContact, owner: req.user._id });
    res.json(result);
  } catch (err) {
    if (err.message.includes("validaton failed")) {
      err.status = 400;
    }
    next(err);
  }
});

router.patch("/:id", auth, async (req, res, next) => {
  try {
    const contactData = req.body;
    const contactId = req.params;
    const { error } = schemas.add.validate(contactData);
    if (error) {
      throw createError(400, "missing required name field");
    }
    const result = await Contact.findByIdAndUpdate(contactId.id, contactData, {
      new: true,
    });
    if (!result) {
      throw createError(404);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/favorite", auth, async (req, res, next) => {
  try {
    const contactId = req.params;
    const bodyData = req.body;
    const { error } = schemas.updFavorite.validate(bodyData);
    if (error) {
      throw createError(400, "missing field favorite");
    }
    const result = await Contact.findByIdAndUpdate(
      contactId.id,
      { favorite: bodyData.favorite },
      { new: true }
    );
    if (!result) {
      throw createError(404);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const contactId = req.params;
    const result = await Contact.findByIdAndDelete(contactId.id);
    if (!result) {
      throw createError(404);
    }
    res.json({ message: "contact deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
