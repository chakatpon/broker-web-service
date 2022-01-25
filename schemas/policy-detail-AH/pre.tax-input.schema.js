const Joi = require("joi");

const SCHEMA_PRE_TAX_INPUT = Joi.object({
    TAXITEMNO:          Joi.number().integer().required(),
    TAXINVOICENO:       Joi.required(),
    DOCUMENTNO:         Joi.required(),
    DOCUMENTDATE:       Joi.date().required(),
    PERSONTYPE:         Joi.required(),
    TITLENAME:          Joi.required(),
    FIRSTNAME:          Joi.required(),
    LASTNAME:           Joi.required(),
    IDCARDTYPE:         Joi.required(),
    IDCARDNO:           Joi.required(),
    COMPVATBRCODE:      Joi.required(),
    HOUSENO:            Joi.required(),
    ADDRESSTEXT:        Joi.required(),
    MOO:                Joi.required(),
    SOI:                Joi.required(),
    ROAD:               Joi.required(),
    SUBDISTRICT:        Joi.required(),
    DISTRICT:           Joi.required(),
    PROVINCE:           Joi.required(),
    ZIPCODE:            Joi.required(),
    SUMINSURED:         Joi.number(),
    NETGROSSPREMIUM:    Joi.number(),
    DUTY:               Joi.number(),
    TAX:                Joi.number(),
    TOTALAMOUNT:        Joi.number(),
    PREMIUMWHT1FLAG:    Joi.required(),
    PREMIUMWHT1NO:      Joi.required(),
    PREMIUMWHT1DATE:    Joi.required(),
    PREMIUMWHT1AMT:     Joi.required(),
    PREMIUMWHT1NET:     Joi.required(),
    PAYMENTPROCESSFLAG: Joi.required(),

});

module.exports = SCHEMA_PRE_TAX_INPUT;