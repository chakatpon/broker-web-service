const axios = require('axios');

const cancelPolicyEND = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "http://10.99.5.175:5010/api/CancelPolicyEDR",
            data: data
        }
        const response = await axios(configs);
        // console.log("RESPONSE AXIOS : ", response.data)
        
        // API Response
        return response.data

    } catch (error) {
        throw error;
    }
}

module.exports = cancelPolicyEND;