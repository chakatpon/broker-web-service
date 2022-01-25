const axios                     = require('axios')                                                              ;
const redis                     = require('redis')                                                              ;
const moment                    = require('moment')                                                             ;
const locationMapping           = require("../mocking/BIGC_LOCATION_MAPPING.json")                              ;
const occupationMapping         = require("../mocking/OCCUPATION_MASTER_CONFIRM.json")                          ;
const idCardTypeMapping         = require("../mocking/TYPE_MAPPING.json").IDCardType                            ;
const personTypeMapping         = require("../mocking/TYPE_MAPPING.json").PersonType                            ;
const prefixMapping             = require("../mocking/BIGC_PREFIX.json").Prefix                                ;
const insuredStatusMapping      = require("../mocking/TYPE_MAPPING.json").InsuredStatusCode                     ;
const forbiddenOccupationPH     = require("../mocking/FORBIDDEN_OCCUPATION_PA.json")                            ;
const forbiddenOccupationPA     = require("../mocking/FORBIDDEN_OCCUPATION_PH.json")                            ;
const Relationships             = require('../mocking/Relationship.json').Relationship                          ;
const fs                        = require('fs')                                                                 ;
const path                      = require('path')                                                               ;

const environment               = require("../configs/environment.json")                                        ;

const cancelPolicyEND           = require("../libs/service.cancelPolicyEND")                                    ;
const cancelPolicyEDR           = require("../libs/service.cancelPolicyEDR")                                    ;
const postAttachFile            = require('../libs/service.postAttachFile')                                     ;
const postPreValidate           = require('../libs/service.postPreValidate')                                    ;
const validateRequest           = require('../_middleware/validate-request')                                    ;
const validateIssueDate         = require("../_middleware/validate-issuadate")                                  ;
const fileLibrarySearch         = require("../libs/service.fileLibrarySearch")                                  ;
const fileLibraryGetfile        = require('../libs/service.fileLibraryGetfile')                                 ;
const postIssuancePolicy        = require('../libs/service.postIssuancePolicy')                                 ;

/* PRE_SCHEMAS */
const SCHEMA_PRE_RISK               = require('../schemas/policy-detail-AH/pre.risk.schema')                    ;
const SCHEMA_PRE_PERSON             = require('../schemas/policy-detail-AH/pre.person.schema')                  ;
const SCHEMA_PRE_SUMMARY            = require('../schemas/policy-detail-AH/pre.summary.schema')                 ;
const SCHEMA_PRE_GENERAL            = require('../schemas/policy-detail-AH/pre.general.schema')                 ;
const SCHEMA_PRE_INSURED            = require('../schemas/policy-detail-AH/pre.insured.schema')                 ;
const SCHEMA_PRE_DELIVERY           = require('../schemas/policy-detail-AH/pre.delivery.schema')                ;
const SCHEMA_PRE_QUESTION           = require('../schemas/policy-detail-AH/pre.question.schema')                ;
const SCHEMA_PRE_QUESTION_PA06      = require('../schemas/policy-detail-AH/pre.question-PA06.schema')
const SCHEMA_PRE_QUESTION_PH09      = require('../schemas/policy-detail-AH/pre.question-PH09.schema')
const SCHEMA_PRE_QUESTION_PH14      = require('../schemas/policy-detail-AH/pre.question-PH14.schema')
const SCHEMA_PRE_QUESTION_PH15      = require('../schemas/policy-detail-AH/pre.question-PH15.schema')
const SCHEMA_PRE_QUESTION_PH16      = require('../schemas/policy-detail-AH/pre.question-PH16.schema')           ;
const SCHEMA_PRE_QUESTION_TAX       = require('../schemas/policy-detail-AH/pre.question-tax.schema')            ;
const SCHEMA_PRE_QUESTION_PACKONE   = require('../schemas/policy-detail-AH/pre.question-packone.schema')        ;
const SCHEMA_PRE_AGENTSALE          = require('../schemas/policy-detail-AH/pre.agentsale.schema')               ;
const SCHEMA_PRE_TAX_INPUT          = require('../schemas/policy-detail-AH/pre.tax-input.schema')               ;

/* POR_SCHEMAS */
const SCHEMA_POR_RISK               = require('../schemas/policy-detail-AH/por.risk.schema')                    ;
const SCHEMA_POR_PERSON             = require('../schemas/policy-detail-AH/por.person.schema')                  ;
const SCHEMA_POR_SUMMARY            = require('../schemas/policy-detail-AH/por.summary.schema')                 ;
const SCHEMA_POR_GENERAL            = require('../schemas/policy-detail-AH/por.general.schema')                 ;
const SCHEMA_POR_INSURED            = require('../schemas/policy-detail-AH/por.insured.schema')                 ;
const SCHEMA_POR_DELIVERY           = require('../schemas/policy-detail-AH/por.delivery.schema')                ;
const SCHEMA_POR_QUESTION           = require('../schemas/policy-detail-AH/por.question.schema')                ;
const SCHEMA_POR_QUESTION_PA06      = require('../schemas/policy-detail-AH/por.question-PA06.schema')           ;
const SCHEMA_POR_QUESTION_TAX       = require('../schemas/policy-detail-AH/por.question-tax.schema')            ;
const SCHEMA_POR_QUESTION_PACKONE   = require('../schemas/policy-detail-AH/por.question-packone.schema')        ;
const SCHEMA_POR_AGENTSALE          = require('../schemas/policy-detail-AH/por.agentsale.schema')               ;
const SCHEMA_POR_TAX_INPUT          = require('../schemas/policy-detail-AH/por.tax-input.schema')               ;

/* END_SCHEMAS */
const SCHEMA_END_GENERAL            = require('../schemas/policy-detail-AH/end.general.schema')                 ;
const elasticsearch                 = require('elasticsearch')                                                  ;
const bigcLogClient                 = new elasticsearch.Client({ host: '10.99.4.80:9200', log: 'trace' })

var bigcClient = redis.createClient({
    port      : environment.BIGC_PORT,
    host      : environment.BIGC_HOST
  });

exports.test = (req, res, next) => {
    var parentPath      = path.resolve(__dirname, '..' ,'fileshare')
    // res.json("I wrote thousand thousands lines just for find only one perfect line.")
    res.json(parentPath)

}

exports.requestLog = (req, res, next) => {
    bigcLogClient.transport.request({
        method: 'PUT',
        path: `/viriyah-bigc/_doc/${req.body.APPLICATIONNO}`,  
        settings: {
            index: {
                "sort.field": "post_date", 
                "sort.order": "desc"  
              }
          },
        mappings: {
            properties: {
              post_date: {
                type: "date",
              }
            }
          },
        body: {
            "post_date": new Date(),
            ...req.body
          } ,
        ignore: [404]
      }, (err, body, statusCode, headers) => {
        if (err) {
            console.log(err)
            next();
        }
        console.log('ECS PUT statusCode : ', statusCode)
        console.log('ECS PUT body       : ', body)
        next();
      })
}

exports.policyDetailWS = (req, res, next) => {
    /* STATUS CATEGORIZE */
    const status = req.body.STATUS
    switch(status) {
        case "PRE":
            // Applicaiton to Pre-approve.
            this.preApprove(req, res, next)
            break;
        case "APR":
            // Application Request.
            res.json({ 
                        STATUS: "ERROR",
                        MESSAGE: `Application Request Service for ${status} Status is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            break;
        case "APU":
            // Applicatoin Update.
            res.json({ 
                        STATUS: "ERROR",
                        MESSAGE: `Application Request Service for ${status} Status is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            break;
        case "APS":
            // Application Survey.
            res.json({ 
                        STATUS: "ERROR",
                        MESSAGE: `Application Request Service for ${status} Status is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            break;
        case "POR":
            // Policy Request.
            this.policyRequest(req, res, next)
            break;
        case "END":
            // Cancel Request.
            this.cancelPolicyEND(req, res, next)
            break;
        case "EDR":
            // Endorsement Request.
            this.cancelPolicyEDR(req, res, next)
            break;
        case "POU":
            // Policy Update 
            res.json({ 
                        STATUS: "ERROR",
                        MESSAGE: `Application Request Service for ${status} Status is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            break;
        default:
            res.json({ 
                        STATUS: "ERROR",
                        MESSAGE: `Application Request Service for ${status} Status is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            // Do something for default case.
    }
}

exports.preApprove = (req, res, next) => {
    const mapping               = dataMapping(res, req);
    const validData             = JSON.stringify(mapping);
    const params                = JSON.stringify(req.body);
    const applicationNo         = req.body.APPLICATIONNO;

    // POST PRE-Validate Start
    postPreValidate(mapping)
    .then(res_x => {
        if(res_x.status){
            let createdDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            bigcClient.hmset(applicationNo, 'PRE_PARAMS', params, "EFFECTIVEDATE", req.body.EFFECTIVEDATE,  "PRE_MAPPING", validData, "PRE_SUCCESS", true, "CREATED_DATE", createdDate)
                // Store data to REDIS Start.
                bigcClient.hgetall(applicationNo, function (err, value) {
                    if(err) {
                        res.json({
                            STATUS      : "ERROR",
                            MESSAGE     : err,
                            POLICY      : {
                                TRANSSTATUS : "D",
                                POLICYNO    : "",
                                ENDORSENO   : ""
                                },
                            TAXINVOICE: []
                        })
                    }else if(!value || !value.PRE_SUCCESS || !value.ATTACH_SUCCESS || value.EXPIRED){
                        const attachParams = {
                            COMP_CODE           : req.body.COMP_CODE,
                            PREVIOUSPOLICYNO    : "",
                            APPLICATIONNO       : applicationNo
                        }
                        const token             = res_x.token
                        const paymentInfo       = mapping.PaymentCode
                        const referenceCode     = mapping.ReferenceCode
                        const policyIssuance    = {
                            token           :   token,
                            paymentInfo     :   paymentInfo,
                            referenceCode   :   referenceCode
                        }
                        
                        if(value && value.CREATED_DATE){
                            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(applicationNo, 'PRE_PARAMS', params, "EFFECTIVEDATE", req.body.EFFECTIVEDATE,  "PRE_MAPPING", validData, "PRE_SUCCESS", true, "TOKEN", token, "UPDATED_DATE", updatedDate)
                        }else {
                            let createdDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(applicationNo, 'PRE_PARAMS', params, "EFFECTIVEDATE", req.body.EFFECTIVEDATE,  "PRE_MAPPING", validData, "PRE_SUCCESS", true, "TOKEN", token, "CREATED_DATE", createdDate)
                        }
                        
                        
                        /* POST Attach-File Start */
                        postAttachFile(attachParams)
                        .then(res_y => {

                            /* SET Data to Redis Storage */
                            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(applicationNo, 'PRE_PARAMS', params, "ATTACH_PARAMS", JSON.stringify(attachParams), "ATTACH_FILES", JSON.stringify(res_y), "ATTACH_SUCCESS", true, "UPDATED_DATE", updatedDate);
                            let policyDocuments = res_y.POLICYDOCUMENT
                            policyDocuments.forEach(policyDocument => {
                                makeTextFile(policyDocument.BINCODE, applicationNo, policyDocument.FILENAME)
                            })
                            res.json({
                                STATUS      : res_y.STATUS,
                                MESSAGE     : "",
                                POLICY      : {
                                    TRANSSTATUS : "A",
                                    POLICYNO    : "",
                                    ENDORSENO   : ""
                                    },
                                TAXINVOICE: []
                            })

                        }).catch(err_y => {
                            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                            bigcClient.hmset(applicationNo,'PRE_PARAMS', params, "ATTACH_ERROR", err_y.MESSAGE, "UPDATED_DATE", updatedDate);
                            res.json({
                                STATUS      : err_y.STATUS,
                                MESSAGE     : `${err_y.MESSAGE} ATTACH สำหรับ APPLICATIONNO: ${applicationNo}`,
                                POLICY      : {
                                    TRANSSTATUS : "D",
                                    POLICYNO    : "",
                                    ENDORSENO   : ""
                                    },
                                TAXINVOICE: []

                            })
                        })

                        /* POST Attach-File End */

                    }else {
                        res.json({
                            STATUS      : "SUCCESS",
                            MESSAGE     : `APPLICATIONNO: ${applicationNo} already has been pre-approved.`,
                            POLICY      : {
                                TRANSSTATUS : "A",
                                POLICYNO    : "",
                                ENDORSENO   : ""
                                },
                            TAXINVOICE: []
                        })
                    }
                })
            
                // Store data to REDIS End.
        }else {
            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            bigcClient.hmset(applicationNo,'PRE_PARAMS', params, "ATTACH_ERROR", res_x.errorMessage, "UPDATED_DATE", updatedDate);
            const errorResponse = {
                STATUS      : "ERROR",
                MESSAGE     : res_x.errorMessage,
                POLICY      : {
                    TRANSSTATUS : "D",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            }
            res.json(errorResponse)
        }
    }).catch(err => {
        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
        bigcClient.hmset(applicationNo, 'PRE_PARAMS', params, "EFFECTIVEDATE", req.body.EFFECTIVEDATE,  "PRE_MAPPING", validData, "PRE_ERROR", err.message, "UPDATED_DATE", updatedDate)
        const errorResponse = {
            STATUS      : "ERROR",
            MESSAGE     : `${err.message} at preValidate`,
            POLICY      : {
                TRANSSTATUS : "D",
                POLICYNO    : "",
                ENDORSENO   : ""
                },
            TAXINVOICE: []
        }
        res.json(errorResponse)
    })
    // POST PRE-Validate End
}

exports.policyRequest = (req, res, next) => {
    const policyRequestParams           = JSON.stringify(req.body)
    const applicationNo                 = req.body.APPLICATIONNO;

    // GET Token from REDIS Start.
    bigcClient.hgetall(applicationNo, function(err, value) {
        if(err) {
            res.json({
                STATUS      : "ERROR",
                MESSAGE     : err,
                POLICY      : {
                    TRANSSTATUS : "DC",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            })
        }else if(value && value.TOKEN) {
            const issuePolicyParams = {
                token               : value.TOKEN,
                paymentInfo         : "100",
                referenceCode       : applicationNo
                }
            postIssuancePolicy(issuePolicyParams)
            .then(res_x => {
                if(res_x.status){
                    let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                    let createdDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                    bigcClient.hmset(applicationNo, "POLICYNO", res_x.policyInfo[0].policyNo, "TAXINVOICE", res_x.policyInfo[0].receiptNo, "ISSUE_SUCCESS", true,  "UPDATED_DATE", updatedDate)
                    bigcClient.hmset(res_x.policyInfo[0].policyNo,
                        "APPLICATIONNO", applicationNo,
                        "POLICY_REQUEST", policyRequestParams,
                        "EFFECTIVEDATE", req.body.EFFECTIVEDATE, 
                        "TAXINVOICE", res_x.policyInfo[0].receiptNo, 
                        "UPDATED_DATE", updatedDate, 
                        "CREATED_DATE", createdDate )
                    res.json({
                        STATUS      : "SUCCESS",
                        MESSAGE     : "",
                        POLICY      : {
                            TRANSSTATUS : "PC",
                            POLICYNO    : res_x.policyInfo[0].policyNo,
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: [{
                            TAXITEMNO       : 1,
                            TAXINVOICENO    : res_x.policyInfo[0].receiptNo,
                            DOCUMENTNO      : ""

                        }]
                    })
                }else if(res_x.errorMessage == "Token has already expired"){
                    let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                    bigcClient.hmset(applicationNo, "EXPIRED", true, "UPDATED_DATE", updatedDate)
                    res.json({
                        STATUS      : "ERROR",
                        MESSAGE     : res_x.errorMessage,
                        POLICY      : {
                            TRANSSTATUS : "DC",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
                }else {
                    res.json({
                        STATUS      : "ERROR",
                        MESSAGE     : res_x.errorMessage,
                        POLICY      : {
                            TRANSSTATUS : "DC",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
                }
            })
        }else {
            res.json({
                STATUS      : "ERROR",
                MESSAGE     : `APPLICATIONNO: ${applicationNo} don't pre-validate yet.` ,
                POLICY      : {
                    TRANSSTATUS : "DC",
                    POLICYNO    : "",
                    ENDORSENO   : ""
                    },
                TAXINVOICE: []
            })
        }
    })
    // GET Token from REDIS End.
}

exports.cancelPolicyEDR = (req, res, next) => {
    const bodyRequestParams             = JSON.stringify(req.body)
    const policyNo                      = req.body.POLICYNO;

        // GET Token from REDIS Start.
        bigcClient.hgetall(policyNo, function(err, value) {
            if(err) {
                console.log('error when ghetall: ', policyNo)
                res.json({
                    STATUS      : "ERROR",
                    MESSAGE     : err,
                    POLICY      : {
                        TRANSSTATUS : "DC",
                        POLICYNO    : "",
                        ENDORSENO   : ""
                        },
                    TAXINVOICE: []
                })
            }else {
                console.log('APPLICATIONNO : ', value.APPLICATIONNO)
                const cancelPolicyParams = req.body
                cancelPolicyEDR(cancelPolicyParams)
                .then(res_x => {
                    if(res_x.status){
                        console.log('res_x.status : ', res_x.status)
                        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                        bigcClient.hmset(value.APPLICATIONNO, "CANCEL_SUCCESS", true, "CANCEL_REQUEST", JSON.stringify(cancelPolicyParams),  "UPDATED_DATE", updatedDate)
                        bigcClient.hmset(policyNo,
                            "APPLICATIONNO", value.APPLICATIONNO,
                            "CANCEL_SUCCESS", true,
                            "CANCEL_REQUEST", JSON.stringify(cancelPolicyParams), 
                            "TAXINVOICE", value.TAXINVOICE, 
                            "UPDATED_DATE", updatedDate )
                        res.json({
                            STATUS      : "SUCCESS",
                            MESSAGE     : "",
                            POLICY      : {
                                TRANSSTATUS : "PC",
                                POLICYNO    : "",
                                ENDORSENO   : `${policyNo}-1`
                                },
                            TAXINVOICE: [{
                                TAXITEMNO       : 1,
                                TAXINVOICENO    : value.TAXINVOICE,
                                DOCUMENTNO      : ""
    
                            }]
                        })
                    }else if(res_x.errorMessage){
                        console.log('res_x.errorMessage : ', res_x.errorMessage)
                        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                        bigcClient.hmset(policyNo, "CANCEL_ERROR", res_x.errorMessage, "UPDATED_DATE", updatedDate)
                        bigcClient.hmset(value.APPLICATIONNO, "CANCEL_ERROR", res_x.errorMessage, "UPDATED_DATE", updatedDate)
                        res.json({
                            STATUS      : "ERROR",
                            MESSAGE     : res_x.errorMessage,
                            POLICY      : {
                                TRANSSTATUS : "DC",
                                POLICYNO    : "",
                                ENDORSENO   : ""
                                },
                            TAXINVOICE: []
                        })
                    }else {
                        console.log('else from error<essage')
                        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                        bigcClient.hmset(value.APPLICATIONNO, "CANCEL_ERROR", "ERROR With no errorMessage." , "UPDATED_DATE", updatedDate)
                        bigcClient.hmset(policyNo, "CANCEL_ERROR", "ERROR With no errorMessage." , "UPDATED_DATE", updatedDate)
                        res.json({
                            STATUS      : "ERROR",
                            MESSAGE     : "ERROR With no errorMessage",
                            POLICY      : {
                                TRANSSTATUS : "DC",
                                POLICYNO    : "",
                                ENDORSENO   : ""
                                },
                            TAXINVOICE: []
                        })
                    }
                }).catch(err_x => {
                    
                    console.log('catch err_x : ',err_x)
                    let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                    bigcClient.hmset(policyNo, "CANCEL_ERROR", err_x.message, "UPDATED_DATE", updatedDate)
                    res.json({
                        STATUS      : "ERROR",
                        MESSAGE     : err_x.message ,
                        POLICY      : {
                            TRANSSTATUS : "DC",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
                })
            }
        })

}

exports.cancelPolicyEND = (req, res, next) => {
    const bodyRequestParams             = JSON.stringify(req.body)
    const policyNo                      = req.body.POLICYNO;

        // GET Token from REDIS Start.
        bigcClient.hgetall(policyNo, function(err, value) {
            if(err) {
                res.json({
                    STATUS      : "ERROR",
                    MESSAGE     : err,
                    POLICY      : {
                        TRANSSTATUS : "DC",
                        POLICYNO    : "",
                        ENDORSENO   : ""
                        },
                    TAXINVOICE: []
                })
            }else if(value && value.APPLICATIONNO && value.TAXINVOICE) {
                const cancelPolicyParams = req.body
                cancelPolicyEND(cancelPolicyParams)
                .then(res_x => {
                    if(res_x.status){
                        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                        bigcClient.hmset(value.APPLICATIONNO, "CANCEL_SUCCESS", true, "CANCEL_REQUEST", JSON.stringify(cancelPolicyParams),  "UPDATED_DATE", updatedDate)
                        bigcClient.hmset(policyNo,
                            "APPLICATIONNO", value.APPLICATIONNO,
                            "CANCEL_SUCCESS", true,
                            "CANCEL_REQUEST", JSON.stringify(cancelPolicyParams), 
                            "TAXINVOICE", value.TAXINVOICE, 
                            "UPDATED_DATE", updatedDate )
                        res.json({
                            STATUS      : "SUCCESS",
                            MESSAGE     : "",
                            POLICY      : {
                                TRANSSTATUS : "PC",
                                POLICYNO    : "",
                                ENDORSENO   : `${policyNo}-1`
                                },
                            TAXINVOICE: [{
                                TAXITEMNO       : 1,
                                TAXINVOICENO    : value.TAXINVOICE,
                                DOCUMENTNO      : ""
    
                            }]
                        })
                    }else if(res_x.errorMessage){
                        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                        bigcClient.hmset(policyNo, "CANCEL_ERROR", res_x.errorMessage, "UPDATED_DATE", updatedDate)
                        bigcClient.hmset(value.APPLICATIONNO, "CANCEL_ERROR", res_x.errorMessage, "UPDATED_DATE", updatedDate)
                        res.json({
                            STATUS      : "ERROR",
                            MESSAGE     : res_x.errorMessage,
                            POLICY      : {
                                TRANSSTATUS : "DC",
                                POLICYNO    : "",
                                ENDORSENO   : ""
                                },
                            TAXINVOICE: []
                        })
                    }else {
                        let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                        bigcClient.hmset(value.APPLICATIONNO, "CANCEL_ERROR", "ERROR With no errorMessage." , "UPDATED_DATE", updatedDate)
                        bigcClient.hmset(policyNo, "CANCEL_ERROR", "ERROR With no errorMessage." , "UPDATED_DATE", updatedDate)
                        res.json({
                            STATUS      : "ERROR",
                            MESSAGE     : "ERROR With no errorMessage",
                            POLICY      : {
                                TRANSSTATUS : "DC",
                                POLICYNO    : "",
                                ENDORSENO   : ""
                                },
                            TAXINVOICE: []
                        })
                    }
                }).catch(err_x => {
                    let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                    bigcClient.hmset(policyNo, "CANCEL_ERROR", err_x.message, "UPDATED_DATE", updatedDate)
                    res.json({
                        STATUS      : "ERROR",
                        MESSAGE     : err_x.message ,
                        POLICY      : {
                            TRANSSTATUS : "DC",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
                })
            }else {
                let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
                bigcClient.hmset(policyNo, "CANCEL_ERROR", "ERROR With no errorMessage." , "UPDATED_DATE", updatedDate)
                res.json({
                    STATUS      : "ERROR",
                    MESSAGE     : `POLICYNO: ${policyNo} doesn't exist.` ,
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

exports.mapping = (req, res, next) => {
    const mappingData   = dataMapping(res, req);
    res.json(mappingData)
}

exports.validateInput = (req, res, next) => {
    const status = req.body.STATUS
    switch(status) {
        case "PRE":
            // Applicaiton to Pre-approve.
            validateRequest(req.body,                       next, SCHEMA_PRE_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            next();
            break;
        case "APR":
            // Application Request.
            validateRequest(req.body,                       next, SCHEMA_PRE_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            next();
            break;
        case "APU":
            // Applicatoin Update.
            validateRequest(req.body,                       next, SCHEMA_PRE_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            next();
            break;
        case "APS":
            // Application Survey.
            validateRequest(req.body,                       next, SCHEMA_PRE_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            next();
            break;
        case "POR":
            // Policy Request.
            validateRequest(req.body,                       next, SCHEMA_POR_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_POR_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_POR_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_POR_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_POR_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_POR_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_POR_RISK)                  ;
            next();
            break;
        case "POU":
            // Policy Update 
            validateRequest(req.body,                       next, SCHEMA_PRE_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            next();
            break;
        case "END":
            // Policy Update 
            validateRequest(req.body,                       next, SCHEMA_END_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            validateIssueDate(req, res, next)                                                       ;
            next();
            break;
        case "EDR":
            // Policy Update 
            validateRequest(req.body,                       next, SCHEMA_END_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            // validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            // validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            // validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            // validateIssueDate(req, res, next)
            next();
            break;
        default:
            validateRequest(req.body,                       next, SCHEMA_PRE_GENERAL)               ;
            validateRequest(req.body.INSURED[0],            next, SCHEMA_PRE_INSURED)               ;
            validateRequest(req.body.DELIVERY[0],           next, SCHEMA_PRE_DELIVERY)              ;
            validateRequest(req.body.TAXINVOICE[0],         next, SCHEMA_PRE_TAX_INPUT)             ;
            validateRequest(req.body.AGENTSALE,             next, SCHEMA_PRE_AGENTSALE)             ;
            validateRequest(req.body.SUMMARY,               next, SCHEMA_PRE_SUMMARY)               ;
            validateRequest(req.body.RISK,                  next, SCHEMA_PRE_RISK)                  ;
            next();
            // Do something for default case.
    }
}

exports.preValidate = (req, res, next) => {
    const subclass = req.body.SUBCLASS; 
    switch(subclass) {
        case "PH":
            // Personal Health.
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            //validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PH09)         ;
            //validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_PH14)         ;
            //validateRequest(req.body.PERSON[0].QUESTION[2], next, SCHEMA_PRE_QUESTION_PH15)         ;
            validateRequest(req.body.PERSON[0].QUESTION[3], next, SCHEMA_PRE_QUESTION_PH16)         ;
            validateRequest(req.body.PERSON[0].QUESTION[4], next, SCHEMA_PRE_QUESTION_TAX)          ;
            this.occupationValidationPH(req, res, next);
            break;
        case "PA":
            // Personal Accident.
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PA06)         ;
            validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_TAX)          ;
            this.occupationValidationPA(req, res, next);
            break;
        case "TA":
            // Travel Accident.
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PA06)         ;
            validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_TAX)          ;
            res.json({ 
                        STATUS      : "ERROR", 
                        MESSAGE     : `Service for SUBCLASS: ${subclass} is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []  
                    })
            break;
        case "MC":
            // Motor Compulsery.
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PA06)         ;
            validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_TAX)          ;
            res.json({ 
                        STATUS      : "ERROR",
                        MESSAGE     : `Service for SUBCLASS: ${subclass} is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []  
                    })
            break;
        case "MV":
            // Motor Voluntary.
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PA06)         ;
            validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_TAX)          ;
            res.json({ 
                        STATUS      : "ERROR",
                        MESSAGE     : `Service for SUBCLASS: ${subclass} is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            break;
        case "CC":
            // CC.
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PA06)         ;
            validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_TAX)          ;
            res.json({ 
                        STATUS      : "ERROR",
                        MESSAGE     : `Service for SUBCLASS: ${subclass} is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            break;
        default:
            validateRequest(req.body.PERSON[0],             next, SCHEMA_PRE_PERSON)                ;
            validateRequest(req.body.PERSON[0].QUESTION,    next, SCHEMA_PRE_QUESTION_PACKONE)      ;
            validateRequest(req.body.PERSON[0].QUESTION[0], next, SCHEMA_PRE_QUESTION_PA06)         ;
            validateRequest(req.body.PERSON[0].QUESTION[1], next, SCHEMA_PRE_QUESTION_TAX)          ;
            res.json({ 
                        STATUS      : "ERROR",
                        MESSAGE     : `Service for SUBCLASS: ${subclass} is not implement yet.`,
                        POLICY      : {
                            TRANSSTATUS : "",
                            POLICYNO    : "",
                            ENDORSENO   : ""
                            },
                        TAXINVOICE: []
                    })
            // Do something for default case.
    }
}

exports.occupationValidationPH = (req, res, next) => {
    let invalid         ;
    let occupationValue ;
    forbiddenOccupationPH.forEach((occupation, index) => {
        if(req.body.INSURED[0].OCCUPATION == occupation.code) {

            // console.log("INSURED OCCUPATION PH  : ",     req.body.INSURED[0].OCCUPATION)    ;
            // console.log("occupation code        : ",     occupation.code)                   ;

            invalid             = true
            occupationValue     = { Status: false, ErrorMessage: `อาชีพ ${occupation.descriptionTH} ไม่สามารถเข้าทำประกันได้ `, OCCUPATION: occupation.code}
        }
    })
    if(invalid) {
        res.json(occupationValue)
    }else{
        this.occupationMapping(req, res, next);
        this.locationMapping(req, res, next);
        this.prefixMapping(req, res, next);
        this.idCardTypeMapping(req, res, next);
        this.insuredStatusCodeMapping(req, res, next);
        this.receiptIDCardMapping(req, res, next);
        this.relationshipMapping(req, res, next);
        next();
    }
}

exports.occupationValidationPA = ( req, res, next) => {
    let invalid         ;
    let occupationValue ;

    forbiddenOccupationPA.forEach((occupation, index) => {
        if(req.body.INSURED[0].OCCUPATION == occupation.code) {

            // console.log("INSURED OCCUPATION PA  : ",     req.body.INSURED[0].OCCUPATION)    ;
            // console.log("occupation code        : ",     occupation.code)                   ;

            invalid             = true
            occupationValue     = { Status: false, ErrorMessage: `อาชีพ ${occupation.descriptionTH} ไม่สามารถเข้าทำประกันได้ `, OCCUPATION: occupation.code}
        }
    })
    if(invalid) {
        res.status(400).json({
            STATUS  : "ERROR", 
            MESSAGE : occupationValue.ErrorMessage,
            POLICY      : {
                TRANSSTATUS : "D",
                POLICYNO    : "",
                ENDORSENO   : ""
                },
            TAXINVOICE: []
        })
    }else if(!req.body.INSURED[0].OCCUPATION) {
        res.status(400).json({
            STATUS  : "ERROR", 
            MESSAGE : `OCCUPATION is Required.`,
            POLICY      : {
                TRANSSTATUS : "D",
                POLICYNO    : "",
                ENDORSENO   : ""
                },
            TAXINVOICE: []
        })
    }
    else{
        this.occupationMapping(req, res, next);
        this.locationMapping(req, res, next);
        this.prefixMapping(req, res, next);
        this.idCardTypeMapping(req, res, next);
        this.insuredStatusCodeMapping(req, res, next);
        this.receiptIDCardMapping(req, res, next);
        this.relationshipMapping(req, res, next);
        next();
    }
}

exports.occupationMapping = (req, res, next) => {
        let occupationCode              = req.body.INSURED[0].OCCUPATION;
        let personOccupationcode        = req.body.PERSON[0].PS_OCCUPATION
        let mappingOccupation           = occupationMapping.Occupation.filter(occupation => {
            return occupation.OccupationCode == occupationCode
        })
        let mappingPersonOccupation           = occupationMapping.Occupation.filter(occupation => {
            return occupation.OccupationCode == personOccupationcode
        })
        if(mappingOccupation[0]){
            let coreCode                    = mappingOccupation[0].CoreCode1
            req.body.INSURED[0].OCCUPATION  = coreCode
        }
        if(mappingPersonOccupation[0]){
            let personCoreCode                = mappingPersonOccupation[0].CoreCode1
            req.body.PERSON[0].PS_OCCUPATION  = personCoreCode
        }

}

exports.locationMapping = (req, res, next) => {

    let subDistrictCode                     = req.body.INSURED[0].SUBDISTRICT;
    let mappingLocation                     = locationMapping.Location_Mapping.filter(location => {
        return location.subdistrict_code == subDistrictCode
    })
    // console.log("mappingLocation : ", mappingLocation)
    if(mappingLocation[0]){
        let SUBDISTRICT_CODE                = mappingLocation[0].subdistrict_code;
        let DISTRICT_CODE                   = mappingLocation[0].city_code;
        let PROVINCE_CODE                   = mappingLocation[0].state_code;
        let ZIPCODE                         = mappingLocation[0].zipcode;
        req.body.INSURED[0].SUBDISTRICT     = SUBDISTRICT_CODE;
        req.body.INSURED[0].DISTRICT        = DISTRICT_CODE;
        req.body.INSURED[0].PROVINCE        = PROVINCE_CODE;
        req.body.INSURED[0].ZIPCODE         = ZIPCODE;
    }
}

exports.prefixMapping = (req, res, next) => {
    // console.log("TITLENAME           : ", req.body.INSURED[0].TITLENAME);
    let prefixName                      = req.body.INSURED[0].TITLENAME;
    let beneficiaryPrefix1              = req.body.PERSON[0].BNF_TITLENAME1
    let beneficiaryPrefix2              = req.body.PERSON[0].BNF_TITLENAME2 
    let beneficiaryPrefix3              = req.body.PERSON[0].BNF_TITLENAME3  
    let mappingPrefix                   = prefixMapping.filter(prefix => {
        return prefix.descTH == prefixName
    })
    let mappingBNFPrefix1               = prefixMapping.filter(prefix => {
        return prefix.descTH == beneficiaryPrefix1
    })
    let mappingBNFPrefix2               = prefixMapping.filter(prefix => {
        return prefix.descTH == beneficiaryPrefix2
    })
    let mappingBNFPrefix3               = prefixMapping.filter(prefix => {
        return prefix.descTH == beneficiaryPrefix3
    })
    if(mappingPrefix[0]) {
        req.body.INSURED[0].TITLENAME       = mappingPrefix[0].CORE;
    }else {
        req.body.INSURED[0].TITLENAME       = '001'
    }
    if(mappingBNFPrefix1[0]) {
        req.body.PERSON[0].BNF_TITLENAME1   = mappingBNFPrefix1[0].CORE;
    }else {
        req.body.PERSON[0].BNF_TITLENAME1   = '001'
    }
    if(mappingBNFPrefix2[0]) {
        req.body.PERSON[0].BNF_TITLENAME2   = mappingBNFPrefix2[0].CORE;
    }else {
        req.body.PERSON[0].BNF_TITLENAME2   = '001'
    }
    if(mappingBNFPrefix3[0]) {
        req.body.PERSON[0].BNF_TITLENAME3   = mappingBNFPrefix3[0].CORE;
    }else {
        req.body.PERSON[0].BNF_TITLENAME3   = '001'
    }
}

exports.idCardTypeMapping = (req, res, next) => {
    // console.log("IDCARDTYPE          : ", req.body.INSURED[0].IDCARDTYPE);
    let idCardType                      = req.body.INSURED[0].IDCARDTYPE;
    let mappingIdCardMapping            = idCardTypeMapping.filter(idCard => {
        return idCard.IDCARDTYPE == idCardType
    })
    // console.log("mappingIdCardMapping : ", mappingIdCardMapping);
    
    console.log("mappingIdCardMapping : ", mappingIdCardMapping);
    if(mappingIdCardMapping[0]) {
        req.body.INSURED[0].IDCARDTYPE       = mappingIdCardMapping[0].IdentityCardType;
    }
    // console.log("IDCARDTYPE           : ", req.body.INSURED[0].IDCARDTYPE);
}

exports.personTypeMapping = (req, res, next) => {

}

exports.insuredStatusCodeMapping = (req, res, next) => {
    // console.log("InsuredStatusCode   : ", req.body.INSURED[0].MARITALSTATUS);
    let statusCode                              = req.body.INSURED[0].MARITALSTATUS;
    let mappingInsuredStatusCode                = insuredStatusMapping.filter(insuredStatus => {
        return insuredStatus.MartialStatusCode  == statusCode
    });
    // console.log("mappingInsuredStatusCode : ", mappingInsuredStatusCode)
    if(mappingInsuredStatusCode[0]){
        req.body.INSURED[0].MARITALSTATUS   = mappingInsuredStatusCode[0].InsuredStatusCode;
    }
    
    // console.log("req,body.INSURED[0].MARITALSTATUS : ", req.body.INSURED[0].MARITALSTATUS)
}

exports.receiptIDCardMapping = (req, res, next) => {
    // console.log("IDCARDTYPE          : ", req.body.TAXINVOICE[0].IDCARDTYPE);
    let idCardType                      = req.body.TAXINVOICE[0].IDCARDTYPE;
    let mappingIdCardMapping            = idCardTypeMapping.filter(idCard => {
            return idCard.IDCARDTYPE    == idCardType
    })
    console.log("mappingIdCardMapping : ", mappingIdCardMapping);
    if(mappingIdCardMapping[0]) {
        req.body.TAXINVOICE[0].IDCARDTYPE       = mappingIdCardMapping[0].IdentityCardType;
    }
    
    // console.log("TAXINVOICE[0].IDCARDTYPE           : ", req.body.TAXINVOICE[0].IDCARDTYPE);
}

exports.relationshipMapping = (req, res, next) => {
    try{

        let beneficiaryList         = req.body.PERSON
        let mappingReletionship1     = Relationships.filter(relation => {
            return beneficiaryList[0].BNF_RELATIONSHIP1 == relation.bigC_name
        })
        let mappingReletionship2     = Relationships.filter(relation => {
            return beneficiaryList[0].BNF_RELATIONSHIP2 == relation.bigC_name
        })
        let mappingReletionship3     = Relationships.filter(relation => {
            return beneficiaryList[0].BNF_RELATIONSHIP3 == relation.bigC_name
        })
    
        if(mappingReletionship1[0]) {
            req.body.PERSON[0].BNF_RELATIONSHIP1 = mappingReletionship1[0].VIR_relationship_code
        }
        if(mappingReletionship2[0]) {
            req.body.PERSON[0].BNF_RELATIONSHIP2 = mappingReletionship2[0].VIR_relationship_code
        }
        if(mappingReletionship3[0]) {
            req.body.PERSON[0].BNF_RELATIONSHIP3 = mappingReletionship3[0].VIR_relationship_code
        }
    }catch(error) {
        console.log("relationship error : ",error)
        throw error
    }

    
}

exports.uploadFile = (req, res, next) => {
    const data = {
        searchpattern       : "",
        OrganizationCode    : "Viriyah",
        RefDocType          : "",
        RefDocId            : "64100/POL/000000-000",
        AppName             : "PolicyUnsigned",
        sortby              : ""
    }
    res.json({data})
    
    /* FILE LIBRARY GET FILE */
    // fileLibrarySearch(data)
    //     .then(res_x => {
    //         const fileURL = "https://vmedia.viriyah.co.th/FileLibrary/Upload/PolicyUnsigned/Viriyah/2020/12/02/09/5a580615-143f-47ae-9df6-d743a4444c11.png"
    //         getBase64(fileURL).then(base64 => {
    //             console.log("base64 : ", base64)
    //             res.json({base64})
    //         })
            
    //         // res.json()
    //     }).catch(err_x => {
    //         console.log("error in SearchFile method : ", err_x)
    //         res.send(err_x)
    //     })

}

// GET FILE and convert to BASE64.
// function getBase64(url) {
//     return axios
//       .get(url, {
//         responseType: 'arraybuffer'
//       })
//       .then(response => Buffer.from(response.data, 'binary').toString('base64'))
//   }

exports.validateIssueDate = (req, res, next) => {
    res.json({
        today: new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"}),
        IssueDate: new Date(formatDate(req.body.ISSUEDATE)).toLocaleString("en-GB", {timeZone: "Asia/Bangkok"}) 
    })
    next()
}

function dataMapping(res, req) {
    try{
        const policyInfo        = policyInfoMapping(req)
        const insuredInfoList   = insuredInfoListMapping(req)
        const receiptInfo       = receiptInfoMapping(req)
        if(req.body.AGENTSALE.BROKERCODE == "BCIB") {
            const mappingData       = {
                ReferenceCode       : req.body.APPLICATIONNO,
                PaymentCode         : "100",                                             // need logic
                UserName            : req.body.AGENTSALE.BROKERCODE,
                AgentCode           : "15350",
                SubAgentCode        : "",
                PolicyInfo          : { ...policyInfo },
                InsuredInfoList     : insuredInfoList,
                ReceiptInfo         : receiptInfoMapping(req)
            
            }
            return mappingData
        }else {
            const mappingData       = {
                ReferenceCode       : req.body.APPLICATIONNO,
                PaymentCode         : "100",                                             // need logic
                UserName            : req.body.AGENTSALE.BROKERCODE,
                AgentCode           : req.body.AGENTSALE.SALECODE,
                SubAgentCode        : "",
                PolicyInfo          : { ...policyInfo },
                InsuredInfoList     : insuredInfoList,
                ReceiptInfo         : receiptInfoMapping(req)
                
            }
            return mappingData
        }
    }catch(error) {

        res.json(error)
        // console.log("Error from dataMapping : ", error)
    } 
}

/* Mapping FUNCTION */
function policyInfoMapping(req) {
    const IssueDate         = formatDate(req.body.ISSUEDATE)
    const AgreementDate     = formatDate(req.body.AGREEMENTDATE)
    const subClassCode      = req.body.PACKAGECODE.substring(0,3);
    const productCode       = req.body.PACKAGECODE.substring(3,8)
    const policyInfo        = {
        // PolicyNo: req.body.POLICYNO,
            CoverageStartDate       : formatDate(req.body.EFFECTIVEDATE),
            CoveragePeriodType      : "Y",                                                    // HARD-CODE
            CoveragePeriod          : "",                                                     // Require If CoveragePeriodType is "Y".
            AgreementDate           : formatDate(req.body.AGREEMENTDATE),         
            IssueDate               : formatDate(req.body.ISSUEDATE),          
            SubClassCode            : subClassCode,            
            ProductCode             : productCode,                  
            PackageSequence         : parseInt(req.body.PLANCODE),                            // HARD-CODE
            BranchCode              : "110"                                                   // HARD-CODE
    }

    return policyInfo;
}

function insuredInfoListMapping(req) {
    const insured               = req.body.INSURED[0]; 
    const beneficiaryInfoList   = beneficiaryInfoListMapping(req)
    const insuredInfoList       = [{
            InsuredPrefixCode               : insured.TITLENAME,
            InsuredFirstName                : insured.FIRSTNAME,
            InsuredLastName                 : insured.LASTNAME,
            InsuredGender                   : insured.GENDER,

            InsuredBirthdate                : insured.BIRTHDATE ? formatDate(insured.BIRTHDATE) : '',
            InsuredIdentityCardType         : insured.IDCARDTYPE,
            InsuredIdentityCardNo           : insured.IDCARDNO,

            InsuredContactNumber            : insured.MOBILE1,
            InsuredReceiveDocumentType      : "1",                                                // need logic
            InsuredEmail                    : insured.EMAIL,        
            InsuredOccupationCode           : insured.OCCUPATION,      
            InsuredStatusCode               : insured.MARITALSTATUS,                              // need mapping

            InsuredPOBox                    : insured.HOUSENO,      
            InsuredBuilding                 : insured.ADDRESSTEXT,       

            InsuredSoi                      : insured.SOI,        
            InsuredStreet                   : insured.ROAD,        

            InsuredSubdistrictCode          : insured.SUBDISTRICT,                                // need mapping    ||
            InsuredDistrictCode             : insured.DISTRICT,                                   // need mapping    ||
                                                                                                  //                 || ---> Need to be valid relative data                                                                
            InsuredProvinceCode             : insured.PROVINCE,                                   // need mapping    ||
            InsuredZipcode                  : insured.ZIPCODE,                                    // need mapping    ||

            BeneficiaryType                 : "0",                                                // need logic
            BeneficiaryInfoList             : beneficiaryInfoList
    }]
    return insuredInfoList
}

function receiptInfoMapping(req) {
    if(req.body.TAXINVOICE && req.body.TAXINVOICE[0]) {
        const receipt       = req.body.TAXINVOICE[0];
        const address1      = `${receipt.HOUSENO} ${receipt.ADDRESSTEXT} ${receipt.MOO} ${receipt.SOI} ${receipt.ROAD}`
        const address2      = `${receipt.SUBDISTRICT} ${receipt.DISTRICT} ${receipt.PROVINCE} ${receipt.ZIPCODE}`
        const receiptInfo   = {       
            ReceiptType                     : "1",                               // need logic                                
            ReceiptCompanyText              : receipt.COMPVATBRCODE,       
            ReceiptPrefixCode               : "001",                             // need to be mapping with "receipt.TITLENAME"
            ReceiptFirstName                : receipt.FIRSTNAME,       
            ReceiptLastName                 : receipt.LASTNAME,       
            ReceiptBranch                   : "1",                               // Required
            ReceiptBranchNo                 : "",
            PaymentMethod                   : "1",                               // HARD-CODE    ||
            CreditCardNo                    : "1804842825279123",                // HARD-CODE    ||     
            StoredCardToken                 : "ABA0253984BC5D6S8479",            // HARD-CODE    ||
            CardHolderName                  : "TEST001 TEST001",                 // HARD-CODE    ||  ---> Require if "PaymentMethod": "1"
            CreditCardType                  : "3",                               // HARD-CODE    ||
            CardCVV                         : "776",                             // HARD-CODE    ||
            CardExpire                      : "12/2021",                         // HARD-CODE    ||
            ReceiptIdentityCardType         : receipt.IDCARDTYPE,       
            ReceiptIdentityCardNo           : receipt.IDCARDNO,       
            ReceiptAddress1                 : address1,       
            ReceiptAddress2                 : address2  
        }
        return receiptInfo
    }else {
        return {}
    }    
}

function beneficiaryInfoListMapping(req) {
    if(req.body.PERSON && req.body.PERSON[0]) {
        // const person = validateRequest(req.body.PERSON[0], SCHEMA_PRE_PERSON) 
        const beneficiaryList = req.body.PERSON
        const beneficiary1 = {
            BeneficiarySeq                  : "1",           
            BeneficiaryPrefixCode           : beneficiaryList[0].BNF_TITLENAME1         || "",                                        
            BeneficiaryFirstName            : beneficiaryList[0].BNF_FIRSTNAME1         || "",           
            BeneficiaryLastName             : beneficiaryList[0].BNF_LASTNAME1          || "",         
            BeneficiaryBirthdate            : "",          
            BeneficiaryContactNumber        : "",          
            BeneficiaryRelationShip         : beneficiaryList[0].BNF_RELATIONSHIP1,          
            BeneficiaryIndentityCardType    : "",          
            BeneficiaryIndentityCardNo      : "",          
            BeneficiaryPercent              : beneficiaryList[0].BNF_PERCENTSHARE1
        }
        const beneficiary2 = {
            BeneficiarySeq                  : "2",           
            BeneficiaryPrefixCode           : beneficiaryList[0].BNF_TITLENAME2         || "",                                        
            BeneficiaryFirstName            : beneficiaryList[0].BNF_FIRSTNAME2         || "",           
            BeneficiaryLastName             : beneficiaryList[0].BNF_LASTNAME2          || "",         
            BeneficiaryBirthdate            : "",          
            BeneficiaryContactNumber        : "",          
            BeneficiaryRelationShip         : beneficiaryList[0].BNF_RELATIONSHIP2,          
            BeneficiaryIndentityCardType    : "",          
            BeneficiaryIndentityCardNo      : "",          
            BeneficiaryPercent              : beneficiaryList[0].BNF_PERCENTSHARE2
        }
        const beneficiary3 = {
            BeneficiarySeq                  : "3",           
            BeneficiaryPrefixCode           : beneficiaryList[0].BNF_TITLENAME3         || "",                                        
            BeneficiaryFirstName            : beneficiaryList[0].BNF_FIRSTNAME3         || "",           
            BeneficiaryLastName             : beneficiaryList[0].BNF_LASTNAME3          || "",         
            BeneficiaryBirthdate            : "",          
            BeneficiaryContactNumber        : "",          
            BeneficiaryRelationShip         : beneficiaryList[0].BNF_RELATIONSHIP3,          
            BeneficiaryIndentityCardType    : "",          
            BeneficiaryIndentityCardNo      : "",          
            BeneficiaryPercent              : beneficiaryList[0].BNF_PERCENTSHARE3
        }
        const beneficiaryInfoList = []
        if(beneficiaryList[0].BNF_FIRSTNAME1){
            beneficiaryInfoList.push(beneficiary1)
        }
        if(beneficiaryList[0].BNF_FIRSTNAME2){
            beneficiaryInfoList.push(beneficiary2)
        }
        if(beneficiaryList[0].BNF_FIRSTNAME3){
            beneficiaryInfoList.push(beneficiary3)
        }
        return beneficiaryInfoList
    } else {
        return []
    }    
}

function formatDate(dateString, withoutTime) {
    var date        = new Date(moment(dateString)); //this is the format you have")
    var hours       = date.getHours();
    var minutes     = date.getMinutes();
    var secs        = date.getSeconds();
    var year        = date.getFullYear();
    var mouth       = date.getMonth() + 1;
    var dateStr     = date.getDate();
    dateStr         = ("0" + dateStr).slice(-2);
    mouth           = ("0" + mouth).slice(-2);
    hours           = ("0" + hours).slice(-2);
    minutes         = ("0" + minutes).slice(-2);
    secs            = ("0" + secs).slice(-2);
    // var ampm         = hours >= 12 ? 'PM' : 'AM';
    // hours            = hours % 12;
    // hours            = hours ? hours : 12; // the hour '0' should be '12'
    // minutes          = minutes < 10 ? '0'+minutes : minutes;
    // var strTime      = hours + ':' + minutes +':'+secs+ ' ' + ampm; // strTime with AM PM.
    
    var strTime     = hours + ':' + minutes + ':' + secs;
    // return strTime;
    if(withoutTime) {
        var datePart    = year + "-" + mouth + "-" + dateStr;
    }else {
        var datePart    = year + "-" + mouth + "-" + dateStr + "T" + strTime;
    }
    
    return datePart;
}

var textFile = null

function makeTextFile(base64Image, APPLICATIONNO, filename) {
    // var sharePath       = "\\\\fileserver\\Branch\\FTP\\B110\\15350";
    var sharePath       = path.resolve(__dirname, '..' ,'fileshare')
    var today           = formatDate(new Date(), true)
    var mainPath        = APPLICATIONNO;
    var subPath         = today;

    // var mainDir         = `${sharePath}\\${mainPath}\\`
    // var dir             = `${sharePath}\\${mainPath}\\${subPath}`

    var mainDir         = path.resolve(sharePath,   mainPath)
    var dir             = path.resolve(mainDir,     subPath)

if (!fs.existsSync(mainDir)){
    fs.mkdirSync(mainDir);
}

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}
    fs.writeFile(`${dir}/${filename}`, base64Image, {encoding: 'base64'}, function(err) {
        if(err) {
            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            console.log("fs err : ", err)
            bigcClient.hmset(APPLICATIONNO, `SHARE_SUCCESS_${today}_${filename}`, false, "UPDATED_DATE", updatedDate)
        }else {
            let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            console.log('File created');
            bigcClient.hmset(APPLICATIONNO, `SHARE_SUCCESS_${today}_${filename}`, true, `SHARE_TIME_${today}_${filename}`, new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"}), "UPDATED_DATE", updatedDate)
        }
        
    });
};