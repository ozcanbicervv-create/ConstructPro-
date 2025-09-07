import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId, LogContext } from '@/lib/logger';
import { apiMonitoringService } from '@/services/api-monitoring.service';

export interface RequestContext extends LogContext {
  requestId: string;
  startTime: number;
  method: string;
  url: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

// Store request context using AsyncLocalStorage for Node.js
import { AsyncLocalStorage } from 'async_hooks';

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function withRequestCorrelation<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    
    // Generate or extract request ID
    const requestId = request.headers.get('x-request-id') || generateRequestId();
    
    // Extract request information
    const method = request.method;
    const url = request.url;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create request context
    const context: RequestContext = {
      requestId,
      startTime,
      method,
      url,
      ip,
      userAgent
    };

    // Log incoming request
    logger.http(`Incoming ${method} ${url}`, context);

    try {
      // Run handler with request context
      const response = await requestContextStorage.run(context, async () => {
        return await handler(...args);
      });

      // Calculate duration
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Update context with response info
      const responseContext = {
        ...context,
        statusCode,
        duration
      };

      // Log completed request
      logger.logApiRequest(method, url, statusCode, duration, responseContext);

      // Record metrics
      const endpoint = new URL(url).pathname;
      apiMonitoringService.recordRequest(method, endpoint, statusCode, duration);

      // Add correlation headers to response
      const headers = new Headers(response.headers);
      headers.set('x-request-id', requestId);
      headers.set('x-response-time', `${duration}ms`);

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorContext = {
        ...context,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      logger.error(`Request failed: ${method} ${url}`, errorContext);
      
      // Record error metrics
      const endpoint = new URL(url).pathname;
      const errorCode = (error as any).code || 'UNKNOWN_ERROR';
      apiMonitoringService.recordRequest(method, endpoint, 500, duration, errorCode);
      
      throw error;
    }
  };
}

// Helper function to get current request context
export function getCurrentRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

// Helper function to add user ID to current context
export function setUserId(userId: string): void {
  const context = getCurrentRequestContext();
  if (context) {
    context.userId = userId;
  }
}

// Helper function to add additional context data
export function addContextData(data: Partial<LogContext>): void {
  const context = getCurrentRequestContext();
  if (context) {
    Object.assign(context, data);
  }
}

// Middleware for extracting user information from JWT
export function withUserContext<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return withRequestCorrelation(async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    
    try {
      // Extract user ID from Authorization header or session
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Here you would decode the JWT to get user ID
        // For now, we'll just log that we have a token
        const context = getCurrentRequestContext();
        if (context) {
          context.hasAuth = true;
        }
      }

      // Check for session cookie
      const sessionCookie = request.cookies.get('session');
      if (sessionCookie) {
        const context = getCurrentRequestContext();
        if (context) {
          context.hasSession = true;
        }
      }

    } catch (error) {
      logger.warn('Failed to extract user context', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: getCurrentRequestContext()?.requestId
      });
    }

    return await handler(...args);
  });
}

// Performance monitoring middleware
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  operationName?: string
) {
  return withRequestCorrelation(async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    
    const operation = operationName || `${request.method} ${new URL(request.url).pathname}`;
    
    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      
      // Log performance metrics
      logger.logPerformanceMetric('response_time', duration, 'ms', {
        operation,
        statusCode: response.status,
        requestId: getCurrentRequestContext()?.requestId
      });

      // Log slow requests
      if (duration > 1000) {
        logger.warn(`Slow request detected: ${operation}`, {
          duration,
          operation,
          statusCode: response.status,
          requestId: getCurrentRequestContext()?.requestId
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`Operation failed: ${operation}`, {
        duration,
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: getCurrentRequestContext()?.requestId
      });
      
      throw error;
    }
  });
}