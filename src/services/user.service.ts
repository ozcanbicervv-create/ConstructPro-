import type { 
  UpdateUserProfileRequest,
  UserSearchRequest,
  PaginatedResponse,
  ApiResponse 
} from '@/types/api.types';
import type { User, UserProfile, UserStats } from '@/types/user.types';

import { apiService } from './api.service';

/**
 * User service for handling user-related operations
 * Manages user profiles, search, and user-specific functionality
 */
export class UserService {
  private readonly USER_ENDPOINTS = {
    PROFILE: '/api/user/profile',
    USERS: '/api/users',
    USER_BY_ID: (id: string) => `/api/users/${id}`,
    USER_STATS: (id: string) => `/api/users/${id}/stats`,
    USER_SEARCH: '/api/users/search',
    USER_AVATAR: '/api/user/avatar',
    USER_PREFERENCES: '/api/user/preferences',
    USER_ACTIVITY: '/api/user/activity',
  } as const;

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<ApiResponse<User>> {
    try {
      return await apiService.get<User>(this.USER_ENDPOINTS.PROFILE);
    } catch (error) {
      console.error('Get current user profile error:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(profileData: UpdateUserProfileRequest): Promise<ApiResponse<User>> {
    try {
      return await apiService.patch<User>(
        this.USER_ENDPOINTS.PROFILE,
        profileData
      );
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.get<UserProfile>(this.USER_ENDPOINTS.USER_BY_ID(id));
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchParams: UserSearchRequest): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiService.get<User[]>(
        this.USER_ENDPOINTS.USER_SEARCH,
        searchParams
      );

      return response as PaginatedResponse<User>;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiService.get<User[]>(
        this.USER_ENDPOINTS.USERS,
        { page, limit }
      );

      return response as PaginatedResponse<User>;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(id: string): Promise<ApiResponse<UserStats>> {
    try {
      return await apiService.get<UserStats>(this.USER_ENDPOINTS.USER_STATS(id));
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      return await apiService.uploadFile<{ url: string }>(
        this.USER_ENDPOINTS.USER_AVATAR,
        file,
        {},
        onProgress
      );
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    try {
      return await apiService.patch<any>(
        this.USER_ENDPOINTS.USER_PREFERENCES,
        preferences
      );
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivity(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    try {
      const response = await apiService.get<any[]>(
        this.USER_ENDPOINTS.USER_ACTIVITY,
        { page, limit }
      );

      return response as PaginatedResponse<any>;
    } catch (error) {
      console.error('Get user activity error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const userService = new UserService();