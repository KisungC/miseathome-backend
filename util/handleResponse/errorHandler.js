const { BaseError } = require('./BaseError');

/**
 * Handles thrown BaseError instances.
 * @returns {boolean} true if the error was a BaseError and a response was sent.
 */
const handleBaseError = (res, err) => {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
    return true;
  }
  return false;
};

function sendErrorResponse(res, err) {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  })
}


module.exports = {
  handleBaseError,
  sendErrorResponse
};