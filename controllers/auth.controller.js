const { handleBaseError, sendErrorResponse } = require("../util/handleResponse/errorHandler")
const { sendSuccessResponse } = require("../util/handleResponse/successHandler")
const { registerUser, verifyEmail } = require('../services/auth.service')

const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    sendSuccessResponse(res, 201, "User successfully created", { id: user.userid, email: user.email })
    return
  } catch (err) {
    console.error('Signup error:', err);
    if (handleBaseError(res, err)) return
    sendErrorResponse(res, err)
  }
}

const verifyEmailToken = async (req, res) => {
  try {
    if (!req.body.token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    const result = await verifyEmail(req.body.token)

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid or already-used token' });
    }

    if (result.success) {
      sendSuccessResponse(res, 200, "User successfully verified", { userid: result.userid })
    }
    return

  } catch (err) {
    console.error('Email verification error:', err);
    if (handleBaseError(res, err)) return
    sendErrorResponse(res, err)
  }
}

//const signin

module.exports = {
  signup,
  verifyEmailToken
};