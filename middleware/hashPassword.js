const bcrypt = require('bcrypt')

const hashPassword = async (req, res, next) =>{
    try
    {
        const {password} = req.body;

        if(!password)
        {
            res.status(400).json({error: "Password is required."})
        }
        
        const saltRounds = 11
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        req.body.password = hashedPassword
        next()
    }
    catch(err)
    {
        console.error('Password hashing failed:', err);
        res.status(500).json({ error: 'Internal server error during password hashing.' });
    }
}

module.exports = {
    hashPassword
}