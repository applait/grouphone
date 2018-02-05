const Call = require('./call')

/**
 * Manages calls active in the current server
 */
class CallManager {
  /**
   * Create new CallManager
   *
   * @param {mediasoup.Server} mediaServer - Mediasoup server instance
   */
  constructor (mediaServer) {
    /**
     * List of active calls keyed by call ID
     */
    this.calls = new Map()

    /**
     * Underlying mediasoup server instance
     */
    this.mediaServer = mediaServer
  }

  /**
   * Create a new Call and add it to CallManager
   *
   * @returns {Call} - Returns the newly created Call instance
   */
  createCall () {
    const c = new Call(this.mediaServer)
    this.calls.set(c.callId, c)
    return c
  }

  /**
   * Deletes a call and closes its underlying connections
   *
   * @param {string} callId - The call ID to delete
   * @returns {Call|null} - Returns null if call is not found. Else returns the Call instance that was deleted
   */
  deleteCall (callId) {
    if (!this.calls.has(callId)) {
      return null
    }
    const c = this.calls.get(callId)
    c.close()
    this.calls.delete(callId)
    return c
  }

  /**
   * Get a call instance
   * @param {string} callId - The ID of the call to retrieve
   * @return {Call|null} - Returns null if call is not found. Else returns the Call instance
   */
  getCall (callId) {
    if (!this.calls.has(callId)) {
      return null
    }
    return this.calls.get(callId)
  }

  /**
   * Checks whether a given call ID is present
   *
   * @param {string} callId - The call ID to verify
   * @returns {boolean} `true` if the call exists
   */
  has (callId) {
    return this.calls.has(callId)
  }
}

module.exports = CallManager
