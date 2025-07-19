jest.mock('../../../database')
jest.mock('../../../models/user.model')

const {createUser, findByEmail, findByUsername} = require('../../../models/user.model')
const {mockUser} = require('../../utils/factories')


describe('Testing Model', ()=>{
    describe('Testing findByEmail', ()=>{
        it('should be successful', async ()=>{
            const email = 'test1@gmail.com'

            const expectedResult = mockUser({
                user_name: 'test',
                email: 'test1@gmail.com'
            })

            findByEmail.mockResolvedValue(expectedResult);

            await expect(findByEmail(email)).resolves.toEqual(expect.objectContaining({
                user_name: 'test',
                email: 'test1@gmail.com'
            }));
        })

        it('should throw error when email not found', async ()=>{
            const email = "none existing email"

            findByEmail.mockResolvedValue(null)

            await expect(findByEmail(email)).resolves.toBeNull()
        })
    })

    describe('Testing findByUsername', () =>{
        it('should be successful', async()=>{
            const username = 'test'

            const expectedResult = mockUser({
                user_name: 'test',
                email: 'test1@gmail.com'
            })

            findByUsername.mockResolvedValue(expectedResult)

            await expect(findByUsername(username)).resolves.toEqual(expect.objectContaining({
                user_name:'test',
                email:'test1@gmail.com'
            }))
        })
    })
})