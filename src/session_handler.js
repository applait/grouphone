/**
 * Session controller for API server
 */

const crypto = require('crypto');

let create_slug = () => {
    var id = crypto.randomBytes(5).toString('hex');
    return [id.slice(0, 3), id.slice(3, 7), id.slice(7)].join('-');
};

function session_handler (socket) {

    socket.on('session:create', (p2p=true, ack) => {
        const id = create_slug();
        socket.emit('session:created', { session_id: id, p2p: p2p });
        ack({ session_id: id, p2p: p2p });
    });

    socket.on('session:connect', (session_id, p2p, ack) => {
        socket.join(session_id, () => {
            socket.emit('session:connected', { session_id: session_id, p2p: p2p });
            socket.broadcast.to(session_id).emit('user:connected', { session_id: session_id, p2p: p2p });
            ack({ session_id: session_id });
        });
    });

    socket.on('session:signal', (session_id, name, payload) => {
        socket.broadcast.to(session_id).emit('signal:received', { name: name, payload: payload, sender: socket.id });
    });

}

module.exports = session_handler;
