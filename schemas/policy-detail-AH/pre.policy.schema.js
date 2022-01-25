const Joi = require('joi');

const SCHEMA_PRE_POLICY = Joi.object({
    TRANSSTATUS:    Joi.string().required(),
    POLICYNO:       Joi.string().required(),
    ENDORSENO:      Joi.string().required()
})

module.exports = SCHEMA_PRE_POLICY