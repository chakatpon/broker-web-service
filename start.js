// Require Redis Here
const redis       = require('redis');
const environment = require('./configs/environment.json')

// import environmental variables from our variables.env file
// require('dotenv').config();

// Connect to our Database
var redisClient = redis.createClient({
  port      : environment.REDIS_PORT,
  host      : environment.REDIS_HOST
});

var bigcClient = redis.createClient({
  port      : environment.BIGC_PORT,
  host      : environment.BIGC_HOST
});

var sswClient = redis.createClient({
  port      : environment.SSW_PORT,
  host      : environment.SSW_HOST
});


redisClient.on('connect', () => {
  console.log('##########################################################');
  console.log('#####            REDIS STORE CONNECTED               #####');
  console.log('##########################################################\n');
});

redisClient.on('error', (err) => {
  console.log(`Redis error: ${err}`);
});

bigcClient.on('connect', () => {
  console.log('##########################################################');
  console.log('#####            BIG-C STORE CONNECTED               #####');
  console.log('##########################################################\n');
});

bigcClient.on('error', (err) => {
  console.log(`BIG-C error: ${err}`);
});

sswClient.on('connect', () => {
  console.log('##########################################################');
  console.log('#####            SSW STORE CONNECTED                 #####');
  console.log('##########################################################\n');
});

sswClient.on('error', (err) => {
  console.log(`SSW error: ${err}`);
});


// Start our app!
const app = require('./app');

// Start Server
app.set('port', environment.PORT || 4000);
const server = app.listen(app.get('port'), () => {
  console.log('##########################################################');
  console.log('#####               STARTING SERVER                  #####');
  console.log('##########################################################\n');
  console.log(`Express running → PORT ${server.address().port}`);
});

