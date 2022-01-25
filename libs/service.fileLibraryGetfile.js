const axios = require('axios');

const fileLibraryGetfile = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/filelibrary/ws/GetFile",
            data: data
        }
        const response = await axios(configs);

        // API Response
        return response.data
    } catch (error) {
        throw error;
    }
}

module.exports = fileLibraryGetfile;