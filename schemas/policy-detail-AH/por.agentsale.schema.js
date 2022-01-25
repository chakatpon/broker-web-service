const Joi = require("joi");

const SCHEMA_POR_AGENTSALE = Joi.object({
    BROKERCODE: Joi.string().required()
})

module.exports = SCHEMA_POR_AGENTSALE