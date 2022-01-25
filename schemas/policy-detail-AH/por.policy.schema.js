const Joi = require('joi');

const SCHEMA_POR_POLICY = Joi.object({
    TRANSSTATUS:    Joi.string().required(),
    POLICYNO:       Joi.string().required(),
    ENDORSENO:      Joi.string().required()
})

module.exports = SCHEMA_POR_POLICY