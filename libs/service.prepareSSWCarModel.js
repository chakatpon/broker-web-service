const axios = require('axios');

const prepareSSWCarModel = async function(data) {
    try {
        const brandConfigs     = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/cdata/ChannelMasterDB_dbo_SSW2Viriyah_CarMake",
            data: { sswCode: data.make }
        }
        const modelConfigs     = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/cdata/ChannelMasterDB_dbo_SSW2Viriyah_CarModel",
            data: { carMakeCode: data.make, sswCode: data.model }
        }
        let modelRes = await axios(modelConfigs);
        let brandRes = await axios(brandConfigs);

        // API Response
        let carBrand = brandRes.data.value[0].carmakename
        let carModel = modelRes.data.value[0].carmodelname
        let carMapping = {
            
            carModel: carModel,
            carBrand: carBrand
        }
        return carMapping
    } catch (error) {
        throw error;
    }
}

module.exports = prepareSSWCarModel;