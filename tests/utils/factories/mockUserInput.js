const mockUserRegistrationInput = (overrides = {}) =>(
{
    email: `test@example.com`,
    password: 'ValidPass123!',
    username: 'tester',
    firstname: 'Test',
    lastname: 'User',
    skillLevel: 'Beginner',
    ...overrides
});

const mockUserSignIn = (overrides = {}) =>(
{
    email: `test@example.com`,
    password: 'ValidPass123!',
    ...overrides
});

const mockUserRegistrationInputJTI = (overrides = {}) =>(
{
    email: `test@example.com`,
    password: 'ValidPass123!',
    username: 'tester',
    firstname: 'Test',
    lastname: 'User',
    skillLevel: 'Beginner',
    jti:"someUUID",
    ...overrides
});

module.exports = {mockUserRegistrationInput, mockUserRegistrationInputJTI, mockUserSignIn}