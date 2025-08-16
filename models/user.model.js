const db = require('../database')

const createUser = async (userData) => {
    const { email, password, username, firstname, lastname, skillLevel, jti } = userData
    try {
        const query = `INSERT INTO users (email, user_name, first_name, last_name, password, skill_level, jti) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING userid, email`
        const values = [email, username, firstname, lastname, password, skillLevel, jti]

        const result = await db.one(query, values)

        return result
    }
    catch (err) {
        console.error('DB Error', err)
        throw err;
    }
}

const findByEmail = async (email) => {
    try {
        const query = `SELECT userid, user_name, email FROM users WHERE email = $1`

        const result = await db.oneOrNone(query, [email])

        return result
    }
    catch (err) {
        console.error('DB Error', err)
        throw err;
    }
}

const getUserProfileByEmail = async (email) => {
    try {
        const query = `SELECT userid, user_name, first_name, last_name, skill_level, email_verified FROM users WHERE email = $1`
        const result = await db.oneOrNone(query, [email])
        return result
    } catch (err) {
        console.error('DB Error', err)
        throw err;
    }
}

const findByUsername = async (username) => {
    try {
        const query = `SELECT user_name, email FROM users WHERE user_name = $1`

        const result = await db.oneOrNone(query, [username])

        return result
    }
    catch (err) {
        console.error('DB Error', err)
        throw err;
    }
}

const findUserWithPasswordByEmail = async (email) => {
    try {
        const query = `SELECT password FROM users WHERE email = $1`

        const result = await db.oneOrNone(query, [email])

        return result?.password || null;
    } catch (err) {
        console.error('DB Error', err)
        throw err
    }
}

const updateVerificationJtiByEmail = async (userid, jti) => {
    try {
        const query = `UPDATE users SET jti = $1 WHERE userid = $2`
        await db.none(query, [jti, userid])

    } catch (err) {
        console.error('DB Error', err)
        throw err
    }
}

const getJtiForUser = async (userid) => {
    try {
        const query = `SELECT jti FROM users WHERE userid = $1`
        const result = await db.oneOrNone(query, [userid])

        return result ? result.jti : null
    }
    catch (err) {
        console.error('DB Error', err)
        throw err
    }
}

const setEmailVerified = async (userid) => {
    try {
        const query = `UPDATE users SET email_verified = TRUE, jti = null WHERE userid = $1 RETURNING userid, email, user_name`
        const result = await db.one(query, [userid])

        return result
    }
    catch (err) {
        console.error('DB Error', err)
        throw err
    }
}

//implement get user profile (exclude email)

module.exports = {
    createUser,
    findByEmail,
    findByUsername,
    getJtiForUser,
    setEmailVerified,
    findUserWithPasswordByEmail,
    getUserProfileByEmail,
    updateVerificationJtiByEmail
}