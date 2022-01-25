const Joi = require("joi");

const SCHEMA_END_GENERAL = Joi.object({
    COMP_CODE:      Joi.string().required(),
    ENDORSESERIES:  Joi.number().integer().required(),
    APPLICATIONNO:  Joi.string().required(),
    NOTIFYDATE:     Joi.date().required(),
    ISSUEDATE:      Joi.date().required(),
    EFFECTIVEDATE:  Joi.date().required(),
    EXPIRYDATE:     Joi.date().required(),
    INSURANCECLASS: Joi.string().required(),
    PLANCODE:       Joi.string().required(),
    SUBCLASS:       Joi.string().required(),
    PACKAGECODE:    Joi.string().required(),
    SURVEYORFLAG:   Joi.string().required(),
    RENEWALFLAG:    Joi.string().required(),
    STATUS:         Joi.string().required(),
    INSURED:        Joi.array().required(),
    DELIVERY:       Joi.required(),
    TAXINVOICE:     Joi.required(),
    AGENTSALE:      Joi.required(),
    PERSON:         Joi.required(),

})

module.exports = SCHEMA_END_GENERAL
