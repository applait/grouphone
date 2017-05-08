/**
 * Grouphone's API and signaling layer
 */

const SocketIO = require('socket.io');
let session_handler = require('./session_handler');

const PORT = process.env.NODE_PORT || 8081;

let server = new SocketIO(PORT, {
    serveClient: false,
    pingTimeout: 15000,
    pingInterval: 5000,
    transports: ['websocket', 'polling']
}, function () {
    console.log(`Socket server running on port ${PORT}`);
});

server.on('connection', socket => {

    session_handler(socket);

});
