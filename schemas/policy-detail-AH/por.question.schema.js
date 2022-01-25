const Joi = require('joi');

const SCHEMA_POR_QUESTION = Joi.object({
    QUESTIONCODE: Joi.string().required(),
    ANSWER: Joi.string().valid('N').required()
})

module.exports = SCHEMA_POR_QUESTION;