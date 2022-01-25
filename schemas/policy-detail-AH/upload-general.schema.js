const Joi = require('joi');

const SCHEMA_GENERAL_UPLOAD = Joi.object({
    COMP_CODE:          Joi.required(),
    PREVIOUSPOLICYNO:   Joi.required(),
    POLICYNO:           Joi.required(),
    ENDORSESERIES:      Joi.required(),
})

module.exports = SCHEMA_GENERAL_UPLOAD;