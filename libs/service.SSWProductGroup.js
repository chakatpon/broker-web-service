const axios = require('axios');

const SSWProductGroup = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/cdata/ChannelMasterDBPdt_dbo_SSW2Viriyah_ProductGroup",
            data: data
        }
        const response = await axios(configs);

        // API Response
        return response.data
    } catch (error) {
        throw error;
    }
}

module.exports = SSWProductGroup;