const { handleBaseError, sendErrorResponse } = require("../util/handleResponse/errorHandler")
const { sendSuccessResponse } = require("../util/handleResponse/successHandler")
const { registerUser, verifyEmail, resendEmailVerification, signinService } = require('../services/auth.service')
const { BaseError } = require("../errors/BaseError")

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
    const result = await verifyEmail(req.body.token)

    sendSuccessResponse(res, 200, "User successfully verified",  result )
    //might need to update user profile in the future
  } catch (err) {
    console.error('Email verification error:', err);
    if (handleBaseError(res, err)) return
    sendErrorResponse(res, err)
  }
}

const resendEmailToken = async (req, res) => {
  try {
    const {email, userid} = req.body
    await resendEmailVerification(email, userid)
    sendSuccessResponse(res, 200, 'Email verification link sent successfully', { success: true, email: email })
  } catch (err) {
    console.error('Resending verification link to email failed.')
    if (handleBaseError(res, err)) return
    sendErrorResponse(res, err)
  }
}

const signin = async (req, res) => {
  try {
    const {email, password} = req.body
    const result = await signinService(email,password)
    sendSuccessResponse(res, 200, "Sign in successful.", result.userProfile,result.refreshToken, 10080)
  } catch (err) {
    console.error('Sign in authentication failed.', err)
    if (handleBaseError(res, err)) return
    sendErrorResponse(res, err)
  }
}

module.exports = {
  signup,
  verifyEmailToken,
  resendEmailToken,
  signin
};