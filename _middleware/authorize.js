const { sub, secret } = require("../config.json");
const passport = require("passport");

// Use for decode JWT
const ExtractJwt = require("passport-jwt").ExtractJwt;
// Use for declare Strategy
const JwtStrategy = require("passport-jwt").Strategy;

// Craete Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: secret
}
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
    if(payload.sub == sub) done(null, true);
    else done(null, false);
})

// Use Strategy in Passport.
passport.use(jwtAuth);

// Create Passport Middleware
const requireJWTAuth = passport.authenticate('jwt', { session: false});


module.exports = requireJWTAuth;

