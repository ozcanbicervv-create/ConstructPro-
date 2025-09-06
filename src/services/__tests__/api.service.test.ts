import { ApiService } from '../api.service';
import { API_CONFIG, API_ERRORS } from '@/constants/api';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock AbortSignal.timeout
global.AbortSignal.timeout = jest.fn(() => ({
  aborted: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})) as any;

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = new ApiService();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(apiService).toBeDefined();
    });
  });

  describe('setAuthToken', () => {
    it('should set authorization header', () => {
      const token = 'test-token';
      apiService.setAuthToken(token);
      
      // We can't directly test private properties, but we can test the behavior
      // by making a request and checking if the header is included
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      } as Response);

      apiService.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      );
    });
  });

  describe('clearAuthToken', () => {
    it('should remove authorization header', () => {
      apiService.setAuthToken('test-token');
      apiService.clearAuthToken();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers(),
      } as Response);

      apiService.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('get', () => {
    it('should make GET request successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockData }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await apiService.get('/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await apiService.get('/test', { page: 1, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&limit=10'),
        expect.any(Object)
      );
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      const requestBody = { name: 'Test' };
      const responseData = { id: 1, ...requestBody };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: responseData }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await apiService.post('/test', requestBody);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorResponse),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await apiService.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        statusCode: 400,
        details: undefined,
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await apiService.get('/test');
      } catch (error: any) {
        expect(error.code).toBe(API_ERRORS.UNKNOWN_ERROR);
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      try {
        await apiService.get('/test');
      } catch (error: any) {
        expect(error.code).toBe(API_ERRORS.TIMEOUT_ERROR);
        expect(error.message).toBe('Request timeout');
      }
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);

      const result = await apiService.get('/test');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry client errors', async () => {
      const clientError = new Error('Client error');
      (clientError as any).response = { status: 400 };
      mockFetch.mockRejectedValueOnce(clientError);

      try {
        await apiService.get('/test');
      } catch (error) {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('uploadFile', () => {
    it('should upload file with FormData', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Mock XMLHttpRequest
      const mockXHR = {
        upload: { addEventListener: jest.fn() },
        addEventListener: jest.fn(),
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        responseText: JSON.stringify({ data: { url: 'test-url' } }),
        status: 200,
        statusText: 'OK',
        getAllResponseHeaders: () => 'content-type: application/json\r\n',
        timeout: 0,
      };

      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      const uploadPromise = apiService.uploadFile('/upload', file);

      // Simulate successful upload
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      )[1];
      loadHandler();

      const result = await uploadPromise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ url: 'test-url' });
      expect(mockXHR.open).toHaveBeenCalledWith('POST', expect.stringContaining('/upload'));
    });
  });

  describe('HTTP method shortcuts', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    });

    it('should call put method', async () => {
      await apiService.put('/test', { data: 'test' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('should call patch method', async () => {
      await apiService.patch('/test', { data: 'test' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('should call delete method', async () => {
      await apiService.delete('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});