const sendSuccessResponse = (res, code, message, data = {}, cookie = false) => {
  res.
  cookie()?.
  status(code).json({
    message: message,
    success: true,
    data: data
  })
}

module.exports ={
    sendSuccessResponse
}