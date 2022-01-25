const Joi = require('joi');

const SCHEMA_VMI_ADDRESS = Joi.object({
    type                      :Joi.string().required(),
    addressLine1              :Joi.string().required(),
    district                  :Joi.string().required()

});

module.exports = SCHEMA_VMI_ADDRESS