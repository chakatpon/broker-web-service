const moment    = require('moment');
const Joi       = require('joi').extend(require('@joi/date'));
const today     = moment();
const tomorrow  = moment().add(1,'days');  
const yesterday = moment().add(-1, 'days');

console.log('END tomorrow : ', tomorrow)
console.log('END yesterday : ', yesterday)

const SCHEMA_PRE_GENERAL = Joi.object({
    COMP_CODE:      Joi.string().required(),
    ENDORSESERIES:  Joi.number().integer().required(),
    APPLICATIONNO:  Joi.string().required(),
    NOTIFYDATE:     Joi.date().required(),
    // ISSUEDATE:      Joi.date()
    // .format("YYYYMMDD")
    // .min(yesterday)
    // .message('"ISSUEDATE" cannot be earlier than today.')
    // .max(tomorrow)
    // .message('"ISSUEDATE" cannot be later than today.')
    // .required(),
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

module.exports = SCHEMA_PRE_GENERAL
