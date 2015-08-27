var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);
var Grant        = require('grant-express');

var trello = require('./lib/trello.js');
var config = require('./lib/config.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'xJ87L71I3025O7812P4g36n39my6VnAH',
    store: new MongoStore({
      url: 'mongodb://' + config.MONGO.ADDRESS + ':' + config.MONGO.PORT + '/' + config.MONGO.DB
    })
}));

app.use(new Grant({
  server: {
    protocol: 'http',
    host: 'localhost:' + config.PORT,
    callback: '/',
    transport: 'session'
  },
  trello: {
    key: config.TRELLO.KEY,
    secret: config.TRELLO.SECRET,
    scope: ['read', 'write'],
    custom_params: {
      name: 'AnalogIST'
    }
  }
}));

app.use('/api/loggedin', function (req, res, next) {
  var request = require('request');

  if (req.session.grant) {
    var response = req.session.grant.response;
    if (response && response.access_token && response.access_secret) {
      return trello.getTokenMember(response.access_token).pipe(res);
    }
  }
  res.status(204).end();
});

app.use('/api/logout', function (req, res) {
  delete req.session.grant;
  res.status(204).end();
});

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
  res.render('index', { apiKey: config.TRELLO.KEY, boardID: config.TRELLO.BOARDID });
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
