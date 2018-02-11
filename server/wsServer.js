const WebSocket = require('ws')
const { parse } = require('url')

function createWSServer (httpServer, callManager) {
  function verifyClient (info, done) {
    const query = parse(info.req.url, true).query
    if (!query.callId || !query.connectionId) {
      done(false, 400, 'Invalid websocket request')
      return
    }
    if (!callManager.has(query.callId)) {
      done(false, 404, 'Invalid call ID')
      return
    }
    const c = callManager.getCall(query.callId)
    if (!c.hasConnection(query.connectionId)) {
      done(false, 404, 'Invalid connection ID')
      return
    }
    info.req.call = c
    info.req.callId = query.calllId
    info.req.connectionId = query.connectionId
    done(true)
  }

  let wss = new WebSocket.Server({
    verifyClient: verifyClient,
    server: httpServer,
    path: '/notifications'
  })

  function noop () {}

  function heartbeat () {
    console.log('Pong')
    this.isAlive = true
  }

  wss.on('connection', (ws, req) => {
    ws.isAlive = true
    ws.on('pong', heartbeat)
    var ok = req.call.setConnectionWebSocket(ws, req.connectionId)
    if (!ok) {
      ws.terminate()
      return
    }
    setInterval(function ping () {
      if (ws.isAlive === false) {
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(noop)
    }, 30000)
  })
}

module.exports = createWSServer
