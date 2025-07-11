
const validateSignupDTO = (req, res, next) => {
    const { email, password, username, firstname, lastname, skillLevel } = req.body

    if (!email || !password || !username || !firstname || !lastname || !skillLevel) {
        return res.status(400).json({ error: "One or more fields are missing" })
    }

    if (email) {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }
    }

    if(password)
    {
        if(password.length <= 8)
        {
            return res.status(400).json({error:'Password is too short'})
        }

        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,128}$/;
        if(!passwordRegex.test(password))
        {
            return res.status(400).json({error:'Password is not complex'})
        }
    }

    next();
}