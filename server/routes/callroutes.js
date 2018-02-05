/**
 * Routes for calls
 */

function routesCall (callManager) {
  const router = require('express').Router()
  const responses = require('./responses')

  function callExists (req, res, next) {
    if (!callManager.has(req.params.callId)) {
      const err = new Error('Invalid call ID')
      err.status = 404
      next(err)
      return
    }
    next()
  }

  // Create id and credentials for a new connection
  router.post('/:callId/connect', callExists, (req, res, next) => {
    const current = callManager.getCall(req.params.callId)
    const callerName = req.body.name || null
    const connId = current.connect(callerName)
    responses.success(res, 'Call connection information', {
      callId: current.callId,
      connectionId: connId,
      callerName: callerName,
      connectionCount: current.connectionCount
    })
  })

  // Disconnect given connection id
  router.post('/:callId/disconnect/:connectionId', callExists, (req, res, next) => {
    const currentcall = callManager.getCall(req.params.callId)
    if (currentcall.disconnect(req.params.connectionId)) {
      responses.success(res, 'Connection disconnected', {
        connectionId: req.params.connectionId
      })
      return
    }
    responses.error(res, 'Invalid connection ID', { connectionId: req.params.connectionId }, 400)
  })

  // Receive a mediasoup protocol message from a specific connection
  router.post('/:callId/message/:connectionId', callExists, (req, res, next) => {
    const message = req.body.message
    if (!message) {
      const err = new Error('Need to specify `message` in request body')
      err.status = 400
      return next(err)
    }
    const currentcall = callManager.getCall(req.params.callId)
    if (!currentcall.connections.has(req.params.connectionId)) {
      const err = new Error('Invalid connection ID')
      err.status = 400
      return next(err)
    }
    currentcall.mediaMessage(message, req.params.connectionId)
      .then(msg => {
        responses.success(res, 'Message received', msg)
      })
      .catch(err => {
        err.status = 500
        next(err)
      })
  })

  // Call information
  router.get('/:callId', callExists, (req, res, next) => {
    const current = callManager.getCall(req.params.callId)
    responses.success(res, 'Call information', {
      callId: current.callId,
      connections: current.connectionStatus,
      connectionCount: current.connectionCount
      // TODO: all more info about the call. Include connection information?
    })
  })

  // Delete call
  router.delete('/:callId', callExists, (req, res, next) => {
    const deleted = callManager.deleteCall(req.params.callId)
    responses.success(res, 'Call deleted', {
      callId: deleted.callId
    })
  })

  // Create call
  router.post('/', (req, res, next) => {
    const newCall = callManager.createCall()
    responses.success(res, 'Call created', {
      callId: newCall.callId
    })
  })

  return router
}

module.exports = routesCall
