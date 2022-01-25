const axios                     = require('axios')                                                  ;
const moment                    = require('moment')                                                 ;
const { v4: uuidv4 }            = require('uuid')                                                   ;
const transectionID             = uuidv4().substring(0, 10)                                         ;
const environment               = require('../configs/environment.json')                            ;
const redis                     = require('redis')                                                  ;
const updatedDate               = new Date().toLocaleString("en-GB", {timeZone: "Asia/Bangkok"})    ;
const sswClient                 = redis.createClient({
    port      : environment.SSW_PORT,
    host      : environment.SSW_HOST
  });

const preValidateCMI = async function(data, req) {
    try {
        const REDIS_KEY             = req.body.redisKey
        console.log("Transection ID : ", transectionID)
        let currentDateMoment       = moment().format("DD-MM-YYYY hh:mm:ss.SSS");
        const configs = {
            method          : "post",
            url             : `${environment.CMI_PREVALIDATE_URL}`,
            headers         : { 
                'sourceTransID'     : `16287_${transectionID}_${currentDateMoment}`, 
                'requestTime'       : `${currentDateMoment}`, 
                'Content-Type'      : 'application/json; charset=utf-8', 
                'Cookie'            : 'SERVERID=virhqcapistaging01'
              },
            data                    : data
        }
        sswClient.hmset(REDIS_KEY,
            "HEADERS"                      , JSON.stringify(configs.headers),
            "UPDATED_DATE"                 , updatedDate,
            "PRODUCT_CODE"                 , "CMI")
        const response = await axios(configs);

        // API Response
        return response.data
    } catch (error) {
        console.log("preValidateCMI : ", error)
        throw error;
    }
}

module.exports = preValidateCMI;