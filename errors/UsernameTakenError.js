const {BaseError} = require('./BaseError')

class UsernameTakenError extends BaseError
{
    constructor()
    {
        super('Username is already Taken.', 409, 'USERNAME_TAKEN')
    }
}

module.exports = {UsernameTakenError}