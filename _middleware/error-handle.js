function errorHandler(err, req, res, next) {
    // console.log("HANDLE ERROR IS : ", err)
    console.log("Error handle : ", err)
    switch (true) {
        case typeof err === "string":
            // custom application error 
            const is404 = err.toLowerCase().endsWith("not found");
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ status:400, message: err});
        case err.name === "UnauthorizedError":
            // jwt authentication error
            return res.status(401).json({ status:401, message: "Unauthorized" });
        case err.validationError:
            //
            return res.status(400).json({
                                            STATUS  : "ERROR", 
                                            MESSAGE : err.validationMessage,
                                            POLICY      : {
                                                TRANSSTATUS : "D",
                                                POLICYNO    : "",
                                                ENDORSENO   : ""
                                                },
                                            TAXINVOICE: []
                                        })
        default:
            return res.status(500).json({
                                            STATUS  : "ERROR", 
                                            MESSAGE : err.message,
                                            POLICY      : {
                                                TRANSSTATUS : "D",
                                                POLICYNO    : "",
                                                ENDORSENO   : ""
                                                },
                                            TAXINVOICE: []
                                        })
    }
}

module.exports = errorHandler