const axios                     = require('axios')                                                  ;
const redis                     = require('redis')
const moment                    = require('moment')                                                 ;
const validateRequest           = require("../_middleware/validate-request")                        ;
const fileLibrarySearch         = require("../libs/service.fileLibrarySearch")                      ;
const postPolicyPDF             = require("../libs/service.postPolicyPDF")                          ;
const environment               = require("../configs/environment.json")    

/* import schema */
const SCHEMA_PREPARE_UPLOAD     = require('../schemas/policy-detail-AH/upload-prepare.schema')      ;

// Connect to our Database
var bigcClient = redis.createClient({
    port      : environment.BIGC_PORT,
    host      : environment.BIGC_HOST
  });


exports.validateInput = (req, res, next) => {
    console.log("camunda Request Body: ", req.body)
    // validateRequest(req.body, next, SCHEMA_PREPARE_UPLOAD);
    // let mappingBody = {
    //     searchpattern     : "",
    //     OrganizationCode  : "viriyahdev",
    //     RefDocType        : "",
    //     RefDocId          : req.body.policyNumber,
    //     AppName           : "PolicyUnsigned",
    //     sortby            : ""
    // }
    // req.body = mappingBody;
    next();
}

exports.uploadFile = (req, res, next) => {
    const data                          = {
        searchpattern     : "",
        OrganizationCode  : "viriyahdev",
        RefDocType        : "",
        RefDocId          : req.body.policyNumber,
        applicationNo     : req.body.applicationNo,
        referenceCode     : req.body.referenceCode,
        AppName           : "PolicyUnsigned",
        sortby            : ""
    };
    console.log("uploadFile req.body : ", req.body)
    console.log("req.body.policyNumber : ", req.body.policyNumber )
    console.log("req.body.applicationNo : ",req.body.applicationNo)
    console.log("req.body.referenceCode : ", req.body.referenceCode)
    console.log("upload aata : ", data)
    bigcClient.hgetall(req.body.referenceCode, function (redis_err, value) {
        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
        bigcClient.hmset(req.body.policyNumber,  "ECM_REQUEST", JSON.stringify(data),  "UPDATED_DATE", updatedDate)
        if(redis_err) {
            console.log("uploadFile redis_err : ", redis_err)
            console.log("req.body.policyNumber : ", req.body.policyNumber )
            console.log("req.body.applicationNo : ",req.body.applicationNo)
            console.log("req.body.referenceCode : ", req.body.referenceCode)
            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            bigcClient.hmset(req.body.policyNumber,  "REDIS_ERROR", redis_err,  "UPDATED_DATE", updatedDate)
            res.json({
                STATUS      : "ERROR",
                MESSAGE     : redis_err,
                POLICY      : {
                    TRANSSTATUS : "DC",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            })
        }else if(value) {
            console.log("uploadFile redis value : ", value)
            console.log("req.body.policyNumber : ", req.body.policyNumber )
            console.log("req.body.applicationNo : ",req.body.applicationNo)
            console.log("req.body.referenceCode : ", req.body.referenceCode)                 
            const effectiveDate = value.EFFECTIVEDATE
            const general                 = {
               COMP_CODE               : "2037",
               PREVIOUSPOLICYNO        : "",
               POLICYNO                : req.body.policyNumber,
               ENDORSESERIES           : 0,
               EFFECTIVEDATE           : effectiveDate,
           } 

       /* FILE LIBRARY GET FILE */
       setTimeout(function Retard(params) {
            fileLibrarySearch(data)
               .then(res_x => {
                   // console.log("res_x : ", res_x)
                   const policyDocument            = res_x
                   general['POLICYDOCUMENT']       = policyDocument;
                   const finalGeneral              = general
                   let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                   bigcClient.hmset(req.body.policyNumber,  "ECM_RESPONSE", JSON.stringify(finalGeneral),  "UPDATED_DATE", updatedDate)
                   postPolicyPDF(finalGeneral)
                       .then(res_y => {
                           console.log("post policy PDF res_y : ", res_y)
                           let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                           bigcClient.hmset(req.body.policyNumber,  "POST_PDF_SUCCESS", JSON.stringify(res_y),  "UPDATED_DATE", updatedDate)
                           res.json({
                               STATUS      : "SUCCESS",
                               MESSAGE     : "",
                               POLICY      : {
                                   TRANSSTATUS : "PC",
                                   POLICYNO    : req.body.policyNumber,
                                   ENDORSENO   : ""
                                   },
                               TAXINVOICE: [{
                                   TAXITEMNO       : 1,
                                   TAXINVOICENO    : "",
                                   DOCUMENTNO      : ""

                               }]
                           })
                       })
                       .catch(err_y => {
                           if(err_y.MESSAGE) {
                            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(req.body.policyNumber,  "POST_PDF_ERROR", err_y.MESSAGE,  "UPDATED_DATE", updatedDate)
                               res.json({
                                   STATUS      : "ERROR MESSAGE",
                                   MESSAGE     : err_y.MESSAGE,
                                   POLICY      : {
                                       TRANSSTATUS : "D",
                                       POLICYNO    : req.body.policyNumber,
                                       ENDORSENO   : ""
                                       },
                                   TAXINVOICE: []
                               })

                           }else if(err_y.Message) {
                            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(req.body.policyNumber,  "POST_PDF_ERROR", err_y.Message,  "UPDATED_DATE", updatedDate)
                               res.json({
                                   STATUS      : "ERROR Message",
                                   MESSAGE     : err_y.Message,
                                   POLICY      : {
                                       TRANSSTATUS : "D",
                                       POLICYNO    : req.body.policyNumber,
                                       ENDORSENO   : ""
                                       },
                                   TAXINVOICE: []
                               })
                           }else {
                            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(req.body.policyNumber,  "POST_PDF_ERROR", JSON.stringify(err_y),  "UPDATED_DATE", updatedDate)
                               res.json({
                                   STATUS      : "ERROR default",
                                   MESSAGE     : err_y,
                                   POLICY      : {
                                       TRANSSTATUS : "D",
                                       POLICYNO    : req.body.policyNumber,
                                       ENDORSENO   : ""
                                       },
                                   TAXINVOICE: []
                               })
                           }

                       })
               }).catch(err_x => {
                   let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                   bigcClient.hmset(req.body.policyNumber,  "ECM_ERROR", JSON.stringify(err_x),  "UPDATED_DATE", updatedDate)
                   console.log("uploadFile err_x : ", err_x)
                   res.json(err_x)
               })
            }, 60000)
        }else {
            console.log("else uploadFile redis value        : ", value)
            console.log("else req.body.policyNumber         : ", req.body.policyNumber )     
            res.json({
                STATUS      : "ERROR",
                MESSAGE     : `ไม่พบเอกสาร ${req.body.policyNumber}`,
                POLICY      : {
                    TRANSSTATUS : "DC",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            })
        }

        });
}

exports.prepareToUploadFile = (req, res, next) => {
    const data                    = req.body;
    console.log("prepareToUploadFile req.body : ", req.body)
    console.log("req.body.applicationNo : ",req.body.applicationNo)
    console.log("req.body.referenceCode : ", req.body.referenceCode)
    bigcClient.hgetall(req.body.referenceCode, function (redis_err, value) {
        if(redis_err) {
            res.json({
                STATUS      : "ERROR",
                MESSAGE     : redis_err,
                POLICY      : {
                    TRANSSTATUS : "DC",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            })
        }else if (value) {
            console.log("prepareToUploadFile value : ", value)
            const effectiveDate = value.EFFECTIVEDATE
    
            const general                 = {
                    COMP_CODE               : "2037",
                    PREVIOUSPOLICYNO        : "",
                    POLICYNO                : req.body.policyNumber,
                    ENDORSESERIES           : 0,
                    EFFECTIVEDATE           : effectiveDate,
                }  
    
        /* FILE LIBRARY GET FILE FOR PREPARE TO UPLOAD START*/
        setTimeout(function Retard(params) {
                    fileLibrarySearch(data)
                    .then(res_x => {
                        console.log("res_x : ", res_x)
                        const policyDocument = res_x
                        general['POLICYDOCUMENT']    = policyDocument;
                        res.json(general);
                    })
        }, 10000)
        // fileLibrarySearch(data)
        // .then(res_x => {
        //     // console.log("res_x : ", res_x)
        //     const policyDocument = res_x
        //     general['POLICYDOCUMENT']    = policyDocument;
        //     res.json(general);
        // })
        
        /* FILE LIBRARY GET FILE FOR PREPARE TO UPLOAD END*/
        }else {
            res.json({
                STATUS      : "ERROR",
                MESSAGE     : `ไม่พบเอกสาร ${req.body.policyNumber}`,
                POLICY      : {
                    TRANSSTATUS : "DC",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            })
        }
    })
}

function fileSearchTest(res, data ,general) {
    fileLibrarySearch(data)
        .then(res_x => {
            // console.log("res_x : ", res_x)
            const policyDocument = res_x
            general['POLICYDOCUMENT']    = policyDocument;
            res.json(general);
        })
}

// GET FILE and convert to BASE64.
function getBase64(url) {
    return axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
  }
