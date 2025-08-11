const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv')

dotenv.config({ path: '../env/.env' })
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { findByEmail, findByUsername, createUser, getJtiForUser, setEmailVerified, findUserWithPasswordByEmail } = require('../models/user.model');
const { EmailTakenError } = require('../errors/EmailTakenError')
const { UsernameTakenError } = require('../errors/UsernameTakenError')
const { EmptyEmailError } = require('../errors/EmptyEmailError');
const { BaseError } = require('../errors/BaseError');

const registerUser = async (userData) => {
  try {
    if(!userData) {
      throw new BaseError("Server error! please try again later.",500,"UNABLE TO GET REQ.BODY")
    } 
    const existingEmail = await findByEmail(userData.email)
    if (existingEmail) {
      throw new EmailTakenError()
    }

    const existingUsername = await findByUsername(userData.username)
    if (existingUsername) {
      throw new UsernameTakenError()
    }

    const jti = uuidv4() //create uuid

    userData.jti = jti

    const res = await createUser(userData);

    const { email, userid } = res

    const urlToken = createUrlToken(email,userid, jti)

    await sendVerificationEmail(email, urlToken)

    return res;
  } catch (err) {
    throw err; // unknown error, let controller handle it
  }
};

const createUrlToken = (email, userid, jti) => {
  if (!email) {
    throw new EmptyEmailError()
  }

  if (!userid) {
    throw new BaseError("internal error: userid not found", 500, "USERID_NOT_FOUND")
  }

  if (!jti) {
    throw new BaseError("internal error: jti not found", 500, "JTI_NOT_FOUND");
  }

  const baseUrl = new URL('https://miseathome.ca/auth')

  const tokenJson = {
    userid: userid,
    email: email,
  }

  const token = jwt.sign(tokenJson, process.env.JWT_SECRET_KEY, { expiresIn: '20m', jwtid: jti })

  baseUrl.searchParams.append('token', token)

  const finalUrl = baseUrl.toString()

  return finalUrl
}

const sendVerificationEmail = async (email, url) => {
  if (!email) {
    throw new BaseError("internal error: email is missing", 500, "MISSING_EMAIL")
  }
  if (!url) {
    throw new BaseError("internal error: url is missing", 500, "MISSING_URL_TOKEN")
  }

  const msg = {
    to: email,
    from: 'miseathome@gmail.com',
    subject: 'User Verification',
    text: `Please click on this link: ${url} to validate your account. This link expires in 20 minutes`,
    html: `<p>Please click on the link below to validate your account. This link expires in 20 minutes:</p>
    <a href="${url}">${url}</a>`
  }

  try {
    await sgMail.send(msg)
    console.log("Email sent")
  }
  catch (err) {
    console.error("Error sending email: ", err)
    throw err;
  }
}

const verifyEmail = async (token) => {
  try {
    if(!token)
    {
      throw new BaseError('Internal server error: Token is required.',401,'TOKEN_MISSING')
    }
    const { userid, jti } = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const storedJti = await getJtiForUser(userid)
    if (jti !== storedJti) {
      throw new BaseError('Token is invalid or already used.', 401, 'INVALID_JTI')
    }
    await setEmailVerified(userid)
    return { success: true, userid: userid }
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new BaseError("Link is expired.", 401, "TOKEN_EXPIRED")
    throw err
  }
}

const resendEmailVerification = async(email, userid, deps = { createUrlToken, sendVerificationEmail }) =>{
  try{
    const jti = uuidv4()
    const tokenUrl = deps.createUrlToken(email, userid,jti)
    await deps.sendVerificationEmail(email,tokenUrl)

    return {success:true}
  }catch(err)
  {
    throw err
  }
}

const signinService = async(email,password) =>{
  if(!email || !password)
  {
    throw new BaseError('Email and password are required.',400,"EMAIL_PASSWORD_MISSING")
  }
  try{
    const dbPassword = await findUserWithPasswordByEmail(email)
    const isMatch = await bcrypt.compare(password, dbPassword)

    //load user profile here

    if(isMatch) return {success:true, message: "Signin successful."}

    throw new BaseError("Sign in unsuccessful.",400, "AUTHENTICATION_UNSUCCESSFUL")
  }catch(err){
    throw err
  }
}

module.exports = {
  registerUser,
  createUrlToken,
  sendVerificationEmail,
  verifyEmail,
  resendEmailVerification,
  signinService
};