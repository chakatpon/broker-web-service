const Joi = require('joi');

const SCHEMA_PRE_QUESTION_PH16 = Joi.object({
    QUESTIONCODE: Joi.string().valid("PH16").required(),
    ANSWER: Joi.string().valid('N').required()
})

module.exports = SCHEMA_PRE_QUESTION_PH16;