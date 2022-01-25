const Joi = require('joi');

const SCHEMA_PRE_QUESTION_PH09 = Joi.object({
    QUESTIONCODE: Joi.string().valid("PH09").required(),
    ANSWER: Joi.string().valid('N').required()
})

module.exports = SCHEMA_PRE_QUESTION_PH09;