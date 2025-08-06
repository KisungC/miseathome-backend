const express = require('express')
const router = express.Router()
const {signup, verifyToken} = require('../controllers/auth.controller')
const {validateSignupDTO} = require('../dtos/auth.dto')
const {hashPassword} = require('../middleware/hashPassword')

router.post('/signup', validateSignupDTO, hashPassword, signup)
router.post('/token-verify', verifyToken)

module.exports = router;