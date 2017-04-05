/* eslint no-console: 0 */

const Nuxt   = require('nuxt')
const app    = require('express')()
const logger = require('morgan')
const config = require('config')

const session    = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongo      = require('./lib/mongo')

const oneMonth = 3600000 * 24 * 30

process.env.PORT = config.port

const isDev = app.get('env') !== 'production'
if (isDev) { app.use(logger('dev')) }

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'xJ87L71I3025O7812P4g36n39my6VnAH',
  cookie: { maxAge: oneMonth },
  unset: 'destroy',
  store: new MongoStore({ db: mongo.db })
}))

// Import API Routes
app.use('/api', require('./api'))

// API error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.write(isDev ? err.stack : err.message)
  res.end()
})

// Import and Set Nuxt.js options
const nuxtConfig = require('./nuxt.config.js')
nuxtConfig.dev = isDev

// Init Nuxt.js
const nuxt = new Nuxt(nuxtConfig)
app.use(nuxt.render)

// Build only in dev mode
if (nuxtConfig.dev) {
  nuxt.build()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
}


module.exports = app
