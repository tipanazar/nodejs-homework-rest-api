const { Schema, model } = require("mongoose");
const Joi = require("joi");

const contactSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: false }
);

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const updFavorite = Joi.object({ favorite: Joi.boolean().required() });

const schemas = {
  updFavorite,
  add: addSchema,
};

const Contact = model("contact", contactSchema);

module.exports = { Contact, schemas };
