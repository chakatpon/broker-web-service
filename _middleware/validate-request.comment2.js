function validateRequest(model, schema) {
    const options = {
        abortEarly: false,      // include all errors
        allowUnknown: true,     // ignore unknown props
        stripUnknown: true,     // ignore unknown props
    };
    const { error, value } = schema.validate(model, options);
    if (error) {
        console.log('error : ', error)
        return error
        // throw error
        
    } else {
        return value
    }
}

module.exports = validateRequest