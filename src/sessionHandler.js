/**
 * Session controller for API server
 */

const crypto = require('crypto')

let createSlug = () => {
  var id = crypto.randomBytes(5).toString('hex')
  return [id.slice(0, 3), id.slice(3, 7), id.slice(7)].join('-')
}

function sessionHandler (socket, io) {
  let sessionConnCount = sessionId => {
    let room = io.sockets.adapter.rooms[sessionId]
    return room ? room.length : 0
  }

  socket.on('session:create', (p2p = true, ack) => {
    const id = createSlug()
    socket.emit('session:created', { session_id: id, p2p: p2p })
    ack({ session_id: id, p2p: p2p })
  })

  socket.on('session:connection_count', (sessionId, ack) => {
    let connCount = sessionId ? sessionConnCount(sessionId) : 0
    ack({ session_id: sessionId, connection_count: connCount })
  })

  socket.on('session:connect', (sessionId, p2p, ack) => {
    socket.join(sessionId, () => {
      let sendData = {
        session_id: sessionId,
        p2p: p2p,
        connection_count: sessionConnCount(sessionId)
      }
      socket.emit('session:connected', sendData)
      socket.broadcast.to(sessionId).emit('user:connected', sendData)
      ack({ session_id: sessionId, connection_count: sessionConnCount(sessionId) })
    })
  })

  socket.on('session:signal', (sessionId, name, payload) => {
    socket.broadcast.to(sessionId).emit('signal:received', { name: name, payload: payload, sender: socket.id })
  })
}

module.exports = sessionHandler
