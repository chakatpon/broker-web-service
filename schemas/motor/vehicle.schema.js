const Joi = require('joi');

const SCHEMA_VMI_VEHICLE = Joi.object({
    make                            : Joi.string().required(),                           
    model                           : Joi.string().required(),                            
    usage                           : Joi.string().required(),                         
    garageType                      : Joi.string().required(),                            
    vehicleIdentificationNumber     : Joi.string(),           
    registrationNumber              : Joi.string(),                            
    registrationState               : Joi.string(),                           
    yearOfManufacture               : Joi.string(),
    yearOfRegistration              : Joi.string(),                            
    engineNumber                    : Joi.string(),                         
    numberOfSeats                   : Joi.number().integer().required(),
    engineSize                      : Joi.number().integer(),
    load                            : Joi.number().integer() 
})

module.exports = SCHEMA_VMI_VEHICLE