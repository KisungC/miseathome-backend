const {BaseError} = require('./BaseError')

class EmptyEmailError extends BaseError
{
    constructor()
    {
        super('Email is empty.', 409, 'EMAIL_EMPTY_INPUT')
    }
}

module.exports = {EmptyEmailError}