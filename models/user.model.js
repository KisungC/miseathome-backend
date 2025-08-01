const db = require('../database')

const createUser = async(userData) =>
{
    const {email, password, username, firstname, lastname, skillLevel, jti} = userData
    try{
        const query = `INSERT INTO users (email, user_name, first_name, last_name, password, skill_level, jti) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING userid, email`
        const values = [email, username,firstname, lastname,password, skillLevel, jti]

        const result = await db.one(query, values)

        return result
    }
    catch(err)
    {
        console.error('DB Error', err)
        throw err;
    }
}

const findByEmail = async(email) =>
{
    try
    {
        const query = `SELECT user_name, email FROM users WHERE email = $1`

        const result = await db.oneOrNone(query, [email])

        return result
    }
    catch (err)
    {
        console.error('DB Error', err)
        throw err;
    }
}

const findByUsername = async(username) =>
{
    try
    {
        const query = `SELECT user_name, email FROM users WHERE user_name = $1`

        const result = await db.oneOrNone(query, [username])

        return result
    }
    catch (err)
    {
        console.error('DB Error', err)
        throw err;
    }
}

module.exports ={
    createUser,
    findByEmail,
    findByUsername
}