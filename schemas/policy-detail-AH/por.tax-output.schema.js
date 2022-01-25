const Joi = require('joi');

const SCHEMA_POR_TAX_OUTPUT = Joi.object({
    TAXITEMNO:      Joi.number().integer().required(),
    TAXINVOICENO:   Joi.string().required(),
    DOCUMENTNO:     Joi.string().required(),
})

module.exports = SCHEMA_POR_TAX_OUTPUT;