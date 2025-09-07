// Mock NextAuth for testing
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: '2025-12-31',
};

const useSession = jest.fn(() => ({
  data: mockSession,
  status: 'authenticated',
}));

const signIn = jest.fn();
const signOut = jest.fn();
const getSession = jest.fn(() => Promise.resolve(mockSession));

module.exports = {
  useSession,
  signIn,
  signOut,
  getSession,
  mockSession,
};