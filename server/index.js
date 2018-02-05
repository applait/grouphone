/**
 * Grouphone's API and signaling layer
 */

const express = require('express')
const bodyParser = require('body-parser')
const debug = require('util').debuglog('app')
const http = require('http')

const mediaServer = require('./mediaServer')
const wsServer = require('./wsServer')

/**
 * Instantiate ExpressJS instance
 */
const app = express()

// Get port from environment and store in Express
const port = process.env.PORT || '8081'
app.set('port', port)

// Parse application/json
app.use(bodyParser.json())

// Mount HTTP API routes
app.use('/', require('./routes')(mediaServer))

/**
 * Create HTTP server.
 */
const server = http.createServer(app)

// Mount websocket server
wsServer(server, mediaServer)

// Launch HTTP server
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}

module.exports = app
