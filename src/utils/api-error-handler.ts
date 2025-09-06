/**
 * API Error Handling Utilities
 * Provides consistent error handling for API requests and responses
 */

import { ErrorHandler } from './error-handler';
import { logger } from './logger';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    status: number;
    timestamp: string;
    details?: Record<string, any>;
    requestId?: string;
  };
}

export class ApiErrorHandler {
  /**
   * Create standardized API error
   */
  static createApiError(
    message: string,
    status = 500,
    code?: string,
    details?: Record<string, any>
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.code = code;
    error.details = details;
    error.timestamp = new Date();
    return error;
  }

  /**
   * Handle fetch API errors
   */
  static async handleFetchError(response: Response, context: string): Promise<never> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'Unknown error occurred' };
    }

    const apiError = this.createApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.code,
      errorData.details
    );

    // Log the error
    logger.error(
      `API Error: ${response.status} ${response.statusText}`,
      context,
      {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        errorData,
      },
      apiError
    );

    throw apiError;
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: Error, context: string, url?: string): never {
    const networkError = this.createApiError(
      'Network error: Unable to connect to the server',
      0,
      'NETWORK_ERROR',
      { originalError: error.message, url }
    );

    logger.error('Network Error', context, { url, originalError: error.message }, networkError);
    
    throw networkError;
  }

  /**
   * Handle timeout errors
   */
  static handleTimeoutError(context: string, url?: string, timeout?: number): never {
    const timeoutError = this.createApiError(
      `Request timeout: The server took too long to respond`,
      408,
      'TIMEOUT_ERROR',
      { url, timeout }
    );

    logger.error('Request Timeout', context, { url, timeout }, timeoutError);
    
    throw timeoutError;
  }

  /**
   * Create standardized error response for API routes
   */
  static createErrorResponse(
    error: Error | ApiError,
    requestId?: string
  ): ApiErrorResponse {
    const apiError = error as ApiError;
    
    return {
      error: {
        message: error.message,
        code: apiError.code,
        status: apiError.status || 500,
        timestamp: new Date().toISOString(),
        details: apiError.details,
        requestId,
      },
    };
  }

  /**
   * Middleware for Next.js API routes error handling
   */
  static withErrorHandling(
    handler: (req: any, res: any) => Promise<any>
  ) {
    return async (req: any, res: any) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Add request ID to headers
        res.setHeader('X-Request-ID', requestId);
        
        // Log incoming request
        logger.info(
          `API Request: ${req.method} ${req.url}`,
          'API',
          {
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            requestId,
          }
        );

        const startTime = Date.now();
        const result = await handler(req, res);
        const duration = Date.now() - startTime;

        // Log successful response
        logger.logApiCall(
          req.method,
          req.url,
          res.statusCode,
          duration,
          { requestId }
        );

        return result;
      } catch (error) {
        const apiError = error as ApiError;
        const status = apiError.status || 500;
        
        // Log error
        logger.error(
          `API Error: ${req.method} ${req.url}`,
          'API',
          {
            method: req.method,
            url: req.url,
            status,
            requestId,
          },
          error as Error
        );

        // Send error response
        const errorResponse = this.createErrorResponse(error as Error, requestId);
        res.status(status).json(errorResponse);
      }
    };
  }

  /**
   * Retry logic for failed API requests
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoff?: boolean;
      retryCondition?: (error: ApiError) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = true,
      retryCondition = (error) => error.status === 0 || (error.status && error.status >= 500),
    } = options;

    let lastError: ApiError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as ApiError;
        
        // Don't retry on last attempt or if retry condition not met
        if (attempt === maxRetries || !retryCondition(lastError)) {
          throw lastError;
        }

        // Calculate delay with optional backoff
        const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay;
        
        logger.warn(
          `API request failed, retrying in ${currentDelay}ms (attempt ${attempt + 1}/${maxRetries})`,
          'API',
          {
            attempt: attempt + 1,
            maxRetries,
            delay: currentDelay,
            error: lastError.message,
          }
        );

        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }

    throw lastError!;
  }
}

/**
 * Enhanced fetch wrapper with error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit & {
    timeout?: number;
    retries?: number;
    context?: string;
  } = {}
): Promise<T> {
  const {
    timeout = 30000,
    retries = 0,
    context = 'API Request',
    ...fetchOptions
  } = options;

  const makeRequest = async (): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await ApiErrorHandler.handleFetchError(response, context);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as any;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          ApiErrorHandler.handleTimeoutError(context, url, timeout);
        } else {
          ApiErrorHandler.handleNetworkError(error, context, url);
        }
      }
      
      throw error;
    }
  };

  if (retries > 0) {
    return ApiErrorHandler.withRetry(makeRequest, {
      maxRetries: retries,
      retryCondition: (error) => error.status === 0 || (error.status && error.status >= 500),
    });
  }

  return makeRequest();
}

/**
 * Validation error helpers
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function createValidationError(
  field: string,
  value: any,
  message: string
): ValidationError {
  return new ValidationError(`Validation failed for ${field}: ${message}`, field, value);
}

/**
 * Common API error types
 */
export const API_ERRORS = {
  UNAUTHORIZED: (message = 'Authentication required') =>
    ApiErrorHandler.createApiError(message, 401, 'UNAUTHORIZED'),
  
  FORBIDDEN: (message = 'Access denied') =>
    ApiErrorHandler.createApiError(message, 403, 'FORBIDDEN'),
  
  NOT_FOUND: (resource = 'Resource') =>
    ApiErrorHandler.createApiError(`${resource} not found`, 404, 'NOT_FOUND'),
  
  VALIDATION_ERROR: (message = 'Validation failed') =>
    ApiErrorHandler.createApiError(message, 400, 'VALIDATION_ERROR'),
  
  RATE_LIMITED: (message = 'Too many requests') =>
    ApiErrorHandler.createApiError(message, 429, 'RATE_LIMITED'),
  
  SERVER_ERROR: (message = 'Internal server error') =>
    ApiErrorHandler.createApiError(message, 500, 'SERVER_ERROR'),
} as const;