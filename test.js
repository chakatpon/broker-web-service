// Require Redis Here
const redis = require('redis');

// import environmental variables from our variables.env file
// require('dotenv').config();


// Connect to our Database
const testClient = redis.createClient(6379, "vcontainerdev.viriyah.co.th");


testClient.on('connect', () => {
  console.log('##########################################################');
  console.log('#####            REDIS STORE CONNECTED               #####');
  console.log('##########################################################\n');
});

testClient.on('error', (err) => {
  console.log(`Redis error: ${err}`);
});

// Start our app!
const app = require('./app');

// Start Server
app.set('port', process.env.PORT || 4001);
const server = app.listen(app.get('port'), () => {
  console.log('##########################################################');
  console.log('#####               STARTING SERVER                  #####');
  console.log('##########################################################\n');
  console.log(`Express running → PORT ${server.address().port}`);
});

