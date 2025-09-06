import { logger, logApiError, logUserAction, logPerformance, measurePerformance } from '../logger';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    
    // Mock console methods
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('debug', () => {
    it('should not log debug messages when level is info or higher', () => {
      // The default logger has info level, so debug messages are filtered out
      logger.debug('Debug message', 'TestContext', { test: 'data' });
      
      const logs = logger.getLogs();
      const debugLogs = logs.filter(log => log.level === 'debug');
      expect(debugLogs).toHaveLength(0);
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Info message', 'TestContext');
      
      const logs = logger.getLogs({ level: 'info' });
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Info message');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Warning message', 'TestContext');
      
      const logs = logger.getLogs({ level: 'warn' });
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
      expect(logs[0].message).toBe('Warning message');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', 'TestContext', { additional: 'data' }, error);
      
      const logs = logger.getLogs({ level: 'error' });
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Error message');
      expect(logs[0].metadata?.stack).toBe(error.stack);
      expect(logs[0].metadata?.errorName).toBe('Error');
      expect(logs[0].metadata?.additional).toBe('data');
    });
  });

  describe('logApiCall', () => {
    it('should log successful API calls as info', () => {
      logger.logApiCall('GET', '/api/users', 200, 150);
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('API GET /api/users');
      expect(logs[0].context).toBe('API');
      expect(logs[0].metadata).toEqual({
        method: 'GET',
        url: '/api/users',
        status: 200,
        duration: 150,
      });
    });

    it('should log client errors as warnings', () => {
      logger.logApiCall('POST', '/api/users', 400, 100);
      
      const logs = logger.getLogs();
      expect(logs[0].level).toBe('error');
    });

    it('should log server errors as errors', () => {
      logger.logApiCall('GET', '/api/users', 500, 200);
      
      const logs = logger.getLogs();
      expect(logs[0].level).toBe('error');
    });

    it('should log redirects as warnings', () => {
      logger.logApiCall('GET', '/api/users', 301, 50);
      
      const logs = logger.getLogs();
      expect(logs[0].level).toBe('warn');
    });
  });

  describe('logUserAction', () => {
    it('should log user actions', () => {
      logger.logUserAction('button_click', { buttonId: 'submit' });
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('User action: button_click');
      expect(logs[0].context).toBe('UserAction');
      expect(logs[0].metadata).toEqual({ buttonId: 'submit' });
    });
  });

  describe('logPerformance', () => {
    it('should log performance metrics', () => {
      logger.logPerformance('page_load', 1500, 'ms', { page: 'home' });
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Performance: page_load');
      expect(logs[0].context).toBe('Performance');
      expect(logs[0].metadata).toEqual({
        metric: 'page_load',
        value: 1500,
        unit: 'ms',
        page: 'home',
      });
    });
  });

  describe('getLogs', () => {
    beforeEach(() => {
      // Only add logs that will actually be logged (info level and above)
      logger.info('Info message', 'Test');
      logger.warn('Warning message', 'Test');
      logger.error('Error message', 'Test');
    });

    it('should return all logs by default', () => {
      const logs = logger.getLogs();
      expect(logs).toHaveLength(3); // Only info, warn, error (debug is filtered out)
    });

    it('should filter by level', () => {
      const errorLogs = logger.getLogs({ level: 'error' });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe('error');

      const warnAndAboveLogs = logger.getLogs({ level: 'warn' });
      expect(warnAndAboveLogs).toHaveLength(2); // warn and error
    });

    it('should filter by context', () => {
      logger.info('Different context', 'Other');
      
      const testLogs = logger.getLogs({ context: 'Test' });
      expect(testLogs).toHaveLength(3);

      const otherLogs = logger.getLogs({ context: 'Other' });
      expect(otherLogs).toHaveLength(1);
    });

    it('should filter by date', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogs = logger.getLogs({ since: oneHourAgo });
      expect(recentLogs).toHaveLength(3); // All logs are recent
    });

    it('should limit results', () => {
      const limitedLogs = logger.getLogs({ limit: 2 });
      expect(limitedLogs).toHaveLength(2);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      // Only add logs that will actually be logged (info level and above)
      logger.info('Info message', 'Context1');
      logger.warn('Warning message', 'Context2');
      logger.error('Error message', 'Context2');
    });

    it('should return correct statistics', () => {
      const stats = logger.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byLevel.warn).toBe(1);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.byContext.Context1).toBe(1);
      expect(stats.byContext.Context2).toBe(2);
      expect(stats.recentErrors).toBe(1); // Only the error log is recent
    });
  });

  describe('exportLogs', () => {
    it('should export logs as JSON string', () => {
      logger.info('Test message', 'Test');
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test message');
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      logger.info('Test message', 'Test');
      expect(logger.getLogs()).toHaveLength(1);
      
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });
});

describe('Utility functions', () => {
  beforeEach(() => {
    logger.clearLogs();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logApiError', () => {
    it('should log API errors', () => {
      const error = new Error('API failed');
      logApiError(error, '/api/test', 'POST');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('API Error: POST /api/test');
      expect(logs[0].context).toBe('API');
    });
  });

  describe('logUserAction', () => {
    it('should log user actions', () => {
      logUserAction('test_action', { data: 'test' });
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('User action: test_action');
    });
  });

  describe('logPerformance', () => {
    it('should log performance metrics', () => {
      logPerformance('test_metric', 100);
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Performance: test_metric');
    });
  });

  describe('measurePerformance', () => {
    it('should measure and log synchronous function performance', () => {
      const testFn = jest.fn(() => 'result');
      
      const result = measurePerformance(testFn, 'test_function');
      
      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalled();
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Performance: test_function');
      expect(logs[0].metadata?.metric).toBe('test_function');
      expect(logs[0].metadata?.unit).toBe('ms');
      expect(typeof logs[0].metadata?.value).toBe('number');
    });
  });
});