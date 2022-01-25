const Joi = require("joi");

const SCHEMA_POR_GENERAL = Joi.object({
    COMP_CODE:      Joi.string().required(),
    ENDORSESERIES:  Joi.number().integer().required(),
    APPLICATIONNO:  Joi.string().required(),
    NOTIFYDATE:     Joi.date().required(),
    EFFECTIVEDATE:  Joi.date().required(),
    EXPIRYDATE:     Joi.date().required(),
    AGREEMENTDATE:  Joi.date().required(),
    INSURANCECLASS: Joi.string().required(),
    PLANCODE:       Joi.string().required(),
    SUBCLASS:       Joi.string().required(),
    PACKAGECODE:    Joi.string().required(),
    SURVEYORFLAG:   Joi.string().required(),
    RENEWALFLAG:    Joi.string().required(),
    STATUS:         Joi.string().required(),
    INSURED:        Joi.required(),
    DELIVERY:       Joi.required(),
    TAXINVOICE:     Joi.required(),
    AGENTSALE:      Joi.required(),
    PERSON:         Joi.required(),
    POLICYPRINTBY:  Joi.required(),
    CHANNEL:        Joi.required()

})

module.exports = SCHEMA_POR_GENERAL
