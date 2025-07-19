jest.mock('../../../database')
jest.mock('../../../models/user.model')

const {createUser, findByEmail, findByUsername} = require('../../../models/user.model')


describe('Testing Model', ()=>{
    describe('Testing findByEmail', ()=>{
        it('should return found user by email', async ()=>{
            const email = 'test1@gmail.com'

            const expectedResult = {
                user_name: 'test',
                email: 'test1@gmail.com'
            }

            findByEmail.mockResolvedValue(expectedResult);

            await expect(findByEmail(email)).resolves.toEqual(expectedResult);
        })
    })
})