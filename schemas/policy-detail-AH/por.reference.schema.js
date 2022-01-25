const Joi = require('joi');

const SCHEMA_POR_REFERENCE = Joi.object({
    REFNAME: Joi.required(),
    REFNO: Joi.required()
})

module.exports = SCHEMA_POR_REFERENCE;