const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv')

dotenv.config({ path: '../env/.env' })
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { findByEmail, findByUsername, createUser } = require('../models/user.model');
const { EmailTakenError } = require('../errors/EmailTakenError')
const { UsernameTakenError } = require('../errors/UsernameTakenError')

const registerUser = async (userData) => {
  try {
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

    console.log(`after adding jti to userData: `, userData)

    const res = await createUser(userData);

    const {email, userid} = res

    const urlToken = createUrlToken(email, userid, res.jti)

    await sendEmail(res.email, urlToken)

    return res;
  } catch (err) {
    throw err; // unknown error, let controller handle it
  }
};

const createUrlToken = (email, userid, jti) => {
  const baseUrl = new URL('https://miseathome.ca/auth')

  const tokenJson = {
    id: userid,
    email: email,
  }

  const token = jwt.sign(tokenJson, process.env.JWT_SECRET_KEY, { expiresIn: '20m', jwtid: jti })

  baseUrl.searchParams.append('token', token)

  const finalUrl = baseUrl.toString()

  return finalUrl
}

const sendEmail = async (email,url) => {
  const msg = {
    to: email,
    from: 'miseathome@gmail.com',
    subject: 'User Verification',
    text: `Please click on this link: ${url} to validate your account. This link expires in 20 minutes`,
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
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

module.exports = { registerUser };
