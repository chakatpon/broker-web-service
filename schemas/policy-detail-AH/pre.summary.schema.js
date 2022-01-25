const Joi = require('joi');

const SCHEMA_PRE_SUMMARY = Joi.object({

    NETGROSSPREMIUM:    Joi.number(),
    DUTY:               Joi.number(),
    TAX:                Joi.number(),
    TOTALAMOUNT:        Joi.number(),
    AF_NETGROSSPREMIUM: Joi.number(),
    AF_DUTY:            Joi.number(),
    AF_TAX:             Joi.number(),
    AF_TOTALPREMIUM:    Joi.number(),

});

module.exports = SCHEMA_PRE_SUMMARY