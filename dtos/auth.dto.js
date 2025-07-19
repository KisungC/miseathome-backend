const { BaseError } = require("../errors/BaseError")

const validateSignupDTO = (req, res, next) => {
    const { email, password, username, firstname, lastname, skillLevel } = req.body

    if (!email || !password || !username || !firstname || !lastname || !skillLevel) {
        throw new BaseError("One or more fields are missing.", 400, "MISSING_INPUTS")
    }

    if (email) {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!emailRegex.test(email)) {
            throw new BaseError("Email is invalid.", 400, "EMAIL_INVALID")
        }
    }

    if (password) {
        if (password.length <= 8) {
            throw new BaseError("Password is too short.", 400, "PASSWORD_TOO_SHORT")
        }

        if (password.length >= 128) {
            throw new BaseError("Password is too long.", 400, "PASSWORD_TOO_LONG")
        }

        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,128}$/;
        if (!passwordRegex.test(password)) {
            throw new BaseError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.", 400, "WEAK_PASSWORD")
        }
    }

    if (username) {
        if (username.length <= 2) {
            throw new BaseError("Username is too short.", 400, "USERNAME_TOO_SHORT")
        }
        if (username.length >= 38) {
            throw new BaseError("Username is too long. (Needs to be under 38 characters).", 400, "USERNAME_TOO_LONG")
        }
    }

    if(firstname.length >= 50)
    {
        throw new BaseError("First name is too long. Has to be less than 50 characters.", 400, "REACHED_MAX_FIRST_NAME")
    }
    if(lastname.length >= 50)
    {
        throw new BaseError("Last name is too long. Has to be less than 50 characters.", 400, "REACHED_MAX_LAST_NAME")

    }

    if (skillLevel != 'Beginner' && skillLevel && 'Home Cook' && skillLevel != 'Professional') {
        throw new BaseError("Invalid skill level. Choose Beginner, Home Cook or Professional.", 400, "INVALID_SKILL_LEVEL_CHOICE")
    }

    next();
}

module.exports = { validateSignupDTO }