var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (app.get('env') === 'development') { app.use(logger('dev')); }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// catch 404 and forward to error handler
function notFound(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

// Expose static files from the public directory
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/assets', notFound);
app.use('/css', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/css', notFound);
app.use('/img', express.static(path.join(__dirname, 'public/images')));
app.use('/img', notFound);
app.use('/js', express.static(path.join(__dirname, 'public/javascripts')));
app.use('/js', notFound);

app.use('/', require('./routes/index'));
app.use('/api/platforms', require('./routes/platforms'));

// Catch-all for HTML5 mode
app.get('*', function(req, res, next) {
  res.render('index');
});

app.use(notFound);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
