const axios = require('axios');

const fileLibrarySearch = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/filelibrary/ws/Search",
            data: data
        }
        const response = await axios(configs);
        return response.data
    }catch(error) {
        throw error;
    }
}

module.exports = fileLibrarySearch;