const axios                     = require('axios')                                                                  ;
const redis                     = require('redis')                                                                  ;
const moment                    = require('moment')                                                                 ;
const mockingVMI                = require('../mocking/PREVALIDATE_VMI.json')                                        ;
const SSWOcupation              = require('../libs/service.SSWOcupation')                                           ;
const SSWProductGroup           = require('../libs/service.SSWProductGroup')                                        ;
const SSWCarMake                = require('../libs/service.SSWCarMake')                                             ;
const SSWCarModel               = require('../libs/service.SSWCarModel')                                            ;
const prepareSSWCarModel        = require('../libs/service.prepareSSWCarModel')                                     ;
const preValidateVMI            = require('../libs/service.preValidateVMI')                                         ;
const preValidateCMI            = require('../libs/service.preValidateCMI')                                         ;
const issuanceVMI               = require('../libs/service.issuanceVMI')                                            ;
const issuanceCMI               = require('../libs/service.issuanceCMI')                                            ;
const validateRequest           = require('../_middleware/validate-request')                                        ;
const locationMapping           = require("../mocking/LOCATION_MAPPING.json")                                       ;
const environment               = require("../configs/environment.json")                                            ;

const SCHEMA_VMI_VEHICLE        = require("../schemas/motor/vehicle.schema")                                        ;
const SCHEMA_VMI_INSURED        = require("../schemas/motor/insured.schema")                                        ;
const SCHEMA_VMI_PAYER          = require("../schemas/motor/insured.schema")                                        ;

const elasticsearch                 = require('elasticsearch')                                                      ;
const sswLogClient                 = new elasticsearch.Client({ host: '10.99.4.80:9200', log: 'trace' })

var sswClient = redis.createClient({
    port      : environment.SSW_PORT,
    host      : environment.SSW_HOST
  });

exports.effectiveDateValidate = (req, res, next) => { 
    const today = new Date().setHours(0,0,0,0);
    const effectiveDate = new Date(req.body.policyStartDate).setHours(0,0,0,0);

    if(today > effectiveDate) {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"กรุณาระบุุวันเริ่มต้นความคุ้มครองเป็นวันปัจจุบันและอนาคตเท่านั้น", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }else {
        next();
    }
}

exports.requestLog = (req, res, next) => {
    sswLogClient.transport.request({
        method: 'PUT',
        path: `/viriyah-ssw/_doc/${req.body.applicationcode}_${req.body.productCode}`,  
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
            // console.log(err)
            next();
        }
        // console.log('ECS PUT statusCode : ', statusCode)
        // console.log('ECS PUT body       : ', body)
        next();
      })
}

exports.expiredDateValidate = (req, res, next) => {
    const effectiveDate = new Date(req.body.policyStartDate);
    const expiredDate   = new Date(req.body.policyExpiryDate);

    console.log("effectiveDate : ", effectiveDate)
    console.log("expireDate : ", expiredDate)
    const Difference_IN_Year    = expiredDate.getFullYear()     - effectiveDate.getFullYear();
    const Difference_IN_Month   = expiredDate.getMonth()        - effectiveDate.getMonth(); 
    const Difference_IN_Day     = expiredDate.getDate()         - effectiveDate.getDate();
    const Difference_In_Time    = expiredDate.getTime()         - effectiveDate.getTime();
    const Difference_In_Days    = Difference_In_Time / (1000 * 3600 * 24);
    if((Difference_In_Days      <= 365  ) &&
        (Difference_IN_Year     == 1    ) &&
        (Difference_IN_Month    == 0    ) &&
        (Difference_IN_Day      == 0    ) ) {
        next()
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"กรุณาระบุวันสิ้นสุดความคุ้มครองภายใน 1 ปี นับจากวันเริ่มต้นความคุ้มครอง", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
    
    // res.json({ effectiveDate, expiredDate})
}

exports.preMappingStore = (req, res, next) => {
    sswClient.get("RUNNING", function(err, value){
        if(err) {

            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :err, 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }
        if(!value) {
            console.log("RUNNIG !VALUE : ", value)
            let running         = 0;
            let runningKey      = pad(running, 5)
            sswClient.set("RUNNING", running)


            const params                = JSON.stringify(req.body);
            const applicationNo         = req.body.applicationcode;
            const productCode           = req.body.productCode;
            req.body.redisKey           = `${runningKey}_${applicationNo}_${productCode}`
            const REDIS_KEY             = req.body.redisKey
            const createdDate           = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            sswClient.hmset(REDIS_KEY, 'PRE_MAPPING', params, "CREATED_DATE", createdDate)
            next();
        }else {
            console.log("RUNNING VALUE : ", value)
            let running = parseInt(value) + 1
            let runningKey      = pad(running, 5)
            sswClient.set("RUNNING", running)

            const params                = JSON.stringify(req.body);
            const applicationNo         = req.body.applicationcode;
            const productCode           = req.body.productCode;
            req.body.redisKey           = `${runningKey}_${applicationNo}_${productCode}`
            const REDIS_KEY             = req.body.redisKey
            const createdDate           = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
            sswClient.hmset(REDIS_KEY, 'PRE_MAPPING', params, "CREATED_DATE", createdDate)
            next();
        }
    })
}

exports.mapping = (req, res, next) => {
    let mappingData         = dataMapping(req, res);
    let currentDateMoment   = moment().format("DD-MM-YYYY hh:mm:ss.SSS");
    let currentDate         = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"});

    res.json(mappingData)
    // res.json(req.body)
}

exports.validateInput = (req, res, next) => {
    validateRequest(req.body.vehicle,                             next, SCHEMA_VMI_VEHICLE)               ;
    validateRequest(req.body.insuredPerson,                       next, SCHEMA_VMI_INSURED)               ;
    validateRequest(req.body.payer,                               next, SCHEMA_VMI_PAYER)                 ;
    
}

exports.productCodeValidate = (req, res, next) => {
    if(req.body.productCode === "VMI" ) {
        next()
    }else if(req.body.productCode === "CMI" ) {
        next()
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"กรุณาระบุประเภทของการสั่งซื้อกรมธรรม์", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
}

exports.policyMotorWS = (req, res, next) => {
    if(req.body.productCode === "VMI" ) {
        this.VMIMotorWS(req, res, next)
    }else if(req.body.productCode === "CMI" ) {
        this.CMIMotorWS(req, res, next)
    }
}

exports.VMIMotorWS = (req, res, next) => {
    try{

            
    let mappingData             = dataMapping(req, res);
    const applicationNo         = req.body.applicationcode;
    const productCode           = req.body.productCode;
    const REDIS_KEY             = req.body.redisKey
    let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
    preValidateVMI(mappingData, req)
    .then(res_x => {
        if(res_x.token) {
            const issuanceParams = {
                    applicationNo   : applicationNo,
                    token           : res_x.token
                }
            
            sswClient.hmset(REDIS_KEY,
                            "MAPPING"               , JSON.stringify(mappingData), 
                            "PRE_SUCCESS"           , true, 
                            "TOKEN"                 , res_x.token,  
                            "PRODUCT_CODE"          , "VMI",
                            "PRE_VALIDATE_RESPONSE" , JSON.stringify(res_x), 
                            "UPDATED_DATE", updatedDate)
            issuanceVMI(issuanceParams)
            .then(res_y => {
                const SUCCESS                   = (res_y.status === "0" && res_y.documentUrl && res_y.policyNo) ? true : false
                const TYPEONE_SUCCESS           = (res_y.status === "0" && res_y.applicationNo ) ? true : false
                const PROCESS_UNDERWRITETING    = (res_y.status === "0" && res_y.policyNo) ? true : false
                const REJECTED                  = (res_y.status === "1") ? true : false

                let response = {}
                switch(true) {
                    case SUCCESS: 
                        // Store to REDIS
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"                       , JSON.stringify(mappingData), 
                            "IS_SUCCESS"                    , true,
                            "POLICY_STATUS"                 , "SUCCESS",
                            "EFFECTIVE_DATE"                , req.body.policyStartDate, 
                            "EXPIRED_DATE"                  , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"             , JSON.stringify(res_y),
                            "POLICY_NO"                     , res_y.policyNo, 
                            "DOCUMENT_URL"                  , res_y.documentUrl,
                            "PRODUCT_CODE"                  , "VMI",   
                            "UPDATED_DATE"                  , updatedDate)
                        response = {    
                                isSuccess           :true,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :"",    
                                policyNumber        :res_y.policyNo,     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :res_y.documentUrl,  
                                policyStatus        :"SUCCESS"    
                            }
                            res.json(response)
                        break;
                    case TYPEONE_SUCCESS:
                        // Store ro REIDS
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"                       , JSON.stringify(mappingData), 
                            "IS_SUCCESS"                    , true,
                            "POLICY_STATUS"                 , "PROCESS_UNDERWRITETING",
                            "EFFECTIVE_DATE"                , req.body.policyStartDate, 
                            "EXPIRED_DATE"                  , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"             , JSON.stringify(res_y),
                            "POLICY_NO"                     , res_y.policyNo, 
                            "DOCUMENT_URL"                  , res_y.documentUrl,
                            "PRODUCT_CODE"                  , "VMI",   
                            "UPDATED_DATE"                  , updatedDate)
                        response = {    
                                isSuccess           :true,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :res_y.applicationNo,    
                                policyNumber        :res_y.policyNo,     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :res_y.documentUrl,  
                                policyStatus        :"PROCESS_UNDERWRITETING"    
                            }
                            res.json(response)
                        break;
                    case PROCESS_UNDERWRITETING:
                        // Store to REDIS
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"                   , JSON.stringify(mappingData), 
                            "IS_SUCCESS"                , true,
                            "POLICY_STATUS"             , "PROCESS_UNDERWRITETING",
                            "EFFECTIVE_DATE"            , req.body.policyStartDate, 
                            "EXPIRED_DATE"              , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"         , JSON.stringify(res_y),
                            "POLICY_NO"                 , res_y.policyNo, 
                            "DOCUMENT_URL"              , res_y.documentUrl,
                            "PRODUCT_CODE"              , "VMI",   
                            "UPDATED_DATE"              , updatedDate)
                        response = {    
                                isSuccess           :true,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :res_y.applicationNo,
                                policyNumber        :"",     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,    
                                documentUrl         :"",    
                                policyStatus        :"PROCESS_UNDERWRITETING"    
                            }
                            res.json(response)
                        break;
                    case REJECTED:
                        // do something
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"                   , JSON.stringify(mappingData), 
                            "IS_SUCCESS"                , true,
                            "POLICY_STATUS"             , "REJECTED",
                            "EFFECTIVE_DATE"            , req.body.policyStartDate, 
                            "EXPIRED_DATE"              , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"         , JSON.stringify(res_y),
                            "POLICY_NO"                 , res_y.policyNo, 
                            "DOCUMENT_URL"              , res_y.documentUrl,
                            "PRODUCT_CODE"              , "VMI",   
                            "UPDATED_DATE"              , updatedDate)
                        response = {    
                                isSuccess           :true,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :"",    
                                policyNumber        :"",     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :"",    
                                policyStatus        :"REJECTED"    
                            }
                            res.json(response)
                        break;
                    default:
                        // do something
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"                   , JSON.stringify(mappingData), 
                            "IS_SUCCESS"                , true,
                            "POLICY_STATUS"             , "REJECTED",
                            "ISSUANCE_RESPONSE"         , JSON.stringify(res_y),
                            "EFFECTIVE_DATE"            , req.body.policyStartDate, 
                            "EXPIRED_DATE"              , req.body.policyExpiryDate,
                            "POLICY_NO"                 , res_y.policyNo, 
                            "DOCUMENT_URL"              , res_y.documentUrl,
                            "PRODUCT_CODE"              , "VMI",   
                            "UPDATED_DATE"              , updatedDate)
                        response = {    
                                isSuccess           :false,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :"",    
                                policyNumber        :"",     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :"",    
                                policyStatus        :"REJECTED"    
                            }
                            res.json(response)
                }
            })
            .catch(err_y => {
                // do something
                sswClient.hmset(
                    REDIS_KEY   , 
                    "MAPPING"                   , JSON.stringify(mappingData), 
                    "IS_SUCCESS"                , false,
                    "POLICY_STATUS"             , "REJECTED",
                    "EFFECTIVE_DATE"            , req.body.policyStartDate, 
                    "EXPIRED_DATE"              , req.body.policyExpiryDate,
                    "ISSUANCE_ERROR"            , JSON.stringify(err_y),
                    "ERROR_MESSAGE"             , err_y.message,
                    "PRODUCT_CODE"              , "VMI", 
                    "UPDATED_DATE"              , updatedDate)
                const errorResponse = {    
                        isSuccess           :false,           
                        errorMessage        :"การออกกรมธรรม์เกิดข้อผิดพลาด กรุณาติดต่อเจ้าหน้าที่ บริษัท วิริยะประกันภัย จํากัด (มหาชน)", 
                        applicationcode     :req.body.applicationcode,   
                        contractId          :"",    
                        policyNumber        :"",     
                        policyStartDate     :req.body.policyStartDate,     
                        policyExpiryDate    :req.body.policyExpiryDate,    
                        documentUrl         :"",    
                        policyStatus        :"REJECTED"    
                    }  
                res.json(errorResponse)
            })

        }else {
            sswClient.hmset(
                REDIS_KEY   , 
                "MAPPING"                   , JSON.stringify(mappingData), 
                "IS_SUCCESS"                , false,
                "POLICY_STATUS"             , "REJECTED",
                "EFFECTIVE_DATE"            , req.body.policyStartDate, 
                "EXPIRED_DATE"              , req.body.policyExpiryDate,
                "PRE_VALIDATE_RESPONSE"     , JSON.stringify(res_x),
                "ERROR_MESSAGE"             , res_x.errorMessage,
                "PRODUCT_CODE"              , "VMI", 
                "UPDATED_DATE"              , updatedDate)
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :res_x.errorMessage, 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }
    })
    .catch(err_x => {
        sswClient.hmset(
            REDIS_KEY   , 
            "MAPPING"                   , JSON.stringify(mappingData), 
            "IS_SUCCESS"                , false,
            "POLICY_STATUS"             , "REJECTED",
            "EFFECTIVE_DATE"            , req.body.policyStartDate, 
            "EXPIRED_DATE"              , req.body.policyExpiryDate,
            "PRE_VALIDATE_ERROR"        , JSON.stringify(err_x),
            "ERROR_MESSAGE"             , err_x.message,
            "PRODUCT_CODE"              , "VMI", 
            "UPDATED_DATE"              , updatedDate)
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"ระบบเกิดข้อผิดพลาด", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    })
    }catch (error) {
        console.log("vmi error ", error)
    }

}

exports.CMIMotorWS = (req, res, next) => {
    let mappingData         = dataMapping(req, res);
    const applicationNo         = req.body.applicationcode;
    const productCode           = req.body.productCode;
    const REDIS_KEY             = req.body.redisKey
    let updatedDate = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})
    preValidateCMI(mappingData, req)
    .then(res_x => {
        if(res_x.token) {
            const issuanceParams = {
                applicationNo   : applicationNo,
                token           : res_x.token
            }
            sswClient.hmset(REDIS_KEY,
                             "MAPPING"                      , JSON.stringify(mappingData), 
                             "PRE_SUCCESS"                  , true, 
                             "TOKEN"                        , res_x.token, 
                             "UPDATED_DATE"                 , updatedDate,
                             "PRE_VALIDATE_RESPONSE"        , JSON.stringify(res_x),
                             "PRODUCT_CODE"                 , "CMI")
            issuanceCMI(issuanceParams)
            .then(res_y => {
                const SUCCESS                   = (res_y.status === "0" && res_y.documentUrl && res_y.policyNo) ? true : false
                const PROCESS_UNDERWRITETING    = (res_y.status === "0" && res_y.policyNo) ? true : false
                const REJECTED                  = (res_y.status === "1") ? true : false

                let response = {}
                switch(true) {
                    case SUCCESS: 
                        // do something
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"               , JSON.stringify(mappingData), 
                            "IS_SUCCESS"            , true,
                            "POLICY_STATUS"         , "SUCCESS",
                            "EFFECTIVE_DATE"        , req.body.policyStartDate, 
                            "EXPIRED_DATE"          , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"     , JSON.stringify(res_y),
                            "POLICY_NO"             , res_y.policyNo, 
                            "DOCUMENT_URL"          , res_y.documentUrl,
                            "PRODUCT_CODE"          , "CMI",   
                            "UPDATED_DATE"          , updatedDate)
                        response = {    
                                isSuccess           :true,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :"",    
                                policyNumber        :res_y.policyNo,     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :res_y.documentUrl,  
                                policyStatus        :"SUCCESS"    
                            }
                            res.json(response)
                        break;
                    case PROCESS_UNDERWRITETING:
                        // do something
                        sswClient.hmset(
                            REDIS_KEY   , 
                            "MAPPING"               , JSON.stringify(mappingData), 
                            "IS_SUCCESS"            , true,
                            "POLICY_STATUS"         , "PROCESS_UNDERWRITETING",
                            "EFFECTIVE_DATE"        , req.body.policyStartDate, 
                            "EXPIRED_DATE"          , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"     , JSON.stringify(res_y),
                            "PRODUCT_CODE"          , "CMI",   
                            "UPDATED_DATE"          , updatedDate)
                        response = {    
                                isSuccess           :true,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :res_y.applicationNo,    
                                policyNumber        :"",     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,    
                                documentUrl         :"",    
                                policyStatus        :"PROCESS_UNDERWRITETING"    
                            }
                            res.json(response)
                        break;
                    case REJECTED:
                        // do something
                        sswClient.hmset(
                            REDIS_KEY               , 
                            "MAPPING"               , JSON.stringify(mappingData), 
                            "IS_SUCCESS"            , false,
                            "POLICY_STATUS"         , "REJECTED",
                            "EFFECTIVE_DATE"        , req.body.policyStartDate, 
                            "EXPIRED_DATE"          , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"     , JSON.stringify(res_y),
                            "PRODUCT_CODE"          , "CMI",   
                            "UPDATED_DATE"          , updatedDate)
                        response = {    
                                isSuccess           :false,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :"",    
                                policyNumber        :"",     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :"",    
                                policyStatus        :"REJECTED"    
                            }
                            res.json(response)
                        break;
                    default:
                        // do something
                        sswClient.hmset(
                            REDIS_KEY               , 
                            "MAPPING"               , JSON.stringify(mappingData), 
                            "IS_SUCCESS"            , false,
                            "POLICY_STATUS"         , "REJECTED",
                            "EFFECTIVE_DATE"        , req.body.policyStartDate, 
                            "EXPIRED_DATE"          , req.body.policyExpiryDate,
                            "ISSUANCE_RESPONSE"     , JSON.stringify(res_y),
                            "PRODUCT_CODE"          , "CMI",   
                            "UPDATED_DATE"          , updatedDate)
                        response = {    
                                isSuccess           :false,           
                                errorMessage        :"", 
                                applicationcode     :req.body.applicationcode,   
                                contractId          :"",    
                                policyNumber        :"",     
                                policyStartDate     :req.body.policyStartDate,     
                                policyExpiryDate    :req.body.policyExpiryDate,      
                                documentUrl         :"",    
                                policyStatus        :"REJECTED"    
                            }
                            res.json(response)
                }
            })
            .catch(err_y => {
                sswClient.hmset(
                    REDIS_KEY               , 
                    "MAPPING"               , JSON.stringify(mappingData), 
                    "IS_SUCCESS"            , false,
                    "ERROR_MESSAGE"         , err_y.message,
                    "POLICY_STATUS"         , "REJECTED",
                    "EFFECTIVE_DATE"        , req.body.policyStartDate, 
                    "EXPIRED_DATE"          , req.body.policyExpiryDate,
                    "ISSUANCE_ERROR"        , JSON.stringify(err_y),
                    "PRODUCT_CODE"          , "CMI",   
                    "UPDATED_DATE"          , updatedDate)
                const errorResponse = {    
                        isSuccess           :false,           
                        errorMessage        :"การออกกรมธรรม์เกิดข้อผิดพลาด กรุณาติดต่อเจ้าหน้าที่ บริษัท วิริยะประกันภัย จํากัด (มหาชน)", 
                        applicationcode     :req.body.applicationcode,   
                        contractId          :"",    
                        policyNumber        :"",     
                        policyStartDate     :req.body.policyStartDate,     
                        policyExpiryDate    :req.body.policyExpiryDate,    
                        documentUrl         :"",    
                        policyStatus        :"REJECTED"    
                    }  
                res.json(errorResponse)
            })

        }else {
            sswClient.hmset(
                REDIS_KEY                   , 
                "MAPPING"                   , JSON.stringify(mappingData), 
                "IS_SUCCESS"                , false,
                "PRE_VALIDATE_RESPONSE"     , JSON.stringify(res_x),
                "ERROR_MESSAGE"             , res_x.errorMessage,
                "POLICY_STATUS"             , "REJECTED",
                "EFFECTIVE_DATE"            , req.body.policyStartDate, 
                "EXPIRED_DATE"              , req.body.policyExpiryDate,
                "PRODUCT_CODE"              , "CMI",   
                "UPDATED_DATE"              , updatedDate)
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :res_x.errorMessage, 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }
    })
    .catch(err_x => {
        sswClient.hmset(
            REDIS_KEY   , 
            "MAPPING"                   , JSON.stringify(mappingData), 
            "IS_SUCCESS"                , false,
            "ERROR_MESSAGE"             , err_x.message,
            "PRE_VALIDATE_ERROR"        , JSON.stringify(err_x),
            "POLICY_STATUS"             , "REJECTED",
            "EFFECTIVE_DATE"            , req.body.policyStartDate, 
            "EXPIRED_DATE"              , req.body.policyExpiryDate,
            "PRODUCT_CODE"              , "CMI",   
            "UPDATED_DATE"              , updatedDate)
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"ระบบเกิดข้อผิดพลาด", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    })
}
 
exports.carMakeValidate = (req, res, next) => {
    if(req.body.vehicle) {  
        const sswCode       = req.body.vehicle.make     ;
        const params        = {
            sswCode     :sswCode
        }
        SSWCarMake(params)
        .then(res_x => {
            
            req.body.vehicle.mappingCarMake         = res_x.value[0]
            req.body.vehicle.carMakeName            = res_x.value[0].carmakename
            next() 
        }).catch(err_x => {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"กรุณาระบุยี่ห้อรถยนต์ให้ถูกต้อง", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        })
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"vehicle is required", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
}

exports.carModelValidate = (req, res, next) => {
    if(req.body.vehicle) {
        const carMakeCode   = req.body.vehicle.make     ;
        const sswCode       = req.body.vehicle.model    ;
        const params        = {
            carMakeCode     :carMakeCode,
            sswCode         :sswCode
        }
        SSWCarModel(params)
        .then(res_x => {
            
            req.body.vehicle.mappingCarModel        = res_x.value[0]
            req.body.vehicle.carModelName           = res_x.value[0].carmodelname
            next()
        }).catch(err_x => {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"กรุณาระบุรุ่นรถยนต์ให้ถูกต้อง", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        })
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"vehicle is required", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
}

exports.ocupationValidate = (req, res, next) => {
                         
    if(req.body.insuredPerson) {
        let insured                 = req.body.insuredPerson   
        SSWOcupation({sswCode: insured.occupation })
        .then(res_x => {
            req.body.insuredPerson.occupation            = res_x.value[0].occupationcode
            req.body.insuredPerson.insuredOccupationName = res_x.value[0].occupationname
            next()
        }).catch(err_x => {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"ไม่พบรหัสอาชีพที่ระบุ", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        })
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"insuredPerson is required.", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
}

exports.productGroupValidate    = (req, res, next) => {
    if(req.body.productPackages && req.body.productPackages[0]) {
        const sswCode       = req.body.productPackages[0].package_id
        const params        = {
            sswCode     :sswCode
        }
        
        SSWProductGroup(params)
        .then(res_x => {
            
            req.body.mappingProductGroup                = res_x.value[0]
            if(req.body.productPackages[0].coverages[0]) {
                req.body.mappingProductGroup.coverages     = req.body.productPackages[0].coverages
            }
            if(req.body.productPackages[0].premium) {
                req.body.mappingProductGroup.discounts          = req.body.productPackages[0].premium.discounts
                req.body.mappingProductGroup.additionalCosts    = req.body.productPackages[0].premium.additionalCosts
                req.body.mappingProductGroup.netPremium         = req.body.productPackages[0].premium.netPremium
                req.body.mappingProductGroup.grossPremium       = req.body.productPackages[0].premium.grossPremium
            }
            next()
        }).catch(err_x => {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"ไม่พบข้อมูลกรมธรรม์จากข้อมูลที่ท่านเลือก", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
          
        })
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"productPackages is required.", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
}

exports.insuredLocationValidate = (req, res, next) => {
    if(req.body.insuredPerson.addresses[0]) {
        let registerSubDistrictCode                     = req.body.insuredPerson.addresses[0].subDistrict;
        let registerMappingLocation                     = locationMapping.Location_Mapping.filter(location => {
            return location.subdistrict_code == registerSubDistrictCode
        })
        if(registerMappingLocation[0]) {
            let SUBDISTRICT_CODE                = registerMappingLocation[0].subdistrict_code;
            let DISTRICT_CODE                   = registerMappingLocation[0].city_code;
            let PROVINCE_CODE                   = registerMappingLocation[0].state_code;
            let SUBDISTRICT_NAME                = registerMappingLocation[0].subdistrict_name;
            let DISTRICT_NAME                   = registerMappingLocation[0].city_name;
            let PROVINCE_NAME                   = registerMappingLocation[0].state_code;
            let ZIPCODE                         = registerMappingLocation[0].zipcode;
            req.body.insuredPerson.registerAddress                 = req.body.insuredPerson.addresses[0].addressLine1;
            req.body.insuredPerson.registerSubDistrictCode         = SUBDISTRICT_CODE;
            req.body.insuredPerson.registerDistrictCode            = DISTRICT_CODE;
            req.body.insuredPerson.registerStateCode               = PROVINCE_CODE;
            req.body.insuredPerson.registerSubDistrictName         = SUBDISTRICT_NAME;
            req.body.insuredPerson.registerDistrictName            = DISTRICT_NAME;
            req.body.insuredPerson.registerStateName               = PROVINCE_NAME;
            req.body.insuredPerson.registerPostalCode              = ZIPCODE;
            next();
        }else {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"subdistrictCode's insuredPerson is invalid.", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }
    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"subdistrictCode's insuredPerson is required.", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }
}

exports.currentLocationValidate = (req, res, next) => {
    if(req.body.insuredPerson.addresses[1]) {
        let currentSubDistrictCode                     = req.body.insuredPerson.addresses[1].subDistrict;
        let currentMappingLocation                     = locationMapping.Location_Mapping.filter(location => {
            return location.subdistrict_code == currentSubDistrictCode
        })
        if(currentMappingLocation[0]) {
            let SUBDISTRICT_CODE                                    = currentMappingLocation[0].subdistrict_code;
            let DISTRICT_CODE                                       = currentMappingLocation[0].city_code;
            let PROVINCE_CODE                                       = currentMappingLocation[0].state_code;
            let SUBDISTRICT_NAME                                    = currentMappingLocation[0].subdistrict_name;
            let DISTRICT_NAME                                       = currentMappingLocation[0].city_name;
            let PROVINCE_NAME                                       = currentMappingLocation[0].state_name;
            let ZIPCODE                                             = currentMappingLocation[0].zipcode;
            req.body.insuredPerson.currentAddress                   = req.body.insuredPerson.addresses[1].addressLine1;
            req.body.insuredPerson.currentSubDistrictCode           = SUBDISTRICT_CODE;
            req.body.insuredPerson.currentDistrictCode              = DISTRICT_CODE;
            req.body.insuredPerson.currentStateCode                 = PROVINCE_CODE;
            req.body.insuredPerson.currentSubDistrictName           = SUBDISTRICT_NAME;
            req.body.insuredPerson.currentDistrictName              = DISTRICT_NAME;
            req.body.insuredPerson.currentStateName                 = PROVINCE_NAME;
            req.body.insuredPerson.currentPostalCode                = ZIPCODE;
            next()
        }else {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"subdistrictCode's insuredPerson is invalid.", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }

    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"subdistrictCode's insuredPerson is required.", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }   
}

exports.payerLocationValidate = (req, res, next) => {
    if(req.body.payer.addresses[0]) {
        let registerSubDistrictCode                     = req.body.payer.addresses[0].subDistrict;
        let registerMappingLocation                     = locationMapping.Location_Mapping.filter(location => {
            return location.subdistrict_code == registerSubDistrictCode
        })
        if(registerMappingLocation[0]) {
            let SUBDISTRICT_CODE                = registerMappingLocation[0].subdistrict_code;
            let DISTRICT_CODE                   = registerMappingLocation[0].city_code;
            let PROVINCE_CODE                   = registerMappingLocation[0].state_code;
            let SUBDISTRICT_NAME                = registerMappingLocation[0].subdistrict_name;
            let DISTRICT_NAME                   = registerMappingLocation[0].city_name;
            let PROVINCE_NAME                   = registerMappingLocation[0].state_code;
            let ZIPCODE                         = registerMappingLocation[0].zipcode;
            req.body.payer.registerAddress                 = req.body.payer.addresses[0].addressLine1;
            req.body.payer.registerSubDistrictCode         = SUBDISTRICT_CODE;
            req.body.payer.registerDistrictCode            = DISTRICT_CODE;
            req.body.payer.registerStateCode               = PROVINCE_CODE;
            req.body.payer.registerSubDistrictName         = SUBDISTRICT_NAME;
            req.body.payer.registerDistrictName            = DISTRICT_NAME;
            req.body.payer.registerStateName               = PROVINCE_NAME;
            req.body.payer.registerPostalCode              = ZIPCODE;
            next();
        }else {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"subdistrictCode's payer is invalid.", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }

    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"subdistrictCode's payer is required.", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }   
}

exports.currentPayerLocationValidate = (req, res, next) => {
    if(req.body.payer.addresses[1]) {
        let currentSubDistrictCode                     = req.body.payer.addresses[1].subDistrict;
        let currentMappingLocation                     = locationMapping.Location_Mapping.filter(location => {
            return location.subdistrict_code == currentSubDistrictCode
        })
        if(currentMappingLocation[0]) {
            let SUBDISTRICT_CODE                                    = currentMappingLocation[0].subdistrict_code;
            let DISTRICT_CODE                                       = currentMappingLocation[0].city_code;
            let PROVINCE_CODE                                       = currentMappingLocation[0].state_code;
            let SUBDISTRICT_NAME                                    = currentMappingLocation[0].subdistrict_name;
            let DISTRICT_NAME                                       = currentMappingLocation[0].city_name;
            let PROVINCE_NAME                                       = currentMappingLocation[0].state_name;
            let ZIPCODE                                             = currentMappingLocation[0].zipcode;
            req.body.payer.currentAddress                   = req.body.payer.addresses[1].addressLine1;
            req.body.payer.currentSubDistrictCode           = SUBDISTRICT_CODE;
            req.body.payer.currentDistrictCode              = DISTRICT_CODE;
            req.body.payer.currentStateCode                 = PROVINCE_CODE;
            req.body.payer.currentSubDistrictName           = SUBDISTRICT_NAME;
            req.body.payer.currentDistrictName              = DISTRICT_NAME;
            req.body.payer.currentStateName                 = PROVINCE_NAME;
            req.body.payer.currentPostalCode                = ZIPCODE;
            next()
        }else {
            const errorResponse = {    
                    isSuccess           :false,           
                    errorMessage        :"subdistrictCode's payer is invalid.", 
                    applicationcode     :req.body.applicationcode,   
                    contractId          :"",    
                    policyNumber        :"",     
                    policyStartDate     :req.body.policyStartDate,     
                    policyExpiryDate    :req.body.policyExpiryDate,    
                    documentUrl         :"",    
                    policyStatus        :"REJECTED"    
                }  
            res.json(errorResponse)
        }

    }else {
        const errorResponse = {    
                isSuccess           :false,           
                errorMessage        :"subdistrictCode's payer is required.", 
                applicationcode     :req.body.applicationcode,   
                contractId          :"",    
                policyNumber        :"",     
                policyStartDate     :req.body.policyStartDate,     
                policyExpiryDate    :req.body.policyExpiryDate,    
                documentUrl         :"",    
                policyStatus        :"REJECTED"    
            }  
        res.json(errorResponse)
    }      
}

exports.running = (req, res, next) => {

    sswClient.get("RUNNING", function(err, value){
        if(err) {
            console.log("RUNNING ERROR : ", err)
            res.json({RUNNING: err})
        }
        if(!value) {
            console.log("RUNNIG !VALUE : ", value)
            let running         = 0;
            let runningKey      = pad(running, 5)
            sswClient.set("RUNNING", running)
            res.json({RUNNING: runningKey})
        }else {
            console.log("RUNNING VALUE : ", value)
            let running = parseInt(value) + 1
            let runningKey      = pad(running, 5)
            sswClient.set("RUNNING", running)
            res.json({RUNNING: runningKey})
        }
    })
}

function getRunning() {
    var redis_running_key = sswClient.get("RUNNING")
    
    console.log("redis_running_key ; ", redis_running_key) 
    return redis_running_key
    
}

function createRunningNumber(runningNo) {

    if(!runningNo) {
        var counter = 0
    }else {
        var counter = runningNo;
    }
    
    counter += 1;
    return counter
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function dataMapping(req, res) {
    try {
        const insured               = insuredMapping(req)                                 ;
        const vehicle               = vehicleMapping(req)                                 ;
        const driver                = driverMapping(req)                                  ;
        const decorate              = decorateMapping(req)                                ;
        const receipt               = receiptMapping(req)                                 ;
        const productPackage        = packageMapping(req)                                 ;
        const mappingData = {            
            agentCode               :"16287",
            saleName                :"16287",
            applicationNo           :req.body.applicationcode,
            quotationCode           :"",
            appSignDate             :formatDate(new Date(), true),
            effectiveDate           :formatDate(req.body.policyStartDate, true),
            expiredDate             :formatDate(req.body.policyExpiryDate, true),
            // * DECORATE IS HARD-CODE.
            ...productPackage,
            ...insured,
            ...vehicle,
            ...driver,
            deductible_tppd         :req.body.mappingProductGroup.coverages[0] ? deductibleTppdMapping(req.body.mappingProductGroup.coverages[0].coverageItems): "",
            deductible              :req.body.mappingProductGroup.coverages[0] ? deductibleMapping(req.body.mappingProductGroup.coverages[0].coverageItems): "",
            // * DECORATE IS HARD-CODE.
            ...decorate,
            benefName               :req.body.beneficiary ? 
                                    req.body.beneficiary : 
                                    `${req.body.insuredPerson.title} ` +
                                    `${req.body.insuredPerson.firstName} ` + 
                                    `${req.body.insuredPerson.lastName} ` ,
            // * RECEIPT IS HARD-CODE.
            ...receipt,

            flagOnline              :"1",
            emailCustomer           :"",
            emailAgent              :"",
            channel                 :"001"
               }
        return mappingData

    }catch (error) {
        res.json('datamapping : ',error)
    }

}

function insuredMapping(req) {
    try{
        const insuredInfo               = req.body.insuredPerson;
        const identificationDocuments   = req.body.insuredPerson.identificationDocuments;
        const insured                 = {
            // STILL HARD-CODE
            insuredcardType         :identityTypeMapping(identificationDocuments[0].identityType),
            insuredcardNo           :identificationDocuments[0].identityNumber,
            insuredType             :personTypeMapping(insuredInfo.type),
            insuredTitleName        :titleMapping(insuredInfo.title),
            insuredName             :insuredInfo.firstName,
            insuredLastName         :insuredInfo.lastName,
            insuredCompanyName      :"",
            insuredHeadOffice       :(personTypeMapping(insuredInfo.type) == "C") ? "Y" : "",
            insuredBranchCode       :"",
            insuredGender           :genderMapping(insuredInfo.gender),
            insuredBirthDate        :formatDate(insuredInfo.birthDate, true),
            insuredOccupationCode   :insuredInfo.occupation,
            insuredOccupation       :insuredInfo.insuredOccupationName,
            insuredTelephone        :"",
            insuredMobileNo         :insuredInfo.mobilePhone,
            insuredHomeNo           :req.body.insuredPerson.registerAddress.substr(0,15),
            insuredBuilding         :req.body.insuredPerson.registerAddress.substr(15),
            insuredMoo              :req.body.insuredPerson.registerAddress.substr(65),
            insuredTrok             :req.body.insuredPerson.registerAddress.substr(115),
            insuredSoi              :req.body.insuredPerson.registerAddress.substr(165),
            insuredRoad             :req.body.insuredPerson.registerAddress.substr(215),
            insuredTambol           :req.body.insuredPerson.registerSubDistrictName,
            insuredAmphur           :req.body.insuredPerson.registerDistrictName,
            insuredProvince         :req.body.insuredPerson.registerStateCode,
            insuredPostcode         :req.body.insuredPerson.registerPostalCode
        }
        return insured

    }catch (error) {
        res.json('insuredMapping : ',error)
    }

}

function vehicleMapping(req) {
    try{
        let vehicleInfo             = req.body.vehicle                          ;
        let carType                 = carTypeMapping(vehicleInfo.usage)         ;
        let garageType              = garageTypeMapping(vehicleInfo.garageType) ;
        const vehicle               = {
            carType                 :carType,
            vehicleType             :vehicleInfo.usage,
            carBrand                :vehicleInfo.mappingCarMake.carmakename,
            carModel                :vehicleInfo.mappingCarModel.carmodelname,
            carSubModel             :`${vehicleInfo.mappingCarModel.carmodelname} ${vehicleInfo.mappingCarModel.caroption}`,
            vehicleRegYear          :vehicleInfo.yearOfRegistration,
            cc                      :vehicleInfo.mappingCarModel.c,
            seat                    :vehicleInfo.mappingCarModel.seat,
            weight                  :vehicleInfo.mappingCarModel.weight,
            carcolorCode            :"99",
            bodyType                :bodyTypeMapping(vehicleInfo.usage),
            flagExtraAccessories    :"N",
            licensePlateType        :vehicleInfo.registrationNumber ? "B" : "R",
            licensePlateNo          :vehicleInfo.registrationNumber,
            licenseProvince         :vehicleInfo.registrationState,
            repairType              :garageType,
            chassisNo               :vehicleInfo.vehicleIdentificationNumber,
            engineNo                :vehicleInfo.engineNumber,
        }
        return vehicle
        
    }catch (error) {
        res.json('vehicleMapping : ',error)
    }
}

function packageMapping(req) {
    try{    
        if(req.body.mappingProductGroup) {
            const productGroup = {
                packageCode             :req.body.mappingProductGroup.productgroupcode,
                packageName             :"",
                subPackageCode          :"",
                subPackageName          :"",
                sumInsured              :req.body.mappingProductGroup.coverages[0].sumInsured.toString(),
                netPremium              :req.body.mappingProductGroup.netPremium.toString(),
                grossPremium            :req.body.mappingProductGroup.grossPremium.toString(),
                vat                     :req.body.mappingProductGroup.additionalCosts[0].amount.toString(),
                stamp                   :req.body.mappingProductGroup.additionalCosts[1].amount.toString(),            
                productClass            :coverTypeMapping(req.body.mappingProductGroup.coverages[0].cover_type),
            }
            return productGroup
        }else {
            const productGroup = {}
            return productGroup
        }
        
    }catch (error) {
        res.json('packageMapping : ',error)
    }
}

function coverTypeMapping(coverType) {
    const productClass = coverType; 
    switch(productClass) {
        case "VMI1":
            return "1"
        case "VMI2":
            return "2"
        case "VMI2+":
            return "5"
        case "VMI3":
            return "3"
        case "VMI3+":
            return "5"
        default:
            return "" 
    }
}

function deductibleTppdMapping(coverageItems) {
    
    let deductibleTppdItem = coverageItems.filter(coverageItem => {
        return coverageItem.name == "Deduct Amount"
    })

    if(deductibleTppdItem && deductibleTppdItem[0]) {
        return deductibleTppdItem[0].sumInsured.toString()
    }else {
        return ""
    }

}

function deductibleMapping(coverageItems) {
    let deductibleItem = coverageItems.filter(coverageItem => {
        return coverageItem.name == "Sum Insured"
    })

    if(deductibleItem && deductibleItem[0]) {
        return deductibleItem[0].sumInsured.toString()
    }else {
        return ""
    }
    
}

function bodyTypeMapping(carType) {
    
    switch(carType) {
        case "110":
            // รถยนต์นั่ง.
            return "A01"
            break;
        case "210":
            // รถยนต์โดยสาร.
            return "C02"
            break;
        case "320":
            // รถยนต์บรรทุก
            return "F21"
            break;
        default:
            return ""
    }   
}


function vehicleTypeMapping(carType) {
    switch(carType) {
        case "110":
            // รถยนต์นั่ง.
            return "1.10"
            break;
        case "210":
            // รถยนต์โดยสาร.
            return "1.40A"
            break;
        case "320":
            // รถยนต์บรรทุก
            return "1.40A"
            break;
        default:
            return ""
    }   
}

function carTypeMapping(vehicleUsage) {
    const carType = vehicleUsage; 
    switch(carType) {
        case "110":
            // รถยนต์นั่ง.
            return "1"
            break;
        case "210":
            // รถยนต์โดยสาร.
            return "2"
            break;
        case "320":
            // รถยนต์บรรทุก
            return "3"
            break;
        default:
            return ""
    }        
}

function garageTypeMapping(vehicleGarageType) {
    const garageType = vehicleGarageType; 
    switch(garageType) {
        case "DEALER":
            // "ซ่อมห้าง"
            return "Y"
            break;
        case "COMPANY":
            // "ซ่อมอู่"
            return "N"
            break;
        default:
            // "ซ่อมอู่"
            return ""
    }        
}

function titleMapping(title) {
    const titleName = title; 
    switch(titleName.toUpperCase()) {
        case "KHUN":
            // "KHUN"
            return "1"
            break;
        case "MISS":
            // "MISS"
            return "9"
            break;
        case "MR.":
            // "MR."
            return "7"
            break;
        case "MS.":
            // "MS."
            return "19"
            break;
        case "คุณ":
            // "คุณ"
            return "1"
            break;
        case "นาง":
            // "นาง"
            return "3"
            break;
        case "นางสาว":
            // "นางสาว"
            return "4"
            break;
        case "นาย":
            // "นาย"
            return "2"
            break;
        default:
            // "คุณ"
            return ""
    }   
}

function genderMapping(sswGender) {
    const gender = sswGender;
    switch(gender.toUpperCase()) {
        case "MALE":
            // "ผู้ชาย"
            return "M"
        case "FEMALE":
            // "ผู้หญิง"
            return "F"
        default:
            // "ไม่ระบุเพศ"
            return ""
    }
}

function identityTypeMapping(idType) {
    const identityType = idType;
    switch(identityType) {
        case "NRIC":
            // ID CARD
            return "C"
        case "PASS":
            // PASSPORT
            return "P"
        case "COMNO":
            // COMPANY NO
            return "L"
        default:
            // ID CARD
            return ""
    }
}

function personTypeMapping(person) {
    const personType = person;
    switch(personType) {
        case "PERSON":
            // Person
            return "P"
        case "COMPANY":
            // Company
            return "C"
        default:
            // Default
            return "" 
    }
}

function driverMapping(req) {

    if(req.body.driver && (req.body.driver.length > 0)) {
        const driver1Info            = req.body.driver[0]               ;
        const driver2Info            = req.body.driver[1]               ;

        const driver = {
            flagDriver              :(req.body.driver.length < 1) ? "N"                         : req.body.driver.length.toString(),
            driver1TitleName        :driver1Info ? titleMapping(driver1Info.title)              : "",
            driver1Fname            :driver1Info ? driver1Info.firstName                        : "",
            driver1Lname            :driver1Info ? driver1Info.lastName                         : "",
            driver1Gender           :driver1Info ? genderMapping(driver1Info.gender)            : "",
            driver1BirthDate        :driver1Info ? formatDate(driver1Info.birthDate,true)       : "",
            driver1LicenseNo        :driver1Info ? driver1Info.licenseNo                        : "",
            driver1OccupationCode   :"",
            driver1Occupation       :"",
            driver2TitleName        :driver2Info ? titleMapping(driver2Info.title)              : "",
            driver2Fname            :driver2Info ? driver2Info.firstName                        : "",
            driver2Lname            :driver2Info ? driver2Info.lastName                         : "",
            driver2Gender           :driver2Info ? genderMapping(driver2Info.gender)            : "",
            driver2BirthDate        :driver2Info ? formatDate(driver2Info.birthDate,true)       : "",
            driver2LicenseNo        :driver2Info ? driver2Info.licenseNo                        : "",
            driver2OccupationCode   :"",
            driver2Occupation       :""
        }
        return driver
    }else {
        const driver = {
            flagDriver              :"N",
            driver1TitleName        :"",
            driver1Fname            :"",
            driver1Lname            :"",
            driver1Gender           :"",
            driver1BirthDate        :"",
            driver1LicenseNo        :"",
            driver1OccupationCode   :"",
            driver1Occupation       :"",
            driver2TitleName        :"",
            driver2Fname            :"",
            driver2Lname            :"",
            driver2Gender           :"",
            driver2BirthDate        :"",
            driver2LicenseNo        :"",
            driver2OccupationCode   :"",
            driver2Occupation       :""
        }
        return driver
    }
}

function receiptMapping(req) {
    const payer         = req.body.payer;
    const insured       = req.body.insuredPerson
    if((payer.firstName == insured.firstName) && (insured.lastName == insured.lastName)) {
        const receipt = {
            receiptFlag             :"N",
            receiptCardType         :"",
            receiptCardNo           :"",
            receiptInsurerType      :"",
            receiptTitleName        :"",
            receiptFname            :"",
            receiptLname            :"",
            receiptHeadOffice       :"",
            receiptBranchCode       :"",
            receiptHomeNo           :"",
            receiptBuilding         :"",
            receiptMoo              :"",
            receiptTrok             :"",
            receiptSoi              :"",
            receiptRoad             :"",
            receiptTumbol           :"",
            receiptAmphur           :"",
            receiptProvince         :"",
            receiptPostcode         :"",
        }
        return receipt
    }else {
        const receipt = {
            receiptFlag             :"Y",
            receiptcardType         :identityTypeMapping(payer.identificationDocuments[0].identityType),
            receiptcardNo           :payer.identificationDocuments[0].identityNumber,
    
            receiptInsurerType      :personTypeMapping(payer.type),
            receiptTitleName        :titleMapping(payer.title),
            receiptFName            :payer.firstName,
            receiptLName            :payer.lastName,
            receiptCompanyName      :"",
            receiptHeadOffice       :(personTypeMapping(payer.type) == "C") ? "Y" : "",
            receiptBranchCode       :"",
            receiptGender           :genderMapping(payer.gender),
            receiptBirthDate        :formatDate(payer.birthDate, true),
            receiptOccupationCode   :payer.occupation,
            receiptOccupation       :payer.insuredOccupationName,
            receiptTelephone        :"",
            receiptMobileNo         :payer.mobilePhone,
            receiptHomeNo           :req.body.payer.currentAddress ? req.body.payer.currentAddress.substr(0,15) : "",
            receiptBuilding         :req.body.payer.currentAddress ? req.body.payer.currentAddress.substr(15)   : "",
            receiptMoo              :req.body.payer.currentAddress ? req.body.payer.currentAddress.substr(65)   : "",
            receiptTrok             :req.body.payer.currentAddress ? req.body.payer.currentAddress.substr(115)  : "",
            receiptSoi              :req.body.payer.currentAddress ? req.body.payer.currentAddress.substr(165)  : "",
            receiptRoad             :req.body.payer.currentAddress ? req.body.payer.currentAddress.substr(215)  : "",
            receiptTambol           :req.body.payer.currentSubDistrictName,
            receiptAmphur           :req.body.payer.currentDistrictName,
            receiptProvince         :req.body.payer.currentStateCode,
            receiptPostcode         :req.body.payer.currentPostalCode
        }
        return receipt
    }
}

function decorateMapping(req) {
    const decorate = {
        flagDecorateList        :"N",
        decorateList1           :"",
        decorateList2           :"",
        decorateList3           :"",
        decorateList4           :"",
        decorateAmount1         :"",
        decorateAmount2         :"",
        decorateAmount3         :"",
        decorateAmount4         :"",
    }
    return decorate
}

function formatDate(dateString, withoutTime) {

    if(withoutTime) {
        let date        = new Date(moment(dateString)); //this is the format you have")
        let hours       = date.getHours();
        let minutes     = date.getMinutes();
        let secs        = date.getSeconds();
        let year        = date.getFullYear();
        let mouth       = date.getMonth() + 1;
        let dateStr     = date.getDate();
        dateStr         = ("0" + dateStr).slice(-2);
        mouth           = ("0" + mouth).slice(-2);
        hours           = ("0" + hours).slice(-2);
        minutes         = ("0" + minutes).slice(-2);
        secs            = ("0" + secs).slice(-2);
        // let ampm         = hours >= 12 ? 'PM' : 'AM';
        // hours            = hours % 12;
        // hours            = hours ? hours : 12; // the hour '0' should be '12'
        // minutes          = minutes < 10 ? '0'+minutes : minutes;
        // let strTime      = hours + ':' + minutes +':'+secs+ ' ' + ampm; // strTime with AM PM.
        
        let strTime     = hours + ':' + minutes + ':' + secs;
        // return strTime;
        let datePart    = year + "" + mouth + "" + dateStr;
        console.log("Time formatted : ", datePart)
        return datePart;
    }else {
        let date        = new Date(moment(dateString)); //this is the format you have")
        let hours       = date.getHours();
        let minutes     = date.getMinutes();
        let secs        = date.getSeconds();
        let year        = date.getFullYear();
        let mouth       = date.getMonth() + 1;
        let dateStr     = date.getDate();
        dateStr         = ("0" + dateStr).slice(-2);
        mouth           = ("0" + mouth).slice(-2);
        hours           = ("0" + hours).slice(-2);
        minutes         = ("0" + minutes).slice(-2);
        secs            = ("0" + secs).slice(-2);
        // let ampm         = hours >= 12 ? 'PM' : 'AM';
        // hours            = hours % 12;
        // hours            = hours ? hours : 12; // the hour '0' should be '12'
        // minutes          = minutes < 10 ? '0'+minutes : minutes;
        // let strTime      = hours + ':' + minutes +':'+secs+ ' ' + ampm; // strTime with AM PM.
        
        let strTime     = hours + ':' + minutes + ':' + secs;
        // return strTime;
        let datePart    = year + "" + mouth + "" + dateStr + "T" + strTime;
        console.log("Time formatted : ", datePart)
        return datePart;
    }

}