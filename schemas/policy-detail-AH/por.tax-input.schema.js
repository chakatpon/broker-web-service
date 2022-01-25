const Joi = require("joi");

const SCHEMA_POR_TAX_INPUT = Joi.object({
    TAXITEMNO:          Joi.number().integer().required(),
    TAXINVOICENO:       Joi.required(),
    DOCUMENTNO:         Joi.required(),
    DOCUMENTDATE:       Joi.date().required(),
    PERSONTYPE:         Joi.string().required(),
    TITLENAME:          Joi.string().required(),
    FIRSTNAME:          Joi.string().required(),
    LASTNAME:           Joi.required(),
    IDCARDTYPE:         Joi.required(),
    IDCARDNO:           Joi.string().required(),
    COMPVATBRCODE:      Joi.required(),
    HOUSENO:            Joi.string().required(),
    ADDRESSTEXT:        Joi.required(),
    MOO:                Joi.required(),
    SOI:                Joi.required(),
    ROAD:               Joi.required(),
    SUBDISTRICT:        Joi.string().required(),
    DISTRICT:           Joi.string().required(),
    PROVINCE:           Joi.string().required(),
    ZIPCODE:            Joi.string().required(),
    SUMINSURED:         Joi.number().integer().required(),
    NETGROSSPREMIUM:    Joi.number().integer().required(),
    DUTY:               Joi.number().integer().required(),
    TAX:                Joi.number().integer().required(),
    TOTALAMOUNT:        Joi.number().integer().required(),
    PREMIUMWHT1FLAG:    Joi.required(),
    PREMIUMWHT1NO:      Joi.required(),
    PREMIUMWHT1DATE:    Joi.required(),
    PREMIUMWHT1AMT:     Joi.required(),
    PREMIUMWHT1NET:     Joi.required(),
    PAYMENTPROCESSFLAG: Joi.required(),

});

module.exports = SCHEMA_POR_TAX_INPUT;