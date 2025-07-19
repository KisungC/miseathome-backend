const mockUser = (overrides = {}) => ({
  id: 1,
  user_name: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  first_name: 'fn',
  last_name: 'ln',
  skill_level: 'Beginner',
  created_at: new Date().toISOString(),
  ...overrides
});

module.exports = { mockUser };