function validateRequest(model, next, schema) {
    const options = {
        abortEarly    : false,  // include all errors
        allowUnknown  : true,   // ignore unknown props
        stripUnknown  : true,   // ignore unknown props
    };
    const { error, value } = schema.validate(model, options);
    if (error) {
      const err = {
        validationError : true,
        validationMessage : `Validation error: ${error.details.map((x) => x.message).join(", ")}`
      }
      console.log("err VReq : ", err)
      throw err
      // next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);
      // res.json(`Validation error: ${error.details.map((x) => x.message).join(", ")}`)
    } else {
      // req.body = value;
      // next();
      return value
    }
}

module.exports = validateRequest