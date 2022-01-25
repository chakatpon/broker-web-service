const Joi = require('joi');

const SCHEMA_PRE_TAX_OUTPUT = Joi.object({
    TAXITEMNO:      Joi.number().integer().required(),
    TAXINVOICENO:   Joi.string().required(),
    DOCUMENTNO:     Joi.string().required(),
})

module.exports = SCHEMA_PRE_TAX_OUTPUT;