const axios                     = require('axios');
const moment                    = require('moment');
const { v4: uuidv4 }            = require('uuid');
const transectionID             = uuidv4().substring(0, 10);
const environment               = require('../configs/environment.json');

const issuanceVMI = async function(data) {
    try {
        console.log("Transection ID : ", transectionID)
        let currentDateMoment   = moment().format("DD-MM-YYYY hh:mm:ss.SSS");
        const configs = {
            method          : "post",
            url             : `${environment.VMI_ISSUANCE_URL}`,
            headers         : { 
                'sourceTransID'     : `16287_${transectionID}_${currentDateMoment}`, 
                'requestTime'       : `${currentDateMoment}`, 
                'Content-Type'      : 'application/json; charset=utf-8', 
                'Cookie'            : 'SERVERID=virhqcapistaging01'
              },
            data            : data
        }
        const response = await axios(configs);

        // API Response
        return response.data
    } catch (error) {
        console.log('issuanceVMI : ',error)
        throw error;
    }
}

module.exports = issuanceVMI;