const axios = require('axios');

const cancelPolicyEDR = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "https://cancelPolicyURL",
            data: data
        }
        const response = await axios(configs);
        
        // API Response
        return response.data

    } catch (error) {
        throw error;
    }
}

module.exports = cancelPolicyEDR;