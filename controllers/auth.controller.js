const userModel = require('../models/user.models')

const signup = async (req, res) => {
    const { email, password, username, firstname, lastname, skillLevel } = req.body;

    try {
        const result = await userModel.createUser(email, password, username, firstname, lastname, skillLevel)
        res.status(201).json(result)
    }
    catch (err) {
        console.error('Signup error:', err)

        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        res.status(500).json({ error: "Signup failed" })
    }
}

//const signin

module.exports = {
  signup,
};