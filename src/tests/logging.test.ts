import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createLogger } from 'winston';

import { logger, AppLogger, generateRequestId, LogLevel } from '@/lib/logger';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

jest.mock('winston-daily-rotate-file', () => {
  return jest.fn();
});

const mockCreateLogger = createLogger as jest.MockedFunction<typeof createLogger>;

describe('Logging System', () => {
  let mockWinstonLogger: any;

  beforeEach(() => {
    mockWinstonLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      http: jest.fn(),
      debug: jest.fn(),
      log: jest.fn()
    };

    mockCreateLogger.mockReturnValue(mockWinstonLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AppLogger', () => {
    it('should be a singleton', () => {
      const logger1 = AppLogger.getInstance();
      const logger2 = AppLogger.getInstance();
      
      expect(logger1).toBe(logger2);
    });

    it('should log error messages with context', () => {
      const testLogger = AppLogger.getInstance();
      const context = {
        requestId: 'req_123',
        userId: 'user_456',
        action: 'create_project'
      };

      testLogger.error('Test error message', context);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        'Test error message',
        context
      );
    });

    it('should log warning messages with context', () => {
      const testLogger = AppLogger.getInstance();
      const context = {
        requestId: 'req_789',
        resource: 'project'
      };

      testLogger.warn('Test warning message', context);

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
        'Test warning message',
        context
      );
    });

    it('should log info messages with context', () => {
      const testLogger = AppLogger.getInstance();
      const context = {
        requestId: 'req_abc',
        userId: 'user_def'
      };

      testLogger.info('Test info message', context);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test info message',
        context
      );
    });

    it('should log HTTP requests', () => {
      const testLogger = AppLogger.getInstance();
      const context = {
        requestId: 'req_http',
        userId: 'user_123',
        ip: '192.168.1.1'
      };

      testLogger.http('Test HTTP message', context);

      expect(mockWinstonLogger.http).toHaveBeenCalledWith(
        'Test HTTP message',
        context
      );
    });

    it('should log debug messages', () => {
      const testLogger = AppLogger.getInstance();
      const context = {
        requestId: 'req_debug',
        operation: 'database_query'
      };

      testLogger.debug('Test debug message', context);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
        'Test debug message',
        context
      );
    });
  });

  describe('Specialized logging methods', () => {
    let testLogger: AppLogger;

    beforeEach(() => {
      testLogger = AppLogger.getInstance();
    });

    it('should log API requests with proper format', () => {
      const context = {
        requestId: 'req_api',
        userId: 'user_123'
      };

      testLogger.logApiRequest('POST', '/api/projects', 201, 150, context);

      expect(mockWinstonLogger.http).toHaveBeenCalledWith(
        'POST /api/projects 201 - 150ms',
        {
          method: 'POST',
          url: '/api/projects',
          statusCode: 201,
          duration: 150,
          ...context
        }
      );
    });

    it('should log successful authentication', () => {
      const context = {
        requestId: 'req_auth',
        ip: '192.168.1.1'
      };

      testLogger.logAuthentication('login', 'user_123', true, context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'info',
        'Authentication login successful',
        {
          action: 'auth_login',
          userId: 'user_123',
          success: true,
          ...context
        }
      );
    });

    it('should log failed authentication', () => {
      const context = {
        requestId: 'req_auth_fail',
        ip: '192.168.1.1'
      };

      testLogger.logAuthentication('login', 'user_123', false, context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'warn',
        'Authentication login failed',
        {
          action: 'auth_login',
          userId: 'user_123',
          success: false,
          ...context
        }
      );
    });

    it('should log database operations', () => {
      const context = {
        requestId: 'req_db',
        userId: 'user_123'
      };

      testLogger.logDatabaseOperation('SELECT', 'projects', 25, context);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
        'Database SELECT on projects - 25ms',
        {
          action: 'db_SELECT',
          table: 'projects',
          duration: 25,
          ...context
        }
      );
    });

    it('should log database operations without duration', () => {
      const context = {
        requestId: 'req_db_no_duration'
      };

      testLogger.logDatabaseOperation('INSERT', 'users', undefined, context);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
        'Database INSERT on users',
        {
          action: 'db_INSERT',
          table: 'users',
          duration: undefined,
          ...context
        }
      );
    });

    it('should log business events', () => {
      const context = {
        requestId: 'req_business',
        userId: 'user_123',
        projectId: 'proj_456'
      };

      testLogger.logBusinessEvent('project_created', 'project', context);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Business event: project_created on project',
        {
          action: 'project_created',
          resource: 'project',
          ...context
        }
      );
    });

    it('should log security events with appropriate levels', () => {
      const context = {
        requestId: 'req_security',
        userId: 'user_123',
        ip: '192.168.1.1'
      };

      // Critical security event
      testLogger.logSecurityEvent('unauthorized_access_attempt', 'critical', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'error',
        'Security event: unauthorized_access_attempt',
        {
          action: 'security_unauthorized_access_attempt',
          severity: 'critical',
          ...context
        }
      );

      // Low severity security event
      testLogger.logSecurityEvent('password_changed', 'low', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'warn',
        'Security event: password_changed',
        {
          action: 'security_password_changed',
          severity: 'low',
          ...context
        }
      );
    });

    it('should log performance metrics', () => {
      const context = {
        requestId: 'req_perf',
        operation: 'database_query'
      };

      testLogger.logPerformanceMetric('query_time', 150, 'ms', context);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Performance metric: query_time = 150ms',
        {
          action: 'performance_metric',
          metric: 'query_time',
          value: 150,
          unit: 'ms',
          ...context
        }
      );
    });
  });

  describe('Request ID generation', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate request IDs with correct format', () => {
      const requestId = generateRequestId();
      
      expect(requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(requestId.startsWith('req_')).toBe(true);
    });
  });

  describe('Logger configuration', () => {
    it('should create logger with correct configuration in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Create new instance to test configuration
      const testLogger = new AppLogger();

      expect(mockCreateLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          exitOnError: false,
          silent: false
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should create logger with correct configuration in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Create new instance to test configuration
      const testLogger = new AppLogger();

      expect(mockCreateLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          exitOnError: false,
          silent: false
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should create logger with silent mode in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      // Create new instance to test configuration
      const testLogger = new AppLogger();

      expect(mockCreateLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          silent: true
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should respect LOG_LEVEL environment variable', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'warn';

      // Create new instance to test configuration
      const testLogger = new AppLogger();

      expect(mockCreateLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn'
        })
      );

      process.env.LOG_LEVEL = originalLogLevel;
    });
  });

  describe('Global logger instance', () => {
    it('should export a global logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(AppLogger);
    });

    it('should use the same instance across imports', () => {
      const logger1 = logger;
      const logger2 = AppLogger.getInstance();
      
      expect(logger1).toBe(logger2);
    });
  });
});