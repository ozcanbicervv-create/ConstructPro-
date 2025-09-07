import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { notificationService } from '@/services/notification.service';
import { errorNotificationService, ErrorSeverity } from '@/services/error-notification.service';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export enum ErrorCodes {
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  MFA_REQUIRED = 'MFA_REQUIRED',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Business Logic Errors
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  MATERIAL_NOT_FOUND = 'MATERIAL_NOT_FOUND',
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TASK_ASSIGNMENT_FAILED = 'TASK_ASSIGNMENT_FAILED',
  MATERIAL_OUT_OF_STOCK = 'MATERIAL_OUT_OF_STOCK',
  PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  SOCKET_CONNECTION_ERROR = 'SOCKET_CONNECTION_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Generic
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

// ErrorSeverity is now imported from error-notification.service.ts

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;
  public readonly severity: ErrorSeverity;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
    details?: any,
    isOperational: boolean = true,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    this.severity = severity;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public async handleApiError(
    error: Error | AppError,
    requestId?: string,
    context?: string,
    additionalContext?: Record<string, any>
  ): Promise<ErrorResponse> {
    const isAppError = error instanceof AppError;
    
    const statusCode = isAppError ? error.statusCode : 500;
    const code = isAppError ? error.code : ErrorCodes.INTERNAL_SERVER_ERROR;
    const details = isAppError ? error.details : undefined;
    const severity = isAppError ? error.severity : ErrorSeverity.HIGH;

    // Log the error
    this.logError(error, context || 'API', { requestId, statusCode, code, ...additionalContext });

    // Process error through notification service
    await errorNotificationService.processError(error, severity, {
      requestId,
      ...additionalContext
    });

    // Return sanitized error response
    return {
      success: false,
      error: {
        code,
        message: this.getSafeErrorMessage(error, isAppError),
        statusCode,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }

  public logError(error: Error, context: string, metadata?: any): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      ...metadata
    };

    if (error instanceof AppError) {
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          logger.error('Critical error occurred', errorInfo);
          break;
        case ErrorSeverity.HIGH:
          logger.error('High severity error', errorInfo);
          break;
        case ErrorSeverity.MEDIUM:
          logger.warn('Medium severity error', errorInfo);
          break;
        case ErrorSeverity.LOW:
          logger.info('Low severity error', errorInfo);
          break;
      }
    } else {
      logger.error('Unhandled error', errorInfo);
    }
  }

  private async notifyAdmins(
    error: Error,
    severity: ErrorSeverity,
    metadata?: any
  ): Promise<void> {
    try {
      const notification = {
        type: 'SYSTEM_ERROR' as const,
        title: `${severity} Error Detected`,
        message: `Error: ${error.message}`,
        data: {
          error: error.message,
          stack: error.stack,
          severity,
          ...metadata
        },
        priority: severity === ErrorSeverity.CRITICAL ? 'HIGH' as const : 'MEDIUM' as const
      };

      // Send notification to admin users
      await notificationService.notifyAdmins(notification);
    } catch (notificationError) {
      logger.error('Failed to notify admins about error', {
        originalError: error.message,
        notificationError: notificationError instanceof Error ? notificationError.message : 'Unknown error'
      });
    }
  }

  private getSafeErrorMessage(error: Error, isAppError: boolean): string {
    if (isAppError) {
      return error.message;
    }

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      return 'An internal server error occurred';
    }

    return error.message;
  }
}

// Middleware function for Next.js API routes
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      const request = args[0] as NextRequest;
      const requestId = request.headers.get('x-request-id') || undefined;
      
      // Extract additional context from request
      const additionalContext = {
        url: request.url,
        method: request.method,
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      };
      
      const errorResponse = await errorHandler.handleApiError(
        error as Error,
        requestId,
        `${request.method} ${request.url}`,
        additionalContext
      );

      return NextResponse.json(errorResponse, {
        status: errorResponse.error.statusCode
      });
    }
  };
}

// Helper functions for creating common errors
export const createError = {
  badRequest: (message: string, details?: any) =>
    new AppError(message, 400, ErrorCodes.BAD_REQUEST, details, true, ErrorSeverity.LOW),
    
  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(message, 401, ErrorCodes.UNAUTHORIZED, undefined, true, ErrorSeverity.MEDIUM),
    
  forbidden: (message: string = 'Forbidden') =>
    new AppError(message, 403, ErrorCodes.FORBIDDEN, undefined, true, ErrorSeverity.MEDIUM),
    
  notFound: (resource: string) =>
    new AppError(`${resource} not found`, 404, ErrorCodes.NOT_FOUND, undefined, true, ErrorSeverity.LOW),
    
  validation: (message: string, details?: any) =>
    new AppError(message, 400, ErrorCodes.VALIDATION_ERROR, details, true, ErrorSeverity.LOW),
    
  duplicate: (resource: string) =>
    new AppError(`${resource} already exists`, 409, ErrorCodes.DUPLICATE_ENTRY, undefined, true, ErrorSeverity.LOW),
    
  database: (message: string, details?: any) =>
    new AppError(message, 500, ErrorCodes.DATABASE_ERROR, details, true, ErrorSeverity.HIGH),
    
  internal: (message: string, details?: any) =>
    new AppError(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR, details, false, ErrorSeverity.CRITICAL)
};

export const errorHandler = ErrorHandler.getInstance();