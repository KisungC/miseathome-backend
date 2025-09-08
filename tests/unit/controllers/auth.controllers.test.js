jest.mock('../../../services/auth.service')
jest.mock('../../../database/index', () => require('../../utils/mockDb'));

const db = require('../../utils/mockDb');
const { mockCreateUserRes, mockUserProfile } = require('../../utils/factories/mockUser');
const { mockUserRegistrationInput, mockUserSignIn } = require('../../utils/factories/mockUserInput');
const { registerUser, signinService, refreshTokenService } = require('../../../services/auth.service');
const { signup, signin, refreshToken } = require('../../../controllers/auth.controller');
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
    cookie: jest.fn()
};

beforeEach(() => {
    jest.clearAllMocks();
});

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

        signinService.mockResolvedValueOnce({ userProfile: mockUserProfile() })

        await expect(signin(req, res)).resolves.toBeUndefined();

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledTimes(1)
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

describe.only("testing refreshToken", () => {
    it('should send 200 if refreshToken is valid', () => {
        const req = {
            cookies: {
                refreshToken: "oldRefreshToken"
            }
        }

        refreshTokenService.mockReturnValue({ accessToken: "AT", refreshToken: "RT" })

        refreshToken(req, res)
        expect(refreshTokenService).toHaveBeenCalledWith("oldRefreshToken");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Token renewal successful.",
                data: { accessToken: "AT" }
            })
        );
        expect(res.cookie).toHaveBeenCalledWith(
            "refreshToken",
            "RT",
            expect.any(Object)
        );
    })
    it('should send 403 if refresh token is null or undefined',()=>{
        const req = {
            cookies:{
            }
        }
        refreshToken(req,res)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({error:"User session expired!"})

    })
})
