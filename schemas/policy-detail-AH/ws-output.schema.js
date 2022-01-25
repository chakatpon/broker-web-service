const Joi = require('joi');

const SCHEMA_WS_OUTPUT = Joi.object({
    STATUS:     Joi.string().required(),
    MESSAGE:    Joi.string().required()
})

module.exports = SCHEMA_WS_OUTPUT;