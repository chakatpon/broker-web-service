const Joi = require('joi');

const SCHEMA_PRE_QUESTION_TAX = Joi.object({
    QUESTIONCODE: Joi.string().valid('TaxDeduct').required(),
    ANSWER: Joi.string().required()
})

module.exports = SCHEMA_PRE_QUESTION_TAX;