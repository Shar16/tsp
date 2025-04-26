const Joi = require("joi");

const saveSettingsReqSchema = Joi.object({
    colorMode: Joi.string().valid("LIGHT", "DARK"),
    contrastMode: Joi.string().valid("HIGH", "LOW"),
    readingSpeed: Joi.number().integer(),
    amplitude: Joi.number().integer(),
    pauseDuration: Joi.number().integer(),
    assistantVoice: Joi.string().valid("ALICE", "BOB", "CHARLIE"),
});

module.exports = { saveSettingsReqSchema };
