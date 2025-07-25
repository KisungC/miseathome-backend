const { BaseError } = require('../errors/BaseError');
const { registerUser } = require('../services/auth.service')

const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: "User successfully created",
      data: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err instanceof BaseError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code
      })
    }
    res.status(500).json({ error: 'Signup failed' });
  }
}

//const signin

module.exports = {
  signup
};