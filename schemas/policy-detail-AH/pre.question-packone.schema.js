const Joi = require('joi');

const SCHEMA_PRE_QUESTION_PACKONE = Joi.array().items(Joi.object({
    QUESTIONCODE: Joi.string().required(),
    ANSWER: Joi.string().required()
}))

module.exports = SCHEMA_PRE_QUESTION_PACKONE;