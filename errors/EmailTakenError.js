const {BaseError} = require('./BaseError')

class EmailTakenError extends BaseError
{
    constructor()
    {
        super('Email is already Taken.', 409, 'EMAIL_TAKEN')
    }
}

module.exports = {EmailTakenError}