const Joi = require('joi');

const SCHEMA_PREPARE_UPLOAD = Joi.object({
    searchpattern:          Joi.required(),
    OrganizationCode:       Joi.required(),
    RefDocType:             Joi.required(),
    RefDocId:               Joi.required(),
    AppName:                Joi.required(),
    sortby:                 Joi.required()
})

module.exports = SCHEMA_PREPARE_UPLOAD;