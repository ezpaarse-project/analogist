/* eslint no-console: 0 */

const { Nuxt, Builder } = require('nuxt')

const app = require('express')()
const logger = require('morgan')
const config = require('config')

const session = require('express-session')
const MongoStore = require('connect-mongo')

process.env.PORT = config.port

const isDev = app.get('env') !== 'production'
if (isDev) { app.use(logger('dev')) }

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: config.cookie.secret,
  cookie: { maxAge: config.cookie.maxAge },
  unset: 'destroy',
  store: MongoStore.create({
    mongoUrl: `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`
  })
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

// Init Nuxt.js
const nuxt = new Nuxt({
  ...nuxtConfig,
  // workaround: tell nuxt that we are running in production and we don't need buildModules
  _start: !nuxtConfig.dev
})
app.use(nuxt.render)

// Build only in dev mode
if (nuxtConfig.dev) {
  new Builder(nuxt).build()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = app
