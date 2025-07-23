const mockUserInput = (overrides = {}) =>(
{
    email: `test@example.com`,
    password: 'ValidPass123!',
    username: 'tester',
    firstname: 'Test',
    lastname: 'User',
    skillLevel: 'Beginner',
    ...overrides
});

module.exports = {mockUserInput}