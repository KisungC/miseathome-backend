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

module.exports = {mockUserRegistrationInput, mockUserSignIn}