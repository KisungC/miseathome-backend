jest.mock('../../../models/user.model')

jest.mock('@sendgrid/mail', () => {
    return {
        setApiKey: jest.fn(),
        send: jest.fn(),
    };
});

const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

const { findByEmail, findByUsername, createUser } = require('../../../models/user.model')
const { registerUser, createUrlToken, sendEmail } = require('../../../services/auth.service')
const { mockCreateUserRes } = require('../../utils/factories/mockUser')
const { mockUserRegistrationInput } = require('../../utils/factories/mockUserInput')
const { EmailTakenError } = require('../../../errors/EmailTakenError')
const { UsernameTakenError } = require('../../../errors/UsernameTakenError')

findByEmail.mockImplementation((email) => {
    const existingEmail = 'test1@gmail.com' //email existing in database
    if (email == existingEmail) return Promise.resolve(mockCreateUserRes())
    return Promise.resolve(null)
})

findByUsername.mockImplementation((username) => {
    const existingUsername = 'test'
    if (username == existingUsername) return Promise.resolve(mockCreateUserRes())
    return Promise.resolve(null)
})

describe('Testing registerUser', () => {
    it('should successfully register a user', async () => {
        const newEmail = `${Date.now()}@gmail.com`
        const newUsername = `${Date.now()}`
        const input = mockUserRegistrationInput({
            email: newEmail,
            username: newUsername,
        })
        const expectedUser = mockCreateUserRes()

        createUser.mockResolvedValue(expectedUser)

        await expect(registerUser(input)).resolves.toEqual(expect.objectContaining({
            signup_date: expect.any(String),
            email_verified: false,
            jti: expect.any(String),
        }))
    })
    it('should throw error if email already exists', async () => {
        const existingEmail = 'test1@gmail.com'
        const input = mockUserRegistrationInput({ email: existingEmail })

        await expect(registerUser(input)).rejects.toThrow(EmailTakenError)
    })
    it('should throw error if username already exists', async () => {
        const existingUsername = 'test'
        const input = mockUserRegistrationInput({ username: existingUsername })

        await expect(registerUser(input)).rejects.toThrow(UsernameTakenError)
    })
})

describe('Testing createUrlToken', () => {
    it('should return a url with a token in the params', () => {
        const userInfo = {
            userid: 1,
            email: 'test1@gmail.com'
        }

        const mockJti = 'mockJti'

        const urlToken = new URL(createUrlToken(userInfo.email, userInfo.userid, mockJti))

        expect(urlToken.origin + urlToken.pathname).toBe("https://miseathome.ca/auth")
        expect(urlToken.toString()).toContain('?token=');

        const token = urlToken.searchParams.get('token')
        expect(token).toBeDefined();

        const decoded = jwt.decode(token)

        expect(decoded).toMatchObject({
            email: userInfo.email,
            userid: userInfo.userid,
            jti: mockJti
        })

        const currentUnixTime = Math.floor(Date.now() / 1000);
        const expectedExpiry = currentUnixTime + (20 * 60);

        // Allow a few seconds of leeway (token creation time vs test time)
        expect(decoded.exp).toBeGreaterThanOrEqual(currentUnixTime + 1190) // ~19.8 mins
        expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry) // 20 mins max
    })
    it('should throw an error if email is missing', () => {
        expect(() => createUrlToken(undefined, 2, "mockJti")).toThrow();
    })
    it('should throw an error if userid is missing', () => {
        expect(() => createUrlToken("email@email.com", undefined, "mockJti")).toThrow()
    })
    it('should throw an error if jti is missing', () => {
        expect(() => createUrlToken("email@email.com", "1", undefined)).toThrow()
    })
})

describe('Testing sendEmail', () => {
    it('should send email with valid url', async () => {
        sgMail.send.mockResolvedValue({});

        const email = "chung.kisung0@gmail.com"
        const url = "testurl.com/auth"

        await expect(sendEmail(email, url)).resolves.not.toThrow()
        expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
            to: email,
            from: 'miseathome@gmail.com',
            subject: 'User Verification',
            text: `Please click on this link: ${url} to validate your account. This link expires in 20 minutes`,
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }));
    })
    it('should throw if url is undefined', async()=>{
        await expect(sendEmail("email@email.com", undefined)).rejects.toThrow()
    })
})