const sendSuccessResponse = (res, code, message, data = {}, token, maxAge = 15) => {
  if (token) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * maxAge
    });
  }

  res.status(code).json({
    message,
    success: true,
    data
  });
};

module.exports = { sendSuccessResponse };
