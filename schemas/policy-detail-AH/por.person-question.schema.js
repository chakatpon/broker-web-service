const Joi = require('joi');

const SCHEMA_POR_PERSON_QUESTION = Joi.object({
    PERSON_ID:      Joi.number().integer().required(),
    QUESTION_ID:    Joi.number().integer().required()
})

module.exports = SCHEMA_POR_PERSON_QUESTION;