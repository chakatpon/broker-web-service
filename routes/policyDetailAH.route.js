const express               = require('express');
const router                = express.Router();
const policyDetailAH        = require('../controllers/policyDetailAH.controller');
const bigcAuthorized        = require('../_middleware/bigc-authorize');

/* POST Post-policy         */
router.post('/',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.validateInput,
            policyDetailAH.preValidate,
            policyDetailAH.policyDetailWS )

/* POST Mapping Field       */
router.post('/mapping',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.validateInput,
            policyDetailAH.preValidate,
            policyDetailAH.mapping )

/* POST Pre-Approve         */
router.post('/preApprove',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.validateInput,
            policyDetailAH.preValidate,
            policyDetailAH.policyDetailWS )

/* POST Policy-Request      */
router.post('/policyRequest',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.validateInput,
            policyDetailAH.preValidate,
            policyDetailAH.policyDetailWS )

/* POST Upload-file */
router.post('/uploadFile',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.uploadFile
)

/* POST Write-file */
router.post('/writeFile',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.test
)

/* POST Test */
router.post('/test',
            bigcAuthorized,
            // policyDetailAH.requestLog,
            policyDetailAH.test
)

module.exports = router;