const Joi = require('joi');

const SCHEMA_PRE_QUESTION_PA06 = Joi.object({
    QUESTIONCODE: Joi.string().valid("PA06").required(),
    ANSWER: Joi.string().valid('N').required().error(errors => {
        console.log('question error : ', errors)
        errors.forEach(err => {
          switch (err.code) {
            case "any.only":
              err.message = "ไม่ผ่าน เงื่อนไขคำถามสุขภาพ";
              break;
            default:
              break;
          }
        });
        return errors;
      })
})

module.exports = SCHEMA_PRE_QUESTION_PA06;