const Joi = require('joi');

const SCHEMA_PRE_QUESTION_PH14 = Joi.object({
    QUESTIONCODE: Joi.string().valid("PH14").required(),
    ANSWER: Joi.string().valid('N').required()
})

module.exports = SCHEMA_PRE_QUESTION_PH14;