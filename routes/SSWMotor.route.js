const express           = require('express');
const router            = express.Router();
const SSWMotor          = require('../controllers/SSWMotor.controller')
const sswAuthorized     = require('../_middleware/ssw-authorize')

/* POST Policy-Motor-WS */
router.post('/',
            // sswAuthorized,
            // SSWMotor.requestLog,
            SSWMotor.preMappingStore,
            SSWMotor.productGroupValidate,
            SSWMotor.effectiveDateValidate,
            SSWMotor.expiredDateValidate,
            SSWMotor.carMakeValidate,
            SSWMotor.carModelValidate,
            SSWMotor.ocupationValidate,
            SSWMotor.insuredLocationValidate,
            SSWMotor.currentLocationValidate,
            SSWMotor.payerLocationValidate,
            SSWMotor.currentPayerLocationValidate,            
            SSWMotor.policyMotorWS)

/* POST Mapping-filed */
router.post('/mapping',
            // sswAuthorized,
            // SSWMotor.requestLog,
            SSWMotor.preMappingStore,
            SSWMotor.productGroupValidate,
            SSWMotor.effectiveDateValidate,
            SSWMotor.expiredDateValidate,
            SSWMotor.carMakeValidate,
            SSWMotor.carModelValidate,
            SSWMotor.ocupationValidate,
            SSWMotor.insuredLocationValidate,
            SSWMotor.currentLocationValidate,
            SSWMotor.payerLocationValidate,
            SSWMotor.currentPayerLocationValidate,             
            SSWMotor.mapping)

router.get('/running',
            // sswAuthorized,
            SSWMotor.running
            )

module.exports = router