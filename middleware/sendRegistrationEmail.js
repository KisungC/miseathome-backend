const sgMail = require('@sendgrid/mail')
const dotenv = require('dotenv');
dotenv.config({path:'../env/.env'})


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: 'chung.kisung0@gmail.com',
  from: 'miseathome@gmail.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })