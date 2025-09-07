import type { UpdateUserProfileRequest, UserSearchRequest } from '@/types/api.types';
import type { User, UserProfile, UserStats } from '@/types/user.types';

import { apiService } from '../api.service';
import { UserService } from '../user.service';

// Mock the API service
jest.mock('../api.service', () => ({
  apiService: {
    get: jest.fn(),
    patch: jest.fn(),
    uploadFile: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getCurrentUserProfile', () => {
    it('should get current user profile successfully', async () => {
      const userData: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: userData,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.getCurrentUserProfile();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(userData);
      expect(mockApiService.get).toHaveBeenCalledWith('/api/user/profile');
    });

    it('should handle error when getting current user profile', async () => {
      const error = new Error('Network error');
      mockApiService.get.mockRejectedValueOnce(error);

      await expect(userService.getCurrentUserProfile()).rejects.toThrow('Network error');
      expect(mockApiService.get).toHaveBeenCalledWith('/api/user/profile');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData: UpdateUserProfileRequest = {
        firstName: 'Updated',
        lastName: 'Name',
        company: 'New Company',
      };

      const updatedUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'user',
        company: 'New Company',
        isEmailVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApiService.patch.mockResolvedValueOnce({
        success: true,
        data: updatedUser,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.updateProfile(updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(mockApiService.patch).toHaveBeenCalledWith('/api/user/profile', updateData);
    });
  });

  describe('getUser', () => {
    it('should get user by ID successfully', async () => {
      const userProfile: UserProfile = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        stats: {
          projectsCount: 5,
          tasksCompleted: 25,
          totalHours: 120,
          rating: 4.5,
          reviewsCount: 10,
        },
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisible: true,
            showEmail: false,
            showPhone: false,
          },
        },
      };

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: userProfile,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.getUser('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(userProfile);
      expect(mockApiService.get).toHaveBeenCalledWith('/api/users/1');
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const searchParams: UserSearchRequest = {
        query: 'test',
        role: 'user',
        page: 1,
        limit: 10,
      };

      const users: User[] = [
        {
          id: '1',
          email: 'test1@example.com',
          firstName: 'Test',
          lastName: 'User1',
          role: 'user',
          isEmailVerified: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          email: 'test2@example.com',
          firstName: 'Test',
          lastName: 'User2',
          role: 'user',
          isEmailVerified: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: users,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        timestamp: new Date().toISOString(),
      });

      const result = await userService.searchUsers(searchParams);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(users);
      expect(result.pagination).toBeDefined();
      expect(mockApiService.get).toHaveBeenCalledWith('/api/users/search', searchParams);
    });
  });

  describe('getUsers', () => {
    it('should get users with default pagination', async () => {
      const users: User[] = [
        {
          id: '1',
          email: 'test1@example.com',
          firstName: 'Test',
          lastName: 'User1',
          role: 'user',
          isEmailVerified: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: users,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        timestamp: new Date().toISOString(),
      });

      const result = await userService.getUsers();

      expect(result.success).toBe(true);
      expect(mockApiService.get).toHaveBeenCalledWith('/api/users', { page: 1, limit: 20 });
    });

    it('should get users with custom pagination', async () => {
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
        timestamp: new Date().toISOString(),
      });

      await userService.getUsers(2, 5);

      expect(mockApiService.get).toHaveBeenCalledWith('/api/users', { page: 2, limit: 5 });
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics successfully', async () => {
      const userStats: UserStats = {
        projectsCount: 10,
        tasksCompleted: 50,
        totalHours: 200,
        rating: 4.8,
        reviewsCount: 15,
      };

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: userStats,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.getUserStats('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(userStats);
      expect(mockApiService.get).toHaveBeenCalledWith('/api/users/1/stats');
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const file = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const uploadResponse = { url: 'https://example.com/avatar.jpg' };
      const onProgress = jest.fn();

      mockApiService.uploadFile.mockResolvedValueOnce({
        success: true,
        data: uploadResponse,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.uploadAvatar(file, onProgress);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(uploadResponse);
      expect(mockApiService.uploadFile).toHaveBeenCalledWith(
        '/api/user/avatar',
        file,
        {},
        onProgress
      );
    });

    it('should upload avatar without progress callback', async () => {
      const file = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
      const uploadResponse = { url: 'https://example.com/avatar.jpg' };

      mockApiService.uploadFile.mockResolvedValueOnce({
        success: true,
        data: uploadResponse,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.uploadAvatar(file);

      expect(result.success).toBe(true);
      expect(mockApiService.uploadFile).toHaveBeenCalledWith(
        '/api/user/avatar',
        file,
        {},
        undefined
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences successfully', async () => {
      const preferences = {
        theme: 'dark',
        language: 'es',
        notifications: {
          email: false,
          push: true,
          sms: false,
        },
      };

      mockApiService.patch.mockResolvedValueOnce({
        success: true,
        data: preferences,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.updatePreferences(preferences);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(preferences);
      expect(mockApiService.patch).toHaveBeenCalledWith('/api/user/preferences', preferences);
    });
  });

  describe('getUserActivity', () => {
    it('should get user activity with default pagination', async () => {
      const activities = [
        { id: '1', action: 'login', timestamp: '2024-01-01T00:00:00Z' },
        { id: '2', action: 'update_profile', timestamp: '2024-01-01T01:00:00Z' },
      ];

      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: activities,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        timestamp: new Date().toISOString(),
      });

      const result = await userService.getUserActivity();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(activities);
      expect(mockApiService.get).toHaveBeenCalledWith('/api/user/activity', { page: 1, limit: 20 });
    });

    it('should get user activity with custom pagination', async () => {
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: [],
        pagination: {
          page: 3,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
        timestamp: new Date().toISOString(),
      });

      await userService.getUserActivity(3, 10);

      expect(mockApiService.get).toHaveBeenCalledWith('/api/user/activity', { page: 3, limit: 10 });
    });
  });
});