import type { LoginRequest, LoginResponse } from '@/types/api.types';

import { apiService } from '../api.service';
import { AuthService } from '../auth.service';

// Mock the API service
jest.mock('../api.service', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    it('should login successfully and store auth data', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse: LoginResponse = {
        token: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: '2025-12-31T23:59:59Z',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          isEmailVerified: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: loginResponse,
        timestamp: new Date().toISOString(),
      });

      const result = await authService.login(loginRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(loginResponse);
      expect(mockApiService.post).toHaveBeenCalledWith('/api/auth/login', loginRequest);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_access_token', 'access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_refresh_token', 'refresh-token');
      expect(mockApiService.setAuthToken).toHaveBeenCalledWith('access-token');
    });

    it('should handle login failure', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockApiService.post.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid credentials',
          statusCode: 401,
        },
        timestamp: new Date().toISOString(),
      });

      const result = await authService.login(loginRequest);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTHENTICATION_ERROR');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout and clear auth data', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        timestamp: new Date().toISOString(),
      });

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_expires_at');
      expect(mockApiService.clearAuthToken).toHaveBeenCalled();
    });

    it('should clear auth data even if server call fails', async () => {
      mockApiService.post.mockRejectedValueOnce(new Error('Network error'));

      try {
        await authService.logout();
      } catch (error) {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_access_token');
        expect(mockApiService.clearAuthToken).toHaveBeenCalled();
      }
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_refresh_token') {return 'refresh-token';}
        return null;
      });

      const refreshResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: '2025-12-31T23:59:59Z',
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: refreshResponse,
        timestamp: new Date().toISOString(),
      });

      const result = await authService.refreshToken();

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/api/auth/refresh', {
        refreshToken: 'refresh-token',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_access_token', 'new-access-token');
      expect(mockApiService.setAuthToken).toHaveBeenCalledWith('new-access-token');
    });

    it('should throw error if no refresh token available', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });

    it('should clear auth data if refresh fails', async () => {
      localStorageMock.getItem.mockReturnValue('refresh-token');
      mockApiService.post.mockRejectedValueOnce(new Error('Refresh failed'));

      try {
        await authService.refreshToken();
      } catch (error) {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_access_token');
        expect(mockApiService.clearAuthToken).toHaveBeenCalled();
      }
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid token', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_access_token') {return 'valid-token';}
        if (key === 'auth_expires_at') {return futureDate;}
        return null;
      });

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false for expired token', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_access_token') {return 'expired-token';}
        if (key === 'auth_expires_at') {return pastDate;}
        return null;
      });

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false if no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should return parsed user data', () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData));

      const result = authService.getUser();

      expect(result).toEqual(userData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_user');
    });

    it('should return null if no user data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.getUser();

      expect(result).toBeNull();
    });

    it('should return null if invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = authService.getUser();

      expect(result).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should initialize with valid token and fetch user', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const userData = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const,
        isEmailVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_access_token') {return 'valid-token';}
        if (key === 'auth_expires_at') {return futureDate;}
        return null;
      });

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: userData,
        timestamp: new Date().toISOString(),
      });

      await authService.initialize();

      expect(mockApiService.setAuthToken).toHaveBeenCalledWith('valid-token');
      expect(mockApiService.get).toHaveBeenCalledWith('/api/auth/me');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(userData));
    });

    it('should clear auth data if token verification fails', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_access_token') {return 'invalid-token';}
        if (key === 'auth_expires_at') {return futureDate;}
        return null;
      });

      mockApiService.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await authService.initialize();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_access_token');
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        timestamp: new Date().toISOString(),
      });

      const result = await authService.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com',
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      mockApiService.post.mockResolvedValueOnce({
        success: true,
        timestamp: new Date().toISOString(),
      });

      const result = await authService.changePassword(passwordData);

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/api/auth/change-password', passwordData);
    });
  });
});