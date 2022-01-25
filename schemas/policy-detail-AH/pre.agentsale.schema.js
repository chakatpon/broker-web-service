const Joi = require("joi");

const SCHEMA_PRE_AGENTSALE = Joi.object({
    BROKERCODE: Joi.string().required()
})

module.exports = SCHEMA_PRE_AGENTSALE