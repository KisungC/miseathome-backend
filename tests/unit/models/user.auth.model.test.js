jest.mock('../../../models/user.model')

const {createUser, findByEmail, findByUsername} = require('../../../models/user.model')
const { mockCreateUserRes} = require('../../utils/factories/mockUser')
const { mockUserRegistrationInput } = require('../../utils/factories/mockUserInput')


describe('Testing Model', ()=>{
    describe('Testing findByEmail', ()=>{
        it('should be successful when finding a user with email', async ()=>{
            const email = 'test1@gmail.com'

            const expectedResult = mockCreateUserRes({
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
        it('should be successful to find a user by username', async()=>{
            const username = 'test'

            const expectedResult = mockCreateUserRes({
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

    describe('Testing Create User', () =>{
        it('should be successful when creating an account', async()=>{
            const timeNow = Date.now()

            const customInput = {
                email: `${timeNow}@test.com`,
                username: timeNow
            }

            const userInput = mockUserRegistrationInput({customInput})

            createUser.mockResolvedValue(mockCreateUserRes({email: `${timeNow}@test.com`,
                user_name: timeNow}))

            await expect(createUser(userInput)).resolves.toEqual(expect.objectContaining({
                email: `${timeNow}@test.com`,
                user_name: timeNow
            }))
        })

        it('should fail to register when email is already taken', async() =>{
            const duplicateEmail = 'test1@gmail.com'

            createUser.mockRejectedValue(new Error("23505 UNIQUE VIOLATION"))

            await expect(createUser(mockUserRegistrationInput({email: duplicateEmail}))).rejects.toThrow() //can add specific error code from database
        })

        it('should fail to register when user is already taken', async() =>{
            const duplicateUsername = 'test'

            await expect(createUser(mockUserRegistrationInput({email: duplicateUsername}))).rejects.toThrow() //can add specific error code from database
        })
    })
})