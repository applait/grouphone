/**
 * Response utilities for routes
 */

function success (res, msg, payload) {
  res.status(200).json({
    message: msg,
    payload: payload
  })
}

function error (res, message, payload, errorCode = 500) {
  res.status(errorCode).json({
    message: message,
    status: errorCode,
    payload: payload
  })
}

module.exports = {
  success,
  error
}
