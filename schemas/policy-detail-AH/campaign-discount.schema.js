const Joi = require("joi");

const SCHEMA_PRE_CAMPAIGN_DISCOUNT = Joi.object({
    CAMPAIGNCODE: Joi.string().required()
})

module.exports = SCHEMA_PRE_CAMPAIGN_DISCOUNT