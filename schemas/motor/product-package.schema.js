const Joi = require('joi');

const SCHEMA_VMI_PRODUCT_PACKAGE = Joi.object({
    package_id                :Joi.string().required(),
    title                     :Joi.string(),        
    firstName                 :Joi.string().required(),        
    lastName                  :Joi.string(), 
    gender                    :Joi.string().required(),  
    identificationDocuments   :Joi.array().required(),
    nationality               :Joi.string(),     
    birthDate                 :Joi.string(),      
    occupation                :Joi.string(),
    addresses                 :Joi.array().required()
});

module.exports = SCHEMA_VMI_PRODUCT_PACKAGE