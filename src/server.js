/**
 * Grouphone's API and signaling layer
 */

const SocketIO = require('socket.io')
let sessionHandler = require('./sessionHandler')

const PORT = process.env.NODE_PORT || 8081

let io = new SocketIO(PORT, {
  serveClient: false,
  pingTimeout: 15000,
  pingInterval: 5000,
  transports: ['websocket', 'polling']
}, function () {
  console.log(`Socket server running on port ${PORT}`)
})

io.on('connection', socket => {
  sessionHandler(socket, io)
})
