function validateRequest(req, next, schema) {
    const options = {
        abortEarly    : false,  // include all errors
        allowUnknown  : true,   // ignore unknown props
        stripUnknown  : true,   // ignore unknown props
    };
    const { error, value } = schema.validate(req, options);
    if (error) {

      next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
    } else {
      req.body = value;
      next();
    }
}

module.exports = validateRequest