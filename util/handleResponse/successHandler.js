const sendSuccessResponse = (res, code, message, data = {}) => {
  res.status(code).json({
    message: message,
    success: true,
    data: data
  })
}

module.exports ={
    sendSuccessResponse
}