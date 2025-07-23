const mockUser = (overrides = {}) => ({
  id: 1,
  user_name: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  first_name: 'fn',
  last_name: 'ln',
  skill_level: 'Beginner',
  created_at: new Date().toISOString(),
  email_verified: false,
  ...overrides
});

const mockCreateUserRes = (overrides = {}) =>({
  id: 1,
  user_name: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  first_name: 'fn',
  last_name: 'ln',
  skill_level: 'Beginner',
  created_at: new Date().toISOString(),
  email_verified: false,
  ...overrides
})

module.exports = { mockUser, mockCreateUserRes };