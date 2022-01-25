const express           = require('express');
const router            = express.Router();
const motor             = require('../controllers/motor.controller')
const sswAuthorized     = require('../_middleware/ssw-authorize')

/* POST Policy-Motor-WS */
router.post('/',
            
            motor.preMappingStore,
            motor.productGroupValidate,
            motor.effectiveDateValidate,
            motor.expiredDateValidate,
            motor.carMakeValidate,
            motor.carModelValidate,
            motor.ocupationValidate,
            motor.insuredLocationValidate,
            motor.currentLocationValidate,
            motor.payerLocationValidate,
            motor.currentPayerLocationValidate,            
            motor.policyMotorWS)

/* POST Mapping-filed */
router.post('/mapping',
            
            motor.preMappingStore,
            motor.productGroupValidate,
            motor.effectiveDateValidate,
            motor.expiredDateValidate,
            motor.carMakeValidate,
            motor.carModelValidate,
            motor.ocupationValidate,
            motor.insuredLocationValidate,
            motor.currentLocationValidate,
            motor.payerLocationValidate,
            motor.currentPayerLocationValidate,             
            motor.mapping)

router.get('/running',
            
            motor.running
            )

module.exports = router