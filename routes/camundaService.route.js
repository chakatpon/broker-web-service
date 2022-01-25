const express               = require('express');
const router                = express.Router();
const camundaService        = require('../controllers/camundaService.controller');

/* POST Camunda Service : prepare date for uploadFile to BigC */
router.post("/prepareToUploadFile",
                camundaService.validateInput,
                camundaService.prepareToUploadFile
)

/* POST Camunda Service : uploadFile to BigC */
router.post("/uploadFile",
                camundaService.validateInput,
                camundaService.uploadFile
)

module.exports = router;
