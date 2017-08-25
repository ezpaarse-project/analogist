/* eslint no-console: 0 */

const config = require('config')
const http   = require('http')
const mongo  = require('./lib/mongo')

const port     = normalizePort(config.port || '3000')
const mongoUrl = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`

mongo.connect(mongoUrl, err => {
  if (err) {
    console.error(`Couldn't connect to ${mongoUrl}`)
    process.exit(1)
  }

  startApp()
})

function startApp () {
  const app = require('./app')
  app.set('port', port)

  // Listen the server
  const server = http.createServer(app)

  // Listen on provided port, on all network interfaces.
  server.listen(config.port)
  server.on('error', onError)
  server.on('listening', onListening)

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening () {
    const addr = server.address()
    const bind = typeof addr === 'string'
      ? `pipe ${addr}`
      : `port ${addr.port}`
    console.log(`Listening on ${bind}`)
  }
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val) {
  const p = parseInt(val, 10)

  if (isNaN(p)) {
    // named pipe
    return val
  }

  if (p >= 0) {
    // port number
    return p
  }

  return false
}
