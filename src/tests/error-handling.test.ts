import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock NextResponse.json
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map()
    }))
  }
}));
import { logger } from '@/lib/logger';
import { 
  ErrorHandler, 
  AppError, 
  ErrorCodes, 
  withErrorHandler,
  createError
} from '@/middleware/error-handler.middleware';
import { ErrorSeverity } from '@/services/error-notification.service';
import { notificationService } from '@/services/notification.service';

// Mock dependencies
jest.mock('@/lib/logger');
jest.mock('@/services/notification.service');

const mockLogger = logger as jest.Mocked<typeof logger>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Error Handling System', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(true);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should create AppError with custom values', () => {
      const error = new AppError(
        'Custom error',
        400,
        ErrorCodes.VALIDATION_ERROR,
        { field: 'email' },
        true,
        ErrorSeverity.LOW
      );
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.details).toEqual({ field: 'email' });
      expect(error.isOperational).toBe(true);
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('ErrorHandler', () => {
    it('should handle AppError correctly', async () => {
      const appError = new AppError(
        'Test app error',
        400,
        ErrorCodes.VALIDATION_ERROR,
        { field: 'name' },
        true,
        ErrorSeverity.LOW
      );

      const result = await errorHandler.handleApiError(appError, 'req_123', 'test context');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(result.error.message).toBe('Test app error');
      expect(result.error.statusCode).toBe(400);
      expect(result.error.requestId).toBe('req_123');
      expect(result.error.timestamp).toBeDefined();
    });

    it('should handle generic Error correctly', async () => {
      const genericError = new Error('Generic error');

      const result = await errorHandler.handleApiError(genericError, 'req_456');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(result.error.statusCode).toBe(500);
      expect(result.error.requestId).toBe('req_456');
    });

    it('should log errors with correct severity', () => {
      const criticalError = new AppError(
        'Critical error',
        500,
        ErrorCodes.DATABASE_ERROR,
        undefined,
        true,
        ErrorSeverity.CRITICAL
      );

      errorHandler.handleApiError(criticalError, 'req_789');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Critical error occurred',
        expect.objectContaining({
          message: 'Critical error',
          context: 'API',
          requestId: 'req_789'
        })
      );
    });

    it('should notify admins for critical errors', async () => {
      const criticalError = new AppError(
        'Critical system failure',
        500,
        ErrorCodes.DATABASE_ERROR,
        undefined,
        true,
        ErrorSeverity.CRITICAL
      );

      mockNotificationService.notifyAdmins.mockResolvedValue();

      await errorHandler.handleApiError(criticalError, 'req_critical');

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockNotificationService.notifyAdmins).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYSTEM_ERROR',
          title: 'CRITICAL Error Detected',
          priority: 'HIGH'
        })
      );
    });

    it('should sanitize error messages in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const genericError = new Error('Internal database connection failed');
      const result = await errorHandler.handleApiError(genericError);

      expect(result.error.message).toBe('An internal server error occurred');

      process.env.NODE_ENV = originalEnv;
    });

    it('should expose error details in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const appError = new AppError(
        'Validation failed',
        400,
        ErrorCodes.VALIDATION_ERROR,
        { field: 'email', reason: 'invalid format' }
      );

      const result = await errorHandler.handleApiError(appError);

      expect(result.error.details).toEqual({
        field: 'email',
        reason: 'invalid format'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('withErrorHandler middleware', () => {
    it('should catch and handle errors in wrapped handler', async () => {
      const mockHandler = jest.fn().mockRejectedValue(
        new AppError('Handler error', 400, ErrorCodes.VALIDATION_ERROR)
      );

      const wrappedHandler = withErrorHandler(mockHandler);
      
      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/test',
        headers: new Map([['x-request-id', 'test-req-123']])
      } as any;

      const response = await wrappedHandler(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(responseData.error.requestId).toBe('test-req-123');
    });

    it('should pass through successful responses', async () => {
      const successResponse = NextResponse.json({ success: true, data: 'test' });
      const mockHandler = jest.fn().mockResolvedValue(successResponse);

      const wrappedHandler = withErrorHandler(mockHandler);
      
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/test',
        headers: new Map()
      } as any;

      const response = await wrappedHandler(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBe('test');
    });
  });

  describe('Error creation helpers', () => {
    it('should create bad request error', () => {
      const error = createError.badRequest('Invalid input', { field: 'email' });
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCodes.BAD_REQUEST);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });

    it('should create unauthorized error', () => {
      const error = createError.unauthorized();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe(ErrorCodes.UNAUTHORIZED);
      expect(error.message).toBe('Unauthorized');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should create forbidden error', () => {
      const error = createError.forbidden('Access denied');
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe(ErrorCodes.FORBIDDEN);
      expect(error.message).toBe('Access denied');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should create not found error', () => {
      const error = createError.notFound('Project');
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe(ErrorCodes.NOT_FOUND);
      expect(error.message).toBe('Project not found');
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });

    it('should create validation error', () => {
      const error = createError.validation('Validation failed', { 
        errors: [{ field: 'name', message: 'Required' }] 
      });
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual({ 
        errors: [{ field: 'name', message: 'Required' }] 
      });
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });

    it('should create duplicate error', () => {
      const error = createError.duplicate('User');
      
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
      expect(error.message).toBe('User already exists');
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });

    it('should create database error', () => {
      const error = createError.database('Connection failed', { 
        connectionString: 'postgresql://...' 
      });
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(error.message).toBe('Connection failed');
      expect(error.details).toEqual({ 
        connectionString: 'postgresql://...' 
      });
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should create internal error', () => {
      const error = createError.internal('System failure');
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(error.message).toBe('System failure');
      expect(error.isOperational).toBe(false);
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('Error notification handling', () => {
    it('should handle notification service failures gracefully', async () => {
      const criticalError = new AppError(
        'Critical error',
        500,
        ErrorCodes.DATABASE_ERROR,
        undefined,
        true,
        ErrorSeverity.CRITICAL
      );

      mockNotificationService.notifyAdmins.mockRejectedValue(
        new Error('Notification service down')
      );

      // Should not throw even if notification fails
      await expect(
        errorHandler.handleApiError(criticalError, 'req_notification_fail')
      ).resolves.not.toThrow();

      // Should log the notification failure
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to notify admins about error',
        expect.objectContaining({
          originalError: 'Critical error',
          notificationError: 'Notification service down'
        })
      );
    });
  });
});