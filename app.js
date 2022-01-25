const express               = require('express');
const expressValidator      = require('express-validator');
const logger                = require('morgan');
const cookieParser          = require('cookie-parser');
const bodyParser            = require('body-parser');

// Middleware
const errorHandle           = require('./_middleware/error-handle')

// Routes
const index                 = require('./routes/index');
const motor                 = require('./routes/motor.route');
const SSWMotor              = require('./routes/SSWMotor.route');
const wsPolicyDetailAH      = require("./routes/policyDetailAH.route");
const camundaService        = require('./routes/camundaService.route');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Exposes a bunch of methods for validating data input
app.use(expressValidator());
app.use(cookieParser());

// Handle SSW Routes
app.use("/motor",    motor)
app.use("/sswmotor", SSWMotor)

// // Handle Big-C Routes
app.use('/wsPolicyDetail_AH', wsPolicyDetailAH);
app.use("/Camunda_Service", camundaService);

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(errorHandle)

// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   console.log(err);
//   res.json({ status: 400, message: 'Bad Request', err });
// });

module.exports = app;
