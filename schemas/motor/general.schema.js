const Joi = require('joi');

const SCHEMA_GENERAL = Joi.object({
    agentCode                               : Joi.string().required(),                           
    saleName                                : Joi.string().required(),                            
})

module.exports = SCHEMA_GENERAL