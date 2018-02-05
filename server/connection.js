const { randomBytes } = require('crypto')

/**
 * Connection represents a single peer connected to a Call on the server-side.
 *
 * It has three main tasks:
 *
 * - manage a Mediasoup `Peer` instance internally
 * - dispatch communication to and from the `Peer`
 * - expose methods to control transports and capabilities of the underlying peer
 */
class Connection {
  constructor (name) {
    this.connectionId = Date.now() + randomBytes(3).toString('hex')
    this.name = name
    this.mediaPeer = null
  }

  /**
   * Disconnects this connection
   */
  disconnect () {
    // TODO
  }
}

module.exports = Connection
