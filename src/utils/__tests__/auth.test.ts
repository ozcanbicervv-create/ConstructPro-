import { compare } from 'bcryptjs';

import { authOptions } from '../auth';
import { prisma } from '../db';

// Mock dependencies
jest.mock('../db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCompare = compare as jest.MockedFunction<typeof compare>;

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authOptions', () => {
    it('should have correct configuration', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
      expect(authOptions.pages?.signUp).toBe('/auth/signup');
      expect(authOptions.providers).toHaveLength(1);
    });

    it('should have credentials provider configured', () => {
      const credentialsProvider = authOptions.providers[0];
      expect(credentialsProvider.name).toBe('credentials');
      expect(credentialsProvider.credentials).toHaveProperty('email');
      expect(credentialsProvider.credentials).toHaveProperty('password');
    });
  });

  describe('Credentials Provider authorize function', () => {
    const credentialsProvider = authOptions.providers[0] as any;
    const authorize = credentialsProvider.authorize;

    it('should return null if email is missing', async () => {
      const result = await authorize({ password: 'password123' });
      expect(result).toBeNull();
    });

    it('should return null if password is missing', async () => {
      const result = await authorize({ email: 'test@example.com' });
      expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      const result = await authorize({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user has no password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: null,
        name: 'Test User',
        firstName: null,
        lastName: null,
        role: 'user',
        image: null,
        company: null,
        title: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const result = await authorize({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        image: null,
        company: 'Test Company',
        title: 'Developer',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      mockCompare.mockResolvedValue(false);
      
      const result = await authorize({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      
      expect(result).toBeNull();
      expect(mockCompare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
    });

    it('should return user data if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        image: 'avatar.jpg',
        company: 'Test Company',
        title: 'Developer',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(true);
      
      const result = await authorize({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        image: 'avatar.jpg',
        company: 'Test Company',
        title: 'Developer',
        phone: '+1234567890',
      });
    });
  });

  describe('JWT callback', () => {
    const jwtCallback = authOptions.callbacks?.jwt;

    it('should add user data to token', async () => {
      const token = { sub: '1' };
      const user = {
        id: '1',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Corp',
        title: 'Manager',
        phone: '+1234567890',
      };

      const result = await jwtCallback!({ token, user } as any);

      expect(result).toEqual({
        sub: '1',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Corp',
        title: 'Manager',
        phone: '+1234567890',
      });
    });

    it('should return token unchanged if no user', async () => {
      const token = { sub: '1', role: 'user' };

      const result = await jwtCallback!({ token } as any);

      expect(result).toEqual(token);
    });
  });

  describe('Session callback', () => {
    const sessionCallback = authOptions.callbacks?.session;

    it('should add token data to session', async () => {
      const session = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2025-12-31',
      };
      
      const token = {
        sub: '1',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Corp',
        title: 'Manager',
        phone: '+1234567890',
      };

      const result = await sessionCallback!({ session, token } as any);

      expect(result.user).toEqual({
        email: 'test@example.com',
        name: 'Test User',
        id: '1',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Corp',
        title: 'Manager',
        phone: '+1234567890',
      });
    });
  });
});