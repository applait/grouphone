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
   * Getter to determine if this connection is currently active
   */
  get active () {
    if (this.mediaPeer == null) {
      return false
    }
    return !this.mediaPeer.closed
  }

  /**
   * Disconnects this connection
   */
  disconnect () {
    if (this.mediaPeer) {
      this.mediaPeer.close()
    }
  }

  /**
   * Sends mediasoup protocol message to the underlying Peer instance
   *
   * @param {Object} msg - A mediasoup protocol message object for the underlying Peer
   * @return {Promise} - Returns the mediasoup request/notification result
   */
  peerMessage (msg) {
    if (!this.mediaPeer) {
      return Promise.reject(new Error('Peer not ready'))
    }
    if (msg.notification) {
      return this.mediaPeer.receiveNotification(msg)
    }
    return this.mediaPeer.receiveRequest(msg)
  }
}

module.exports = Connection
