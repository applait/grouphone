/**
 * Creates and returns a mediasoup server with bindings in place
 */

const mediasoup = require('mediasoup')
const sfuConfig = require('./sfuConfig')

/**
 * Returns a mediasoup server instance
 *
 * @returns {mediasoup.Server} - A mediasoup server instance
 */
function createMediaServer () {
  // Launch MediaSoup media server
  let mediaServer = mediasoup.Server(sfuConfig)
  return mediaServer
}

module.exports = createMediaServer()
