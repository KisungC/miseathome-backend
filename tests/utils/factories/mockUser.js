const mockCreateUserRes = (overrides = {}) =>({
  userid: 1,
  user_name: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  first_name: 'fn',
  last_name: 'ln',
  skill_level: 'Beginner',
  signup_date: new Date().toISOString(),
  email_verified: false,
  jti: "uuid",
  ...overrides
})

const mockUserProfile = (overrides = {}) =>({
  userid:1,
  user_name: 'tester',
  first_name: 'Test',
  last_name: 'User',
  skill_level: 'Beginner',
  accessToken:"jwtToken",
  ...overrides
})

module.exports = { mockCreateUserRes, mockUserProfile };