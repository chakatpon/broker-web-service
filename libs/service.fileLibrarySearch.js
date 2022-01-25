const axios = require('axios');

const fileLibrarySearch = async function(data) {
    try {
        const configs = {
            method: "POST",
            url: "https://vgateway.viriyah.co.th/filelibrary/ws/Search",
            data: data
        }
        let response = await axios(configs);
        let objFileLibrary          = response.data.objFileLibrary
        let policyDocument          = {}
        if(objFileLibrary && objFileLibrary.length > 0) {
            let policyDocuments          = await objFileLibrary.map((file) => {
                let fileURL             = file.filePath;
                return axios.get(fileURL, {
                    responseType: 'arraybuffer'
                  }).then(response => Buffer.from(response.data, 'binary').toString('base64'))
            })

            return Promise.all(policyDocuments)
            .then(responses => {
                // console.log("Responses From Promise All : ", responses)
                let policyDocuments = []
                responses.forEach((response, index) => {
                    let document = {
                        DOCUMENTTYPE            : objFileLibrary[index].RefDocType,
                        COPYTYPE                : "ORG",
                        FILENAME                : objFileLibrary[index].fileName,
                        BINCODE                 : response
                    }
                    switch(objFileLibrary[index].RefDocType) {
                        case "Policy":
                            document['DOCUMENTTYPE'] = "POLICYSCHEDULE"
                            policyDocuments.push(document) 
                          // code block
                          break;
                        case "PolicyAttachment":
                            document['DOCUMENTTYPE'] = "POLICYSCHEDULE"
                            policyDocuments.push(document) 
                          // code block
                            break;
                        case "Receipt":
                            document['DOCUMENTTYPE'] = "TAXINVOICE"
                            policyDocuments.push(document) 
                          // code block
                            break;
                        default:
                            policyDocuments.push(document) 
                          // code block
                      }    
                })
                return policyDocuments
            })

        }else {
            policyDocument = response.data
        }
        
        return policyDocument
          
        
    }catch(error) {
        throw error;
    }
}

function getBase64(url) {
    return axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
  }

module.exports = fileLibrarySearch;