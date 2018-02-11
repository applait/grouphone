const EventEmitter = require('events')
const { randomBytes } = require('crypto')

const sfuConfig = require('./sfuConfig')
const Connection = require('./connection')

/**
 * Creates a new room ID
 *
 * @returns {string} A 6 character string separated by a hyphen, in the format `xxx-xxx`.
 */
function createId () {
  const id = randomBytes(3).toString('hex')
  return [id.slice(0, 3), id.slice(3)].join('-')
}

/**
 * Call represents a single Grouphone call handled by this server.
 *
 * It has three main tasks:
 *
 * - manage a Mediasoup `Room` internally
 * - maintains list of connections created for the call, each of which in turn handles a Mediasoup `Peer`
 * - dispatch communication to and from the Mediasoup `Room` and connected `Peer`
 */
class Call extends EventEmitter {
  /**
   * Create a new instance of Call
   *
   * @param {mediasoup.Server} mediaServer - An instance of a Mediasoup Server
   */
  constructor (mediaServer) {
    super()

    /**
     * ID of the current `Call`. This value should be used everywhere to denote this Call.
     */
    this.callId = createId()

    /**
     * The mediasoup `Room` that this call handles internally. All connections to this `Call` join this `Room` in
     * mediasoup.
     */
    this.mediaRoom = mediaServer.Room(sfuConfig.mediaCodecs)

    /**
     * Stores map of `Connection` objects keyed by `Connection.connectionId`
     */
    this.connections = new Map()

    // Setup the mediaRoom
    this._setupMediaRoom()
  }

  /**
   * Get number of current active connections
   */
  get connectionCount () {
    return this.connections.size
  }

  get activeConnections () {
    return Array.from(this.connections.values()).filter(c => c.active)
  }

  get connectionStatus () {
    return Array.from(this.connections.values()).map(c => ({
      connectionId: c.connectionId,
      active: c.active,
      name: c.name
    }))
  }

  /**
   * Tells if the room is closed now
   */
  get closed () {
    return this.mediaRoom && this.mediaRoom.closed
  }

  /**
   * Returns true if given connection ID is present
   *
   * @param {string} connectionId - The connection ID
   * @returns {boolean} Returns true if the connection exists
   */
  hasConnection (connectionId) {
    return this.connections.has(connectionId)
  }

  /**
   * Close a call. This closes the underlying mediasoup room as well.
   *
   * @fires Call#close
   */
  close () {
    if (this.closed) {
      // TODO: this should do something meaningful. May be throw an error or reject a Promise?
      return
    }
    if (!this.closed) {
      this.mediaRoom.close()
    }

    /**
     * Call close event
     *
     * @event Call#close
     *
     */
    this.emit('close', this._callId)
  }

  /**
   * Create a new connection instance for the room
   *
   * @param {string|null} [peerName=null] - an optional name for the peer of the connection
   * @returns {string} The new connection ID
   * @fires Call#connectionCreated
   */
  connect (peerName = null) {
    const c = new Connection(peerName)

    /**
     * Fired when a new `Connection` is created in the call
     *
     * @event Call#connectionCreated
     * @param {Connection} c - The connection that was created
     */
    this.emit('connectionCreated', c)

    this.connections.set(c.connectionId, c)
    return c.connectionId
  }

  /**
   * Disconnect an existing connection in the room
   *
   * @param {string} connectionId - The connection ID of the `Connection` to disconnect
   * @return {boolean} - Set to `true` if connection was successfully deleted. Else, is `false` if connection was
   * invalid or could not be deleted.
   * @fires Call#connectionDestroyed
   */
  disconnect (connectionId) {
    if (this.connections.has(connectionId)) {
      const c = this.connections.get(connectionId)
      c.disconnect()

      /**
       * Denotes a connection is destroyed
       *
       * @event Call#connectionDestroyed
       * @param {Connection} c - The connection that was destroyed
       */
      this.emit('connectionDestroyed', c)

      return this.connections.delete(connectionId)
    }
    return false
  }

  /**
   * Set WebSocket for a given connection ID. This is set when a client for a specific connection ID connects over
   * WebSockets.
   *
   * @param {ws.WebSocket} ws - A WebSocket instance
   * @param {string} connectionId - The ID of connection where the Websocket instance should be added
   * @returns {boolean} Returns true if the connection was found and the websocket instance for the connection was updated.
   */
  setConnectionWebSocket (ws, connectionId) {
    if (!this.connections.has(connectionId)) {
      return false
    }
    const c = this.connections.get(connectionId)
    if (c.ws !== null) {
      return false
    }
    c.ws = ws
    return true
  }

  /**
   * Accept a mediasoup request for a specific peer
   *
   * @param {Object} msg - Mediasoup protocol request for the underlying peer.
   * @param {string} connectionId - ID of the connection to dispatch request to.
   * @returns {Promise} A promise returned by the mediasoup peer that contains response, if any
   */
  connectionMessage (msg, connectionId) {
    if (!this.connections.has(connectionId)) {
      return Promise.reject(new Error('Invalid connection ID'))
    }
    const c = this.connections.get(connectionId)
    return c.recvPeerMessage(msg)
  }

  /**
   * Handle mediasoup protocol messages sent by clients to this call.
   *
   * @param {Object} msg - A mediasoup protocol message. Can be a request or notification, for room or peer.
   * @param {string|null} [connectionId=null] - Connection ID of the peer if the message is to be delivered to a peer.
   * @return {Promise}
   */
  mediaMessage (msg, connectionId = null) {
    const invalidMsg = Promise.reject(new Error('Invalid mediasoup protocol message'))
    if (!msg) {
      return invalidMsg
    }
    // If message is for the room, send it to the room
    if (msg.target && msg.target === 'room') {
      return this.mediaRoom.receiveRequest(msg)
    }
    if (msg.target && msg.target === 'peer') {
      return this.connectionMessage(msg, connectionId)
    }
    return invalidMsg
  }

  /**
   * Setup media room
   *
   * @private
   */
  _setupMediaRoom () {
    this.mediaRoom.on('newpeer', (peer) => {
      const c = this.connections.get(peer.name)
      if (c) {
        c.setMediaPeer(peer)
      }
      console.log('New peer', peer.name, peer.appData)
    })
  }
}

module.exports = Call
