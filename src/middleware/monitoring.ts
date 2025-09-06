/**
 * Monitoring Middleware for ConstructPro
 * Tracks request metrics and performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { resourceMonitor } from '@/lib/monitoring';

export interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

class RequestTracker {
  private static instance: RequestTracker;
  private requests: RequestMetrics[] = [];
  private errorCount = 0;
  private totalRequests = 0;

  static getInstance(): RequestTracker {
    if (!RequestTracker.instance) {
      RequestTracker.instance = new RequestTracker();
    }
    return RequestTracker.instance;
  }

  trackRequest(metrics: RequestMetrics): void {
    this.requests.push(metrics);
    this.totalRequests++;

    // Keep only last 1000 requests
    if (this.requests.length > 1000) {
      this.requests.shift();
    }

    // Track errors
    if (metrics.statusCode >= 400) {
      this.errorCount++;
    }

    // Update resource monitor with response time
    resourceMonitor.recordResponseTime(metrics.responseTime);

    // Record error if status code indicates error
    if (metrics.statusCode >= 500) {
      resourceMonitor.recordError();
    }
  }

  getStats(): {
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    averageResponseTime: number;
    requestsPerMinute: number;
  } {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = this.requests.filter(r => r.timestamp > oneMinuteAgo);
    
    const averageResponseTime = this.requests.length > 0
      ? this.requests.reduce((sum, r) => sum + r.responseTime, 0) / this.requests.length
      : 0;

    return {
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
      errorRate: this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0,
      averageResponseTime: Math.round(averageResponseTime),
      requestsPerMinute: recentRequests.length,
    };
  }

  getRecentRequests(limit: number = 50): RequestMetrics[] {
    return this.requests.slice(-limit);
  }
}

export const requestTracker = RequestTracker.getInstance();

/**
 * Monitoring middleware function
 */
export function withMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    let response: NextResponse;
    let statusCode = 200;

    try {
      response = await handler(req);
      statusCode = response.status;
      return response;
    } catch (error) {
      statusCode = 500;
      console.error('Request handler error:', error);
      
      // Return error response
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return response;
    } finally {
      const responseTime = Date.now() - startTime;
      
      // Track request metrics
      const metrics: RequestMetrics = {
        method: req.method,
        url: req.url,
        statusCode,
        responseTime,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        timestamp: new Date(),
      };

      requestTracker.trackRequest(metrics);

      // Add monitoring headers to response
      if (response) {
        response.headers.set('X-Response-Time', `${responseTime}ms`);
        response.headers.set('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      }
    }
  };
}

/**
 * Performance monitoring decorator for API routes
 */
export function monitorPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    
    try {
      const result = await method.apply(this, args);
      const responseTime = Date.now() - startTime;
      
      // Log slow requests
      if (responseTime > 1000) {
        console.warn(`Slow request detected: ${propertyName} took ${responseTime}ms`);
      }
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Error in ${propertyName} after ${responseTime}ms:`, error);
      throw error;
    }
  };

  return descriptor;
}

/**
 * Express-style middleware for custom server
 */
export function createMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const responseTime = Date.now() - startTime;
      
      const metrics: RequestMetrics = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
        timestamp: new Date(),
      };

      requestTracker.trackRequest(metrics);

      // Add response headers
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

      originalEnd.apply(this, args);
    };

    next();
  };
}

// Auto-start request tracking
console.log('📈 Request tracking initialized for ConstructPro');