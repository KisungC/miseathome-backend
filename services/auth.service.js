const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv')

dotenv.config({ path: '../env/.env' })
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { findByEmail, findByUsername, createUser, getJtiForUser, getUserProfileById, setEmailVerified, findUserWithPasswordByEmail, getUserProfileByEmail, updateVerificationJtiByUserId, getEmailVerifiedByUserId } = require('../models/user.model');
const { EmailTakenError } = require('../errors/EmailTakenError')
const { UsernameTakenError } = require('../errors/UsernameTakenError')
const { EmptyEmailError } = require('../errors/EmptyEmailError');
const { BaseError } = require('../errors/BaseError');

const registerUser = async (userData) => {
  try {
    if (!userData) {
      throw new BaseError("Server error! please try again later.", 500, "UNABLE TO GET REQ.BODY")
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

    const urlToken = createUrlToken(email, userid, jti)

    await sendVerificationEmail(email, urlToken)

    return res;
  } catch (err) {
    throw err; // unknown error, let controller handle it
  }
};

const createUrlToken = (email, userid, jti, options = { expiresIn: "20m" }) => {
  if (!email) {
    throw new EmptyEmailError()
  }

  if (!userid) {
    throw new BaseError("internal error: userid not found", 500, "USERID_NOT_FOUND")
  }

  if (!jti) {
    throw new BaseError("internal error: jti not found", 500, "JTI_NOT_FOUND");
  }


  const baseUrl = new URL(`${process.env.DEV_FRONTEND_BASE_URL}/auth/token-verify`)

  const tokenJson = {
    userid: userid,
    email: email,
  }

  options.jwtid = jti

  const token = generateJwt(tokenJson, options, jti)

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
    if (!token) {
      throw new BaseError('Internal server error: Token is required.', 401, 'TOKEN_MISSING')
    }
    const { userid, jti } = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const storedJti = await getJtiForUser(userid)
    if (jti !== storedJti) {
      throw new BaseError('Token is invalid or already used.', 401, 'INVALID_JTI')
    }
    await setEmailVerified(userid)
    const userProfile = await getUserProfileById(userid)
    if (!userProfile) {
      throw new BaseError('Unable to get user profile.', 500, 'USER_PROFILE_FETCH_FAILED')
    }
    return userProfile
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new BaseError("Link is expired.", 401, "TOKEN_EXPIRED")
    throw err
  }
}

const resendEmailVerification = async (email, userid, deps = { createUrlToken, sendVerificationEmail, updateVerificationJtiByUserId }) => {
  try {
    const emailExists = await findByEmail(email)
    if (!emailExists) throw new BaseError("Email not found.", 400, "EMAIL_DOES_NOT_EXIST")
    const jti = uuidv4()
    const tokenUrl = deps.createUrlToken(email, userid, jti)
    await deps.sendVerificationEmail(email, tokenUrl)
    await deps.updateVerificationJtiByUserId(userid, jti)

    return { success: true }
  } catch (err) {
    throw err
  }
}

const signinService = async (email, password) => {
  if (!email || !password) {
    throw new BaseError('Email and password are required.', 400, "EMAIL_PASSWORD_MISSING")
  }
  try {
    const dbPassword = await findUserWithPasswordByEmail(email)
    if (!dbPassword) throw new BaseError("Sign in unsuccessful.", 400, "AUTHENTICATION_UNSUCCESSFUL")
    const isMatch = await bcrypt.compare(password, dbPassword)


    //load user profile 
    const userProfile = await getUserProfileByEmail(email)

    if (isMatch) {
      const isVerified = await getEmailVerifiedByUserId(userProfile.userid)
      const refreshToken = generateJwt({ userid: userProfile.userid }, { expiresIn: "7d" })

      if (isVerified) {
        const accessToken = generateJwt({ userid: userProfile.userid }, {expiresIn:'15m'})
        userProfile.accessToken = accessToken

        return { userProfile: userProfile, refreshToken: refreshToken }
      }
      else {
        return { userProfile: userProfile, refreshToken: refreshToken } //userProfile without accessToken
      }
    }
    throw new BaseError("Sign in unsuccessful.", 400, "AUTHENTICATION_UNSUCCESSFUL")
  } catch (err) {
    throw err
  }
}

const refreshTokenService = (oldRefreshToken) => {
  try {
    const payload = oldRefreshToken.verify(process.env.JWT_SECRET_KEY)
    const newRefreshToken = generateJwt({userid:payload.userid}, {expiresIn:'7d'})

    const newAccessToken = generateJwt({userid:payload.userid}, {expiresIn:'15m'})

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  } catch (err) {
    throw err
  }

}

const generateJwt = (payload, options = {}) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY,
    Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v !== undefined)
    ));
}

module.exports = {
  registerUser,
  createUrlToken,
  sendVerificationEmail,
  verifyEmail,
  resendEmailVerification,
  signinService,
  generateJwt,
  refreshTokenService
};