var auth        = require('basic-auth');
var compare     = require('tsscmp');

function bigcAuthorized(req, res, next) {
    var credentials = auth(req)
    // Check credentials
    // The "check" function will typically be against your user store
    if (!credentials || !check(credentials.name, credentials.pass)) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
    } else {
        // res.end("Access granted")
        next()
    }
}

// Basic function to validate credentials for example.
function check (name, pass) {
    var valid = true;

    // Simple method to prevent short-circut and use timing-safe compare
    valid = compare(name, 'bigcadmin') && valid;
    valid = compare(pass, 'whatever') && valid;

    return valid
}

module.exports = bigcAuthorized;