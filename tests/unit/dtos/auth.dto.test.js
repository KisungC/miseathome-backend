const { validateSignupDTO } = require('../../../dtos/auth.dto');

const baseReq = {
    email: 'test@example.com',
    password: 'ValidPass123!',
    username: 'tester',
    firstname: 'Test',
    lastname: 'User',
    skillLevel: 'Beginner'
};

const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

const next = jest.fn();

describe('Auth DTO Validation', () => {
    describe('Email Validation', () => {

        it('should return 400 if email is missing', () => {
            const { email, ...rest } = baseReq //exclude email
            const req = {
                body: {
                    ...rest
                }
            };

            expect(() => validateSignupDTO(req, res, next)).toThrow('One or more fields are missing')
        })

        describe('Invalid Email Format', () => {
            it('should return 400 if email is missing @', () => {
                const req = {
                    body: {
                        ...baseReq,
                        email: 'testATtest.com'
                    }
                }

                // const consoleSpy = jest.spyOn(console, 'log')  ------------------------ THIS IS HOW TO LOG IN JEST!

                // console.log(req)

                // expect(consoleSpy).toHaveBeenCalledWith(req)
                expect(() => validateSignupDTO(req, res, next)).toThrow('Email is invalid.')
            })

            it('should return 400 if email is missing .', () => {
                const req = {
                    body: {
                        ...baseReq,
                        email: 'test@testcom'
                    }
                }
                expect(() => validateSignupDTO(req, res, next)).toThrow('Email is invalid.')
            })

            it('should return 400 if email has less than 2 letters after .', () => {
                const req = {
                    body: {
                        ...baseReq,
                        email: 'test@test.c'
                    }
                }

                expect(() => validateSignupDTO(req, res, next)).toThrow('Email is invalid.')
            })
        })
    });

    describe('Password Validation', () => {
        it('should return 400 if password is missing', () => {
            const { password, ...rest } = baseReq
            const req = {
                body: {
                    ...rest
                }
            }
            expect(() => validateSignupDTO(req, res, next)).toThrow('One or more fields are missing')
        })

        describe('Invalid Password', () => {
            it('should return 400 if password is not complex', () => {
                const req = {
                    body: {
                        ...baseReq,
                        password: 'password1234'
                    }
                }

                expect(() => validateSignupDTO(req, res, next)).toThrow('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
            })

            it('should return 400 if password is too short', () => {
                const req = {
                    body: {
                        ...baseReq,
                        password: '12'
                    }
                }
                expect(() => validateSignupDTO(req, res, next)).toThrow('Password is too short.')
            })

            it('should return 400 if password is too long', () => {
                const req = {
                    body: {
                        ...baseReq,
                        password: '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'
                    }
                }
                expect(() => validateSignupDTO(req, res, next)).toThrow('Password is too long.')
            })
        })
    })

    describe('Username Validation', () => {
        it('should return 400 if username is empty', () => {
            const { skillLevel, ...rest } = baseReq
            const req = {
                body:
                {
                    ...rest
                }
            }
            expect(() => validateSignupDTO(req, res, next)).toThrow('One or more fields are missing.')
        })
        describe('Invalid Username', () => {
            it('should return 400 if username is too short', () => {
                const req = {
                    body: {
                        ...baseReq,
                        username: '12'
                    }
                }

                expect(() => validateSignupDTO(req, res, next)).toThrow('Username is too short.')
            })
            it('should return 400 if username is too long', () => {
                const username = '1234567890123456789012345678901234567890'
                const req = {
                    body: {
                        ...baseReq,
                        username: username
                    }
                }
                expect(username.length).not.toBeLessThanOrEqual(38)
                expect(()=>validateSignupDTO(req,res,next)).toThrow('Username is too long.')
            })
        })

    })

    it('should return 201 when user data is valid', () => {
        const req = { body: { ...baseReq } }
        expect(() => validateSignupDTO(req, res, next)).not.toThrow()
        expect(next).toHaveBeenCalled()
    })

});
