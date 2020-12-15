const app    = require('express')()
const logger = require('morgan')
const config = require('config');

const session    = require('express-session')
const MongoStore = require('connect-mongo')(session)

const pkg = require('./package.json');

process.env.PORT = config.port

const isDev = app.get('env') !== 'production'
if (isDev) { app.use(logger('dev')) }

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: config.cookie.secret,
  cookie: { maxAge: config.cookie.maxAge },
  unset: 'destroy',
  store: new MongoStore({
    url: `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`
  })
}))

app.get('/', (req, res) => res.json({
  name: pkg.name,
  version: pkg.version,
}));

// Import API Routes
app.use('/api', require('./controllers'))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// API error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.write(isDev ? err.stack : err.message)
  res.end()
})

module.exports = app
