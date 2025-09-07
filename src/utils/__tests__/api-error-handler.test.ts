import { ApiErrorHandler, apiRequest, ValidationError, createValidationError, API_ERRORS } from '../api-error-handler';

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    logApiCall: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('ApiErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createApiError', () => {
    it('should create API error with all properties', () => {
      const error = ApiErrorHandler.createApiError(
        'Test error',
        400,
        'TEST_ERROR',
        { field: 'test' }
      );

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create API error with default values', () => {
      const error = ApiErrorHandler.createApiError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('handleFetchError', () => {
    it('should handle JSON error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        url: 'https://api.test.com/endpoint',
        headers: new Map([['content-type', 'application/json']]),
        json: jest.fn().mockResolvedValue({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { field: 'email' },
        }),
      } as any;

      await expect(
        ApiErrorHandler.handleFetchError(mockResponse, 'Test Context')
      ).rejects.toMatchObject({
        message: 'Validation failed',
        status: 400,
        code: 'VALIDATION_ERROR',
        details: { field: 'email' },
      });
    });

    it('should handle text error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        url: 'https://api.test.com/endpoint',
        headers: new Map([['content-type', 'text/plain']]),
        text: jest.fn().mockResolvedValue('Server error occurred'),
      } as any;

      await expect(
        ApiErrorHandler.handleFetchError(mockResponse, 'Test Context')
      ).rejects.toMatchObject({
        message: 'Server error occurred',
        status: 500,
      });
    });

    it('should handle responses with no content', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: 'https://api.test.com/endpoint',
        headers: new Map(),
        json: jest.fn().mockRejectedValue(new Error('No JSON')),
        text: jest.fn().mockRejectedValue(new Error('No text')),
      } as any;

      await expect(
        ApiErrorHandler.handleFetchError(mockResponse, 'Test Context')
      ).rejects.toMatchObject({
        message: 'Unknown error occurred',
        status: 404,
      });
    });
  });

  describe('handleNetworkError', () => {
    it('should handle network errors', () => {
      const originalError = new Error('Network request failed');
      
      expect(() => {
        ApiErrorHandler.handleNetworkError(originalError, 'Test Context', 'https://api.test.com');
      }).toThrow('Network error: Unable to connect to the server');
    });
  });

  describe('handleTimeoutError', () => {
    it('should handle timeout errors', () => {
      expect(() => {
        ApiErrorHandler.handleTimeoutError('Test Context', 'https://api.test.com', 5000);
      }).toThrow('Request timeout: The server took too long to respond');
    });
  });

  describe('createErrorResponse', () => {
    it('should create standardized error response', () => {
      const error = ApiErrorHandler.createApiError('Test error', 400, 'TEST_ERROR');
      const requestId = 'req_123';
      
      const response = ApiErrorHandler.createErrorResponse(error, requestId);
      
      expect(response.error.message).toBe('Test error');
      expect(response.error.status).toBe(400);
      expect(response.error.code).toBe('TEST_ERROR');
      expect(response.error.requestId).toBe(requestId);
      expect(response.error.timestamp).toBeDefined();
    });

    it('should handle regular errors', () => {
      const error = new Error('Regular error');
      
      const response = ApiErrorHandler.createErrorResponse(error);
      
      expect(response.error.message).toBe('Regular error');
      expect(response.error.status).toBe(500);
      expect(response.error.code).toBeUndefined();
    });
  });

  describe('withErrorHandling', () => {
    it('should handle successful requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue('success');
      const wrappedHandler = ApiErrorHandler.withErrorHandling(mockHandler);
      
      const mockReq = { method: 'GET', url: '/test', headers: {} };
      const mockRes = { 
        setHeader: jest.fn(),
        statusCode: 200,
      };
      
      const result = await wrappedHandler(mockReq, mockRes);
      
      expect(result).toBe('success');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
    });

    it('should handle errors and send error response', async () => {
      const error = ApiErrorHandler.createApiError('Handler error', 400);
      const mockHandler = jest.fn().mockRejectedValue(error);
      const wrappedHandler = ApiErrorHandler.withErrorHandling(mockHandler);
      
      const mockReq = { method: 'POST', url: '/test', headers: {} };
      const mockRes = { 
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        statusCode: 200,
      };
      
      await wrappedHandler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Handler error',
            status: 400,
          }),
        })
      );
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await ApiErrorHandler.withRetry(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const error = ApiErrorHandler.createApiError('Server error', 500);
      const mockFn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');
      
      const result = await ApiErrorHandler.withRetry(mockFn, { maxRetries: 3, delay: 10 });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const error = ApiErrorHandler.createApiError('Bad request', 400);
      const mockFn = jest.fn().mockRejectedValue(error);
      
      await expect(
        ApiErrorHandler.withRetry(mockFn, { maxRetries: 3 })
      ).rejects.toThrow('Bad request');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should respect maxRetries limit', async () => {
      const error = ApiErrorHandler.createApiError('Server error', 500);
      const mockFn = jest.fn().mockRejectedValue(error);
      
      await expect(
        ApiErrorHandler.withRetry(mockFn, { maxRetries: 2, delay: 10 })
      ).rejects.toThrow('Server error');
      
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make successful requests', async () => {
    const mockResponse = {
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: jest.fn().mockResolvedValue({ data: 'success' }),
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await apiRequest('https://api.test.com/endpoint');
    
    expect(result).toEqual({ data: 'success' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/endpoint',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should handle timeout', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AbortError')), 100);
      })
    );
    
    await expect(
      apiRequest('https://api.test.com/endpoint', { timeout: 50 })
    ).rejects.toThrow();
  });

  it('should retry on failure', async () => {
    const error = new Error('Network error');
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(error)
      .mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      });
    
    const result = await apiRequest('https://api.test.com/endpoint', { retries: 1 });
    
    expect(result).toEqual({ data: 'success' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('ValidationError', () => {
  it('should create validation error with field and value', () => {
    const error = new ValidationError('Invalid email', 'email', 'invalid-email');
    
    expect(error.message).toBe('Invalid email');
    expect(error.field).toBe('email');
    expect(error.value).toBe('invalid-email');
    expect(error.name).toBe('ValidationError');
  });
});

describe('createValidationError', () => {
  it('should create validation error with formatted message', () => {
    const error = createValidationError('email', 'invalid-email', 'must be a valid email address');
    
    expect(error.message).toBe('Validation failed for email: must be a valid email address');
    expect(error.field).toBe('email');
    expect(error.value).toBe('invalid-email');
  });
});

describe('API_ERRORS', () => {
  it('should create unauthorized error', () => {
    const error = API_ERRORS.UNAUTHORIZED();
    
    expect(error.message).toBe('Authentication required');
    expect(error.status).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create forbidden error', () => {
    const error = API_ERRORS.FORBIDDEN();
    
    expect(error.message).toBe('Access denied');
    expect(error.status).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('should create not found error', () => {
    const error = API_ERRORS.NOT_FOUND('User');
    
    expect(error.message).toBe('User not found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create validation error', () => {
    const error = API_ERRORS.VALIDATION_ERROR('Invalid input');
    
    expect(error.message).toBe('Invalid input');
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should create rate limited error', () => {
    const error = API_ERRORS.RATE_LIMITED();
    
    expect(error.message).toBe('Too many requests');
    expect(error.status).toBe(429);
    expect(error.code).toBe('RATE_LIMITED');
  });

  it('should create server error', () => {
    const error = API_ERRORS.SERVER_ERROR();
    
    expect(error.message).toBe('Internal server error');
    expect(error.status).toBe(500);
    expect(error.code).toBe('SERVER_ERROR');
  });
});