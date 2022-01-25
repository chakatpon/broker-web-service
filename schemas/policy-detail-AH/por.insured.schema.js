const Joi = require("joi");

const SCHEMA_POR_INSURED = Joi.object({
    PERSONTYPE:     Joi.string().required(),
    TITLENAME:      Joi.string().required(),
    FIRSTNAME:      Joi.string().required(),
    IDCARDTYPE:     Joi.string().required(),
    IDCARDNO:       Joi.string().required(),
    // MOBILE1:        Joi.string().required(),
    HOUSENO:        Joi.string().required(),
    SUBDISTRICT:    Joi.string().required(),
    DISTRICT:       Joi.string().required(),
    PROVINCE:       Joi.string().required(),
    ZIPCODE:        Joi.string().required()
})

module.exports = SCHEMA_POR_INSURED;