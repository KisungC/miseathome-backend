const request = require("supertest")
const app = require("../../app")

describe('POST /auth/signup', ()=>{
    it('should return 400 if email is missing',async()=>{
        const uniqueValue = Date.now()
        const res = await request(app)
        .post('auth/signup')
        .send({
            password: 'ValidPass123!',
            email:`${uniqueValue}@gmail.com`,
            username: uniqueValue,
            firstname: 'Test',
            lastname: 'User',
            skillLevel: 'Beginner'
        })

        expect(res.statusCode).toBe(400)
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toBe('One or more fields are missing');
    })
})