const Joi = require('joi');

const SCHEMA_PRE_QUESTION_PH15 = Joi.object({
    QUESTIONCODE: Joi.string().valid("PH15").required(),
    ANSWER: Joi.string().valid('N').required()
})

module.exports = SCHEMA_PRE_QUESTION_PH15;