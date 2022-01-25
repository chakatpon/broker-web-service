const axios = require('axios');

const SSWCarMake = async function(data) {
    try {
        let   carBrand    = ""
        const configs     = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/cdata/ChannelMasterDBPdt_dbo_SSW2Viriyah_CarMake",
            data: data
        }
        const response = await axios(configs);

        // API Response
        carBrand = response.data
        return carBrand
    } catch (error) {
        throw error;
    }
}

module.exports = SSWCarMake;