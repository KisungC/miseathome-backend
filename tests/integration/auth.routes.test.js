const request = require("supertest")
const app = require("../../app")

describe('POST /auth/signup', () => {
    it('should be return 201', async () => {
        const uniqueValue = Date.now().toString()
        const res = await request(app)
            .post('/auth/signup')
            .send({
                password: 'ValidPass123!',
                email: `${uniqueValue}@gmail.com`,
                username: uniqueValue,
                firstname: 'Test',
                lastname: 'User',
                skillLevel: 'Beginner'
            })

        expect(res.statusCode).toBe(201)
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