const request = require("supertest")
const app = require("../../app")
const db = require('../../database/index')
const { mockUserProfile } = require("../utils/factories/mockUser")
const sgMail = require("../__mocks__/@sendgrid/mail")
const authController = require("../../controllers/auth.controller")
const authService = require("../../services/auth.service")
const { mockUserRegistrationInput } = require("../utils/factories/mockUserInput")
const { v4: uuidv4 } = require('uuid');

let testUsers = []; // store {email, userid} objects

const createTestUser = async (overrides = {}) => {
    const uniqueID = Date.now().toString();
    const signupInfo = mockUserRegistrationInput({
        email: `${uniqueID}@test.com`,
        username: uniqueID,
        ...overrides // allow overrides for email/username if needed
    });

    const { email, userid } = await authService.registerUser(signupInfo);

    testUsers.push({ email, userid }); // track for cleanup
    return { email, userid };
};

const cleanupUsers = async () => {
    if (!testUsers.length) return;
    const ids = testUsers.map(u => u.userid);
    await db.none("DELETE FROM users WHERE userid IN ($1:csv)", [ids]);
    testUsers = [];
};

beforeEach(async () => {
    if (expect.getState().currentTestName.includes('[no setup]')) return;
    await createTestUser(); // creates a default test user
});

afterEach(async () => {
    await cleanupUsers();
});


afterAll(async () => {
    await db.$pool.end();
});

describe('POST /auth/signup', () => {
    it('should sign up and send a verification email [no setup]', async () => {
        // Call signup endpoint
        const uniqueEmail = `test${Date.now()}@example.com`;
        const res = await request(app)
            .post('/auth/signup')
            .send({
                email: uniqueEmail,
                password: 'ValidPass123!',
                username: `user${Date.now()}`,
                firstname: 'Test',
                lastname: 'User',
                skillLevel: 'Beginner'
            });

        testUsers.push({ email: res.body.email, userid: res.body.userid })

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User successfully created');

        // Assert SendGrid payload
        const emailPayload = sgMail.__getLastEmailPayload();
        expect(emailPayload).toBeDefined();
        expect(emailPayload.to).toBe(uniqueEmail);
        expect(emailPayload.html).toContain('auth/token-verify?token=');
    })

    it('should be return 400 if one of the field is missing [no setup]', async () => {
        const uniqueValue = Date.now().toString()
        const res = await request(app)
            .post('/auth/signup')
            .send({
                password: 'ValidPass123!',
                email: ``,
                username: uniqueValue,
                firstname: 'Test',
                lastname: 'User',
                skillLevel: 'Beginner'
            })

        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toBe('One or more fields are missing.');
    })
    it('should return 409 if email is duplicate [no setup]', async () => {
        const uniqueValue = Date.now().toString()
        const signupInfo = mockUserRegistrationInput({
            email: `test1@test.com`,
            username: "test"
        })

        const testUser = await authService.registerUser(signupInfo)

        testUsers.push({ email: testUser.email, userid: testUser.userid })


        const res = await request(app)
            .post('/auth/signup')
            .send({
                password: 'ValidPass123!',
                email: `test1@test.com`,
                username: uniqueValue,
                firstname: 'Test',
                lastname: 'User',
                skillLevel: 'Beginner'
            })

        expect(res.statusCode).toBe(409)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toBe('Email is already Taken.');
    })
    it('should be return 400 if there is an extra field in the req.body [no setup]', async () => {
        const uniqueValue = Date.now().toString()
        const res = await request(app)
            .post('/auth/signup')
            .send({
                password: 'ValidPass123!',
                email: `chung.kisung0@gmail.com`,
                username: uniqueValue,
                firstname: 'Test',
                lastname: 'User',
                skillLevel: 'Beginner',
                extraField: "extra"
            })

        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toBe('Unexpected fields: extraField');
    })
})

describe('POST /auth/login', () => {
    it('should return 200 if email and password is valid [no setup]', async () => {
        const uniqueValue = Date.now().toString()
        const signupInfo = mockUserRegistrationInput({
            email: `test1@test.com`,
            username: uniqueValue,
            password:"ValidPass123!"
        })

        const signupRes = await request(app)
            .post('/auth/signup')
            .send(signupInfo)
            .expect(201)

        testUsers.push({ email: signupRes.body.data.email, userid: signupRes.body.data.id })

        console.log(signupRes)

        const profile = mockUserProfile({
            userid: signupRes.body.data.id,
            user_name: uniqueValue,
            skill_level: "Beginner",
            email_verified: false
        })
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: "test1@test.com",
                password: "ValidPass123!"
            })

        expect(res.statusCode).toBe(200)
        expect(res.body).toMatchObject({
            message: "Sign in successful.",
            success: true,
            data: {
                userProfile: profile
            }
        });
    })
    it('should return 400 if email and password is wrong [no setup]', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: `test3@gmail.com`,
                password: "invalidPass"
            })

        expect(res.statusCode).toBe(400)
        expect(res.body).toEqual(expect.objectContaining({ error: "Sign in unsuccessful." }))
    })
})

describe('POST /auth/token-verify', () => {
    it('should set email_verified to true after valid token verification', async () => {
        //create a new user

        const jti = uuidv4()

        //create a token to insert into db directly
        const newUrlToken = authService.createUrlToken(testUsers[0].email, testUsers[0].userid, jti)

        const token = new URL(newUrlToken).searchParams.get('token')

        const query = `UPDATE users SET jti = $1 WHERE userid = $2`
        await db.none(query, [jti, testUsers[0].userid])

        const res = await request(app)
            .post(`/auth/token-verify?token=${token}`)
            .expect(200)

        expect(res.body).toHaveProperty('message', 'User successfully verified');

        const updatedUser = await db.one('SELECT email_verified FROM users WHERE userid = $1', [testUsers[0].userid]);
        expect(updatedUser.email_verified).toBe(true);
    })
    it('should give link expired error when the token expires', async () => {

        const jti = uuidv4()

        //create a token to insert into db directly
        const newUrlToken = authService.createUrlToken(testUsers[0].email, testUsers[0].userid, jti, { expiresIn: "1s" })

        const token = new URL(newUrlToken).searchParams.get('token')

        const query = `UPDATE users SET jti = $1 WHERE userid = $2`
        await db.none(query, [jti, testUsers[0].userid])

        await new Promise(resolve => setTimeout(resolve, 2000)) //wait 2 seconds

        const res = await request(app)
            .post(`/auth/token-verify?token=${token}`)
            .expect(401)

        expect(res.body).toHaveProperty('error', 'Link is expired.');

    })
    it('should give an error if jti in db does not match the token', async () => {
        const jti = uuidv4()

        //create a random token not matching the one in db
        const newUrlToken = authService.createUrlToken(testUsers[0].email, testUsers[0].userid, jti)

        const token = new URL(newUrlToken).searchParams.get('token')

        const res = await request(app)
            .post(`/auth/token-verify?token=${token}`)
            .expect(401)

        expect(res.body).toHaveProperty('error', 'Token is invalid or already used.');

    })
})

describe.only('POST /auth/resend-token', () => {
    it('should send a valid link to the users email', async () => {

        const previousJTI = await db.one("SELECT jti FROM users WHERE userid = $1", [testUsers[0].userid])

        console.log(previousJTI.jti)

        const req = {
            email: testUsers[0].email,
            userid: testUsers[0].userid
        }

        const res = await request(app)
            .post('/auth/resend-token')
            .send(req)
            .expect(200)

        const currentJTI = await db.one("SELECT jti FROM users WHERE userid = $1", [testUsers[0].userid])

        console.log(currentJTI.jti)

        expect(previousJTI.jti).not.toBe(currentJTI.jti)
        expect(res.body).toHaveProperty("message", "Email verification link sent successfully")

    })
    it('should throw an error if email not found in database [no setup]', async () => {
        const req = {
            email: "none_existing_email@gmail.com",
            userid: 1
        }
        const res = await request(app)
            .post('/auth/resend-token')
            .send(req)
            .expect(400)
        
        expect(res.body).toHaveProperty("error","Email not found.")
    })
})

