const Joi = require('joi');

const SCHEMA_PRE_REFERENCE = Joi.object({
    REFNAME: Joi.required(),
    REFNO: Joi.required()
})

module.exports = SCHEMA_PRE_REFERENCE;