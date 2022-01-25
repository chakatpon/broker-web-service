const moment    = require('moment');
function validateIssueDate(req, res, next) {
    console.log("issueDate Validation in progress.")
    const issueDate = new Date(moment(req.body.ISSUEDATE));
    const today     = new Date()
    const issueYear        = issueDate.getFullYear();
    const issueMonth       = issueDate.getMonth() + 1;
    const issueDay         = issueDate.getDate();
    const thisYear         = today.getFullYear();
    const thisMonth        = today.getMonth() + 1;
    const thisDay          = today.getDate();

    console.log(" issueYear  : ", issueYear)
    console.log(" issueMonth : ", issueMonth)
    console.log(" issueDay   : ", issueDay)
    console.log(" thisYear   : ", thisYear)
    console.log(" thisMonth  : ", thisMonth)
    console.log(" thisDay    : ", thisDay)
    if((issueDay == thisDay) && (issueMonth == thisMonth) && (issueYear == thisYear)) {
        console.log("Validate Success.")
        next()
    }else {

        const err = {
            validationError : true,
            validationMessage : '"ISSUEDATE" cannot be later or earlier than today.'
          }
          console.log("err Validate IssueDate : ", err)
          throw err
    }
}

module.exports = validateIssueDate