const Joi = require('joi');

const SCHEMA_PRE_DELIVERY = Joi.object({
    PERSONTYPE:     Joi.string(),
    TITLENAME:      Joi.string(),        
    FIRSTNAME:      Joi.string(),        
    LASTNAME:       Joi.string(), 
    HOUSENO:        Joi.string(),  
    ADDRESSTEXT:    Joi.string(),
    MOO:            Joi.string(),     
    SOI:            Joi.string(),      
    ROAD:           Joi.string(),     
    SUBDISTRICT:    Joi.string(),
    DISTRICT:       Joi.string(), 
    PROVINCE:       Joi.string(), 
    ZIPCODE:        Joi.string()
});

module.exports = SCHEMA_PRE_DELIVERY