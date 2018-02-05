/**
 * Routes for calls
 */

function routesCall (callManager) {
  const router = require('express').Router()
  const responses = require('./responses')

  // Call information
  router.get('/:callId', (req, res, next) => {
    const currentcall = callManager.getCall(req.params.callId)
    if (currentcall == null) {
      const err = new Error('Invalid call ID')
      err.status = 404
      next(err)
      return
    }
    responses.success(res, 'Call information', {
      callId: req.params.callId
      // TODO: all more info about the call. Include connection information?
    })
  })

  // Delete call
  router.delete('/:callId', (req, res, next) => {
    const deleted = callManager.deleteCall(req.params.callId)
    if (deleted == null) {
      const err = new Error('Invalid call ID')
      err.status = 404
      next(err)
      return
    }
    responses.success(res, 'Call deleted', {
      callId: req.params.callId
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
