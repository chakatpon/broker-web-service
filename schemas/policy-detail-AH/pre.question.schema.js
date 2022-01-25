const Joi = require('joi');

const SCHEMA_PRE_QUESTION = Joi.object({
    QUESTIONCODE: Joi.string().required(),
    ANSWER: Joi.string().valid('N').required()
})

module.exports = SCHEMA_PRE_QUESTION;