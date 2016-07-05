var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('client-sessions');

var app = express();

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({secret: '123456789', duration: 30*60*1000, activeDuration: 5*60*1000, cookieName: 'session'}));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.type('text/html'); 
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.type('text/html'); 
  res.send({
    message: err.message,
    error: {}
  });
});

module.exports = app;
