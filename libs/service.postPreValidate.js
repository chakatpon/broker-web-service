const axios = require('axios');

const postPreValidate = async function(data) {
    try {
        // console.log("Pre-Validate Data : ", data);
        const configs = {
            method  : 'POST',
            url     : "http://10.99.5.175:5010/api/PreValidate",
            data    : data
        }
        const response = await axios(configs);
        // console.log("RESPONSE AXIOS : ", response.data)
        return response.data
    } catch (error) {
        throw error;
    }
}

module.exports = postPreValidate;