// API-related type definitions

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  details?: any;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// Auth-related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: import('./user.types').User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  title?: string;
  phone?: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Multi-Factor Authentication API types
export interface EnableMFARequest {
  password: string;
}

export interface EnableMFAResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface VerifyMFARequest {
  code: string;
}

export interface DisableMFARequest {
  password: string;
  code: string;
}

// Enhanced authentication response
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: import('./user.types').User;
  mfaRequired?: boolean;
}

// User-related types
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  bio?: string;
}

export interface UserSearchRequest {
  query?: string;
  role?: string;
  company?: string;
  page?: number;
  limit?: number;
}