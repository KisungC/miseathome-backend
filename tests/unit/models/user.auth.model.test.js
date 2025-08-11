jest.mock('../../../database/index', () => require('../../utils/mockDb'))

const db = require('../../utils/mockDb')
const { createUser, findByEmail, findByUsername, findUserWithPasswordByEmail, getJtiForUser, setEmailVerified } = require('../../../models/user.model')
const { mockCreateUserRes } = require('../../utils/factories/mockUser')
const { mockUserRegistrationInputJTI } = require('../../utils/factories/mockUserInput')
const { valid } = require('joi')

describe('Testing Model', () => {
    describe('Testing findByEmail', () => {
        it('should be successful when finding a user with email', async () => {
            const email = 'test1@gmail.com'

            const expectedResult = mockCreateUserRes({
                user_name: 'test',
                email: 'test1@gmail.com'
            })

            db.oneOrNone.mockResolvedValue(expectedResult);

            await expect(findByEmail(email)).resolves.toEqual(expect.objectContaining({
                user_name: 'test',
                email: 'test1@gmail.com'
            }));
        })

        it('should throw error when email not found', async () => {
            const email = "none existing email"

            db.oneOrNone.mockResolvedValue(null)

            await expect(findByEmail(email)).resolves.toBeNull()

        })
    })

    describe('Testing findByUsername', () => {
        it('should be successful to find a user by username', async () => {
            const username = 'test'

            const expectedResult = mockCreateUserRes({
                user_name: 'test',
                email: 'test1@gmail.com'
            })

            db.oneOrNone.mockResolvedValue(expectedResult)

            await expect(findByUsername(username)).resolves.toEqual(expect.objectContaining({
                user_name: 'test',
                email: 'test1@gmail.com'
            }))
        })
    })

    describe('Testing Create User', () => {
        it('should be successful when creating an account', async () => {
            const timeNow = Date.now()

            const customInput = {
                email: `${timeNow}@test.com`,
                username: timeNow
            }

            const userInput = mockUserRegistrationInputJTI({ customInput })

            db.one.mockResolvedValue(mockCreateUserRes({
                email: `${timeNow}@test.com`,
                user_name: timeNow
            }))

            await expect(createUser(userInput)).resolves.toEqual(expect.objectContaining({
                email: `${timeNow}@test.com`,
                user_name: timeNow
            }))
        })

        it('should fail to register when email is already taken', async () => {
            const duplicateEmail = 'test1@gmail.com'

            db.one.mockRejectedValue(new Error("23505 UNIQUE VIOLATION"))

            await expect(createUser(mockUserRegistrationInputJTI({ email: duplicateEmail }))).rejects.toThrow() //can add specific error code from database
        })

        it('should fail to register when user is already taken', async () => {
            const duplicateUsername = 'test'

            await expect(createUser(mockUserRegistrationInputJTI({ email: duplicateUsername }))).rejects.toThrow() //can add specific error code from database
        })
    })

    describe('Testing findUserWithPasswordByEmail', () => {
        it('should return the password when email exists in the DB', async () => {
            const email = 'existing@example.com';
            const expectedPassword = 'hashedPassword123';

            db.oneOrNone.mockResolvedValue({ password: expectedPassword });

            const result = await findUserWithPasswordByEmail(email);
            expect(result).toBe(expectedPassword);
            expect(db.oneOrNone).toHaveBeenCalledWith(
                'SELECT password FROM users WHERE email = $1',
                [email]
            );
        })
        it('should return null when email not found', async () => {
            const email = 'not existing email'

            db.oneOrNone.mockResolvedValue(null)

            const result = await findUserWithPasswordByEmail(email)

            expect(result).toBeNull()
            expect(db.oneOrNone).toHaveBeenCalledWith(
                'SELECT password FROM users WHERE email = $1',
                [email]
            );
        })

    })
    describe('Testing getJtiForUser', () => {
        it("should return jti for user when userid is valid", async () => {
            const validUserId = 1
            db.oneOrNone.mockResolvedValue({ jti: "someUUID" })

            const result = await getJtiForUser(validUserId)

            expect(result).toBe("someUUID")
            expect(db.oneOrNone).toHaveBeenCalledWith(`SELECT jti FROM users WHERE userid = $1`, [validUserId])
        })
        it("should return null if userid is invalid", async () => {
            const invalidID = -1
            db.oneOrNone.mockResolvedValue(null)
            const result = await getJtiForUser(invalidID)

            expect(result).toBeNull()
            expect(db.oneOrNone).toHaveBeenCalledWith(`SELECT jti FROM users WHERE userid = $1`, [invalidID])
        })
    })

    describe('Testing setEmailVerified', () => {
        it('should set email verified to true if userid is valid', async () => {
            const validID = 1
            const returnObj = {
                userid: 1,
                email: "test1@test.com",
                user_name: "testName"
            }
            db.one.mockResolvedValue(returnObj)
            const result = await setEmailVerified(validID)

            expect(result).toEqual(returnObj)
            expect(db.one).toHaveBeenCalledWith(`UPDATE users SET email_verified = TRUE, jti = null WHERE userid = $1 RETURNING userid, email, user_name`, [validID])
        })
        it('should return undefined if userid is invalid', async () => {
            const invalidID = -1
            db.one.mockResolvedValue(null)
            const result = await setEmailVerified(invalidID)

            expect(result).toBeNull()
            expect(db.one).toHaveBeenCalledWith(`UPDATE users SET email_verified = TRUE, jti = null WHERE userid = $1 RETURNING userid, email, user_name`, [invalidID])

        })
    })
})