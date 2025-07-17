const {findByEmail, findByUsername, createUser} = require('../models/user.models');
const {EmailTakenError} = require('../errors/EmailTakenError')
const {UsernameTakenError} = require('../errors/UsernameTakenError')


const registerUser = async (userData) => {
try {
    const existingEmail = await findByEmail(userData.email)
    if(existingEmail)
    {
      throw new EmailTakenError()
    }

    const existingUsername = await findByUsername(userData.username)
    if(existingUsername)
    {
      throw new UsernameTakenError()
    }

    return await createUser(userData);
  } catch (err) {
    throw err; // unknown error, let controller handle it
  }
};

module.exports = { registerUser };
