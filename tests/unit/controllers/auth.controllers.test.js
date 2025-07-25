jest.mock('../../../services/auth.service')

const { mockCreateUserRes } = require('../../utils/factories/mockUser');
const { mockUserRegistrationInput } = require('../../utils/factories/mockUserInput');
const { registerUser } = require('../../../services/auth.service');
const { signup } = require('../../../controllers/auth.controller');

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
    it('should return with res with code 201', async () => {
        const req = {
            body: mockUserRegistrationInput(),
        };

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "User successfully created"
        }));
    })
    it('should throw error when req.body is undefined', async () => {
        const req = {
            body: undefined
        }

        await signup(req, res)

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Signup failed'
        }));
    })
})