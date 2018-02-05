const WebSocket = require('ws')

function bootstrap (wss, mediaServer) {
  wss.on('connection', (ws) => {
    // Do more here
  })
}

function createWSServer (httpServer, mediaServer) {
  let wss = new WebSocket.Server({
    server: httpServer
  })
  bootstrap(wss, mediaServer)
}

module.exports = createWSServer
