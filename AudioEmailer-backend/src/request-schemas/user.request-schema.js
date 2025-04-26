const Joi = require("joi");

const loginReqSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const registerReqSchema = Joi.object({
    name: Joi.string().default("Anonymous"),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

module.exports = { loginReqSchema, registerReqSchema };
