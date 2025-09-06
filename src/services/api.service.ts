import { API_CONFIG, API_ERRORS, CONTENT_TYPES, REQUEST_HEADERS } from '@/constants/api';
import type { ApiResponse, ApiRequestOptions, ApiError } from '@/types/api.types';
import { ApiErrorHandler, apiRequest } from '@/utils/api-error-handler';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';

/**
 * Centralized API service for handling HTTP requests
 * Provides consistent error handling, request/response transformation, and retry logic
 */
export class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.defaultHeaders = {
      [REQUEST_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      [REQUEST_HEADERS.ACCEPT]: CONTENT_TYPES.JSON,
      [REQUEST_HEADERS.X_REQUESTED_WITH]: 'XMLHttpRequest',
    };
  }

  /**
   * Set authentication token for requests
   */
  setAuthToken(token: string): void {
    this.defaultHeaders[REQUEST_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders[REQUEST_HEADERS.AUTHORIZATION];
  }

  /**
   * Generic request method with enhanced error handling and logging
   */
  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      params,
      body,
      timeout = this.timeout,
      retries = this.retryAttempts,
    } = options;

    const url = this.buildUrl(endpoint, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    const context = `ApiService.${method} ${endpoint}`;

    // Log request start
    logger.info(`Starting API request: ${method} ${endpoint}`, context, {
      method,
      endpoint,
      params,
      hasBody: !!body,
    });

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Remove content-type header for FormData (browser will set it with boundary)
        delete requestHeaders[REQUEST_HEADERS.CONTENT_TYPE];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    try {
      // Use the enhanced apiRequest function with built-in error handling
      const result = await apiRequest<any>(url, {
        ...requestConfig,
        timeout,
        retries,
        context,
      });

      // Transform to our ApiResponse format
      const apiResponse: ApiResponse<T> = {
        success: true,
        data: result.data || result,
        message: result.message,
        timestamp: new Date().toISOString(),
        requestId: result.requestId,
      };

      logger.info(`API request completed successfully: ${method} ${endpoint}`, context);
      return apiResponse;

    } catch (error) {
      const apiError = error as any;
      
      // Log the error
      ErrorHandler.handle(apiError, context, {
        method,
        endpoint,
        url,
        status: apiError.status,
      });

      // Transform to our ApiResponse format
      const errorResponse: ApiResponse<T> = {
        success: false,
        error: {
          code: this.mapErrorCode(apiError),
          message: apiError.message,
          statusCode: apiError.status,
          details: apiError.details,
        },
        timestamp: new Date().toISOString(),
      };

      return errorResponse;
    }
  }

  /**
   * Handle response and transform to ApiResponse format
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const timestamp = new Date().toISOString();

    try {
      // Handle different response types
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error: ApiError = {
          code: data.code || API_ERRORS.SERVER_ERROR,
          message: data.message || response.statusText,
          statusCode: response.status,
          details: data.details,
        };

        return {
          success: false,
          error,
          timestamp,
        };
      }

      // Handle successful responses
      return {
        success: true,
        data: data.data || data,
        message: data.message,
        timestamp,
        requestId: response.headers.get('x-request-id') || undefined,
      };
    } catch (error) {
      const apiError: ApiError = {
        code: API_ERRORS.SERVER_ERROR,
        message: 'Failed to parse response',
        statusCode: response.status,
        details: { originalError: (error as Error).message },
      };

      return {
        success: false,
        error: apiError,
        timestamp,
      };
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Check if error is a client error (4xx)
   */
  private isClientError(error: any): boolean {
    if (error?.response?.status) {
      return error.response.status >= 400 && error.response.status < 500;
    }
    return false;
  }

  /**
   * Map error to appropriate error code
   */
  private mapErrorCode(error: any): string {
    if (error.status === 0 || error.name === 'AbortError') {
      return API_ERRORS.TIMEOUT_ERROR;
    }

    if (error.status === 401) {
      return API_ERRORS.UNAUTHORIZED;
    }

    if (error.status === 403) {
      return API_ERRORS.FORBIDDEN;
    }

    if (error.status === 404) {
      return API_ERRORS.NOT_FOUND;
    }

    if (error.status >= 400 && error.status < 500) {
      return API_ERRORS.CLIENT_ERROR;
    }

    if (error.status >= 500) {
      return API_ERRORS.SERVER_ERROR;
    }

    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return API_ERRORS.NETWORK_ERROR;
    }

    return API_ERRORS.UNKNOWN_ERROR;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method shortcuts
  async get<T>(endpoint: string, params?: Record<string, any>, options?: Omit<ApiRequestOptions, 'method' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    // For file uploads, we'll use XMLHttpRequest to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        try {
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((headers, line) => {
              const [key, value] = line.split(': ');
              if (key && value) headers[key] = value;
              return headers;
            }, {} as Record<string, string>)),
          });

          const result = await this.handleResponse<T>(response);
          resolve(result);
        } catch (error) {
          reject(this.createApiError(error as Error));
        }
      });

      xhr.addEventListener('error', () => {
        reject(this.createApiError(new Error('Upload failed')));
      });

      xhr.addEventListener('timeout', () => {
        reject(this.createApiError(new Error('Upload timeout')));
      });

      const url = this.buildUrl(endpoint);
      xhr.open('POST', url);
      
      // Set auth header if available
      if (this.defaultHeaders[REQUEST_HEADERS.AUTHORIZATION]) {
        xhr.setRequestHeader(REQUEST_HEADERS.AUTHORIZATION, this.defaultHeaders[REQUEST_HEADERS.AUTHORIZATION]);
      }

      xhr.timeout = this.timeout;
      xhr.send(formData);
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();