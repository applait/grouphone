const WebSocket = require('ws')

function bootstrap (wss, callManager) {
  wss.on('connection', (ws) => {
    // Do more here
  })
}

function createWSServer (httpServer, callManager) {
  let wss = new WebSocket.Server({
    server: httpServer
  })
  bootstrap(wss, callManager)
}

module.exports = createWSServer
