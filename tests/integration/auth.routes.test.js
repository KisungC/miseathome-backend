const request = require("supertest")
const app = require("../../app")
const db = require('../../database/index')
const { mockUserProfile } = require("../utils/factories/mockUser")
const sgMail = require("../__mocks__/@sendgrid/mail")

afterAll(async () => {
    await db.$pool.end();
});

describe('POST /auth/signup', () => {

    it('should sign up and send a verification email', async () => {
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

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User successfully created');

        // Assert SendGrid payload
        const emailPayload = sgMail.__getLastEmailPayload();
        expect(emailPayload).toBeDefined();
        expect(emailPayload.to).toBe(uniqueEmail);
        expect(emailPayload.html).toContain('auth?token=');
    })

    it('should be return 400 if one of the field is missing', async () => {
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
    it('should be return 409 if email is duplicate', async () => {
        const uniqueValue = Date.now().toString()
        const res = await request(app)
            .post('/auth/signup')
            .send({
                password: 'ValidPass123!',
                email: `chung.kisung0@gmail.com`,
                username: uniqueValue,
                firstname: 'Test',
                lastname: 'User',
                skillLevel: 'Beginner'
            })

        expect(res.statusCode).toBe(409)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toBe('Email is already Taken.');
    })
    it('should be return 400 if there is an extra field in the req.body', async () => {
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
    it('should return 200 if email and password is valid', async () => {
        const profile = mockUserProfile({
            userid: 10,
            user_name: "1755112815022",
            first_name: "Test",
            last_name: "User",
            skill_level: "Beginner",
            email_verified: false
        })
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: "test3@gmail.com",
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
    it('should return 400 if email and password is wrong', async () => {
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
    it('should set email_verified to true after valid token verification',async()=>{

    })
})

describe('POST /auth/resend-token', () => {

})

