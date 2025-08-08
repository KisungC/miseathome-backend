const { handleBaseError, sendErrorResponse } = require("../util/handleResponse/errorHandler")
const { sendSuccessResponse } = require("../util/handleResponse/successHandler")
const { registerUser, verifyEmail, resendEmailVerification } = require('../services/auth.service')

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

const resendEmailToken = async(req,res)=>{
  try{
    const email = req.body.email
    const result = await resendEmailVerification(email)
    if(result.success) sendSuccessResponse(res, 200, 'Email verification link sent successfully', {success: true, email:email})
    return
  }catch(err)
  {
    console.error('Resending verification link to email failed')
    if(handleBaseError(res, err)) return
    sendErrorResponse(res, err)
  }
}

const signin = async(req,res)
{
  
}

module.exports = {
  signup,
  verifyEmailToken,
  resendEmailToken
};