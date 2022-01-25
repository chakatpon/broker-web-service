const Joi = require('joi');

const SCHEMA_PRE_RISK = Joi.object({
    ROUTE:           Joi.required(),
    TRAVEL_FROM:     Joi.required(),
    TRAVEL_TO:       Joi.required(),
    SURVEYIMAGEFLAG: Joi.required(),
})

module.exports = SCHEMA_PRE_RISK;