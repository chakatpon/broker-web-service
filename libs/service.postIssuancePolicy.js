const axios = require('axios');

const postIssuancePolicy = async function(data) {
    try {
        const mocking = {
            token           : "4ee08200-d5bd-4b91-984a-24ddb98d17cb",
            paymentInfo     : "100",
            referenceCode   : "5"
        }
        const configs = {
            method: "POST",
            url: "http://10.99.5.175:5100/api/IssuancePolicy",
            data: data
        }
        const response = await axios(configs);
        // console.log("ISSUANCE RESPONSE : ", response.data)
        return response.data
    } catch (error) {
        throw error;
    }
}

module.exports = postIssuancePolicy;