const axios = require('axios');

const SSWCarModel = async function(data) {
    try {
        let carModel  = ""
        const configs = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/cdata/ChannelMasterDBPdt_dbo_SSW2Viriyah_CarModel",
            data: data
        }
        const response = await axios(configs);

        // API Response
        carModel = response.data
        return carModel
    } catch (error) {
        throw error;
    }
}

module.exports = SSWCarModel;