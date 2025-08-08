const express = require('express')
const router = express.Router()
const {signup, verifyEmailToken, resendEmailToken} = require('../controllers/auth.controller')
const {validateSignupDTO} = require('../dtos/auth.dto')
const {hashPassword} = require('../middleware/hashPassword')

router.post('/signup', validateSignupDTO, hashPassword, signup)
router.post('/token-verify', verifyEmailToken)
router.post('/resend-token', resendEmailToken)

module.exports = router;