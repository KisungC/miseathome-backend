jest.mock('../../../services/auth.service')
jest.mock('../../../database/index', () => require('../../utils/mockDb'));

const db = require('../../utils/mockDb');
const { mockCreateUserRes } = require('../../utils/factories/mockUser');
const { mockUserRegistrationInput, mockUserSignIn } = require('../../utils/factories/mockUserInput');
const { registerUser, signinService } = require('../../../services/auth.service');
const { signup, signin } = require('../../../controllers/auth.controller');
const { BaseError } = require('../../../errors/BaseError');

registerUser.mockImplementation((body) => {
    const validUserInputObj = mockUserRegistrationInput();
    const validKeys = new Set(Object.keys(validUserInputObj));

    for (const [key, value] of Object.entries(body)) {
        if (!validKeys.has(key)) {
            return Promise.reject(new Error(`Unexpected field: ${key}`))
        }
        if (value === undefined || value === null) {
            return Promise.reject(new Error(`Missing value for: ${key}`))

        }
    }
    return Promise.resolve(mockCreateUserRes())
})

const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
};

describe('Testing signup from controller', () => {
    it('should return with res with code 201 when req.body is valid', async () => {
        const req = {
            body: mockUserRegistrationInput(),
        };

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "User successfully created"
        }));
    })
})

describe('Testing signin from controller', () => {
    it('should return success response when email and password is valid', async () => {
        const email = 'existing@email.com'
        const password = 'userPasswordInput'

        const req = {
            body: mockUserSignIn({
                email: email,
                password: password
            })
        }

        signinService.mockResolvedValue({ success: true, message: "Signin successful." })

        await signin(req, res)

        await expect(signin(req, res)).resolves.toBeUndefined();

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Sign in successful.",
            success: true
        }))
    })
    it('should throw when user credential is incorrect', async () => {

        const req = {
            body: mockUserSignIn({ password: "wrong password" })
        }
        const err = new BaseError("Sign in unsuccessful.", 400, "AUTHENTICATION_UNSUCCESSFUL")

        signinService.mockRejectedValue(err)

        await signin(req, res)

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Sign in unsuccessful.',
            code: 'AUTHENTICATION_UNSUCCESSFUL'
        }));
    })
})