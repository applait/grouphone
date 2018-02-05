/**
 * HTTP API routes
 */

/**
 * Prepare and return a route that closes on a mediasoup Server
 *
 * @param {CallManager} callManager - An instance of CallManager
 * @return {express.Route} Mounted expressjs router
 */
function routesIndex (callManager) {
  let router = require('express').Router()
  const debug = require('util').debuglog('routes')
  const responses = require('./responses')

  // Mount `/call` routes
  router.use('/call', require('./callroutes')(callManager))

  // Handle 404
  router.use(function (req, res, next) {
    const err = new Error('Not found')
    err.status = 404
    next(err)
  })

  // Handle errors
  router.use(function (err, req, res, next) {
    err.status = err.status || 500
    err.message = err.message || 'Unable to perform request'
    if (err.status === 500) {
      debug('Error', err)
    }
    responses.error(res, err.message, null, err.status)
  })

  return router
}

module.exports = routesIndex
