const Joi = require('joi');

const SCHEMA_POR_PERSON = Joi.object({
    PS_SEQNO:           Joi.number().integer().required(),
    PS_INSUREDTYPE:     Joi.required(),
    PS_TITLENAME:       Joi.required(),
    PS_FIRSTNAME:       Joi.required(),
    PS_LASTNAME:        Joi.required(),
    PS_GENDER:          Joi.required(),
    PS_BIRTHDATE:       Joi.required(),
    PS_AGE:             Joi.number().integer().required(),
    PS_IDCARDTYPE:      Joi.required(),
    PS_IDCARDNO:        Joi.required(),
    PS_TAXID:           Joi.required(),
    PS_OCCUPATION:      Joi.required(),
    PS_OCCUPATIONCLASS: Joi.required(),
    PS_NATIONALITY:     Joi.required(),
    PS_HOUSENO:         Joi.required(),
    PS_SUBDISTRICT:     Joi.required(),
    PS_DISTRICT:        Joi.required(),
    PS_PROVINCE:        Joi.required(),
    PS_ZIPCODE:         Joi.required(),
    PS_SUMINSURE:       Joi.number().required(),
    PS_GROSSPREM:       Joi.number().required(),
    PS_PERILPREM:       Joi.number().required(),
    PS_NETGROSSPREM:    Joi.number().required(),
    
});

module.exports = SCHEMA_POR_PERSON;