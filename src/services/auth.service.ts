import { apiService } from './api.service';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ApiResponse 
} from '@/types/api.types';
import type { User } from '@/types/user.types';

/**
 * Authentication service for handling user authentication operations
 * Manages login, registration, token refresh, and password operations
 */
export class AuthService {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
    ME: '/api/auth/me',
  } as const;

  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER: 'auth_user',
    EXPIRES_AT: 'auth_expires_at',
  } as const;

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiService.post<LoginResponse>(
        this.AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        await this.handleAuthSuccess(response.data);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiService.post<RegisterResponse>(
        this.AUTH_ENDPOINTS.REGISTER,
        userData
      );

      if (response.success && response.data) {
        await this.handleAuthSuccess(response.data);
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored tokens
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      // Call logout endpoint to invalidate server-side session
      const response = await apiService.post<void>(this.AUTH_ENDPOINTS.LOGOUT);
      
      // Clear local storage regardless of server response
      this.clearAuthData();
      apiService.clearAuthToken();

      return response;
    } catch (error) {
      // Clear local data even if server call fails
      this.clearAuthData();
      apiService.clearAuthToken();
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<RefreshTokenResponse>(
        this.AUTH_ENDPOINTS.REFRESH,
        { refreshToken } as RefreshTokenRequest
      );

      if (response.success && response.data) {
        // Update stored tokens
        this.setAccessToken(response.data.token);
        this.setRefreshToken(response.data.refreshToken);
        this.setExpiresAt(response.data.expiresAt);
        
        // Update API service token
        apiService.setAuthToken(response.data.token);
      }

      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth data if refresh fails
      this.clearAuthData();
      apiService.clearAuthToken();
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(
        this.AUTH_ENDPOINTS.FORGOT_PASSWORD,
        { email } as ForgotPasswordRequest
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(
        this.AUTH_ENDPOINTS.RESET_PASSWORD,
        resetData
      );
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(
        this.AUTH_ENDPOINTS.CHANGE_PASSWORD,
        passwordData
      );
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(
        `${this.AUTH_ENDPOINTS.VERIFY_EMAIL}?token=${token}`
      );
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(this.AUTH_ENDPOINTS.RESEND_VERIFICATION);
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await apiService.get<User>(this.AUTH_ENDPOINTS.ME);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = this.getExpiresAt();
    
    if (!token || !expiresAt) {
      return false;
    }

    // Check if token is expired
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    
    return now < expiry;
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Initialize auth service (call on app startup)
   */
  async initialize(): Promise<void> {
    const token = this.getAccessToken();
    
    if (token && this.isAuthenticated()) {
      // Set token in API service
      apiService.setAuthToken(token);
      
      try {
        // Verify token is still valid by fetching current user
        const response = await this.getCurrentUser();
        
        if (response.success && response.data) {
          this.setUser(response.data);
        } else {
          // Token is invalid, clear auth data
          this.clearAuthData();
        }
      } catch (error) {
        // Token verification failed, clear auth data
        console.error('Token verification failed:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Handle successful authentication
   */
  private async handleAuthSuccess(authData: LoginResponse | RegisterResponse): Promise<void> {
    this.setAccessToken(authData.token);
    this.setRefreshToken(authData.refreshToken);
    this.setExpiresAt(authData.expiresAt);
    this.setUser(authData.user);
    
    // Set token in API service
    apiService.setAuthToken(authData.token);
  }

  /**
   * Storage methods
   */
  private getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  private getExpiresAt(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.EXPIRES_AT);
  }

  private setExpiresAt(expiresAt: string): void {
    localStorage.setItem(this.STORAGE_KEYS.EXPIRES_AT, expiresAt);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    localStorage.removeItem(this.STORAGE_KEYS.EXPIRES_AT);
  }

  /**
   * Auto-refresh token before expiry
   */
  async setupAutoRefresh(): Promise<void> {
    const expiresAt = this.getExpiresAt();
    
    if (!expiresAt) return;

    const expiry = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const timeUntilExpiry = expiry - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      setTimeout(async () => {
        try {
          await this.refreshToken();
          // Setup next auto-refresh
          this.setupAutoRefresh();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          // Redirect to login or show notification
        }
      }, refreshTime);
    }
  }
}

// Create singleton instance
export const authService = new AuthService();