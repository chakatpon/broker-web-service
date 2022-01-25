const axios = require('axios');

const postAttachFile = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "https://api-uat.meinsurance.co.th/meservicer/api/policy/wsAttachFile",
            data: data
        }
        const response = await axios(configs);
        // console.log("RESPONSE AXIOS : ", response.data)
        if(response.data && (response.data.STATUS == "ERROR")) {
            throw response.data
        }
        
        // API Response
        return response.data

    } catch (error) {
        throw error;
    }
}

module.exports = postAttachFile;