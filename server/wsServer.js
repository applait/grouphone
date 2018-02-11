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
    server: httpServer
  })

  wss.on('connection', (ws, req) => {
    var ok = req.call.setConnectionWebSocket(ws, req.connectionId)
    if (!ok) {
      ws.terminate()
    }
    ws.send(JSON.stringify({ msg: 'Hello' }))
  })
}

module.exports = createWSServer
