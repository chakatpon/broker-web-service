const Joi = require('joi');

const SCHEMA_POR_DELIVERY = Joi.object({
    PERSONTYPE:     Joi.string().required(),
    TITLENAME:      Joi.string(),        
    FIRSTNAME:      Joi.string().required(),        
    LASTNAME:       Joi.string(), 
    HOUSENO:        Joi.string().required(),  
    ADDRESSTEXT:    Joi.string(),
    MOO:            Joi.string(),     
    SOI:            Joi.string(),      
    ROAD:           Joi.string(),     
    SUBDISTRICT:    Joi.string().required(),
    DISTRICT:       Joi.string().required(), 
    PROVINCE:       Joi.string().required(), 
    ZIPCODE:        Joi.string().required()
});

module.exports = SCHEMA_POR_DELIVERY