import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/error-handler.middleware';
import { withRequestCorrelation } from '@/middleware/correlation.middleware';
import { apiMonitoringService } from '@/services/api-monitoring.service';
import { errorNotificationService, ErrorSeverity } from '@/services/error-notification.service';
import { logger } from '@/lib/logger';
import { notificationService } from '@/services/notification.service';

// Mock dependencies
jest.mock('@/lib/logger');
jest.mock('@/services/notification.service');
jest.mock('@/lib/db');
jest.mock('@/lib/redis');

const mockLogger = logger as jest.Mocked<typeof logger>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Error Handling and Monitoring Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiMonitoringService.resetMetrics();
    // Reset error notification service state
    (errorNotificationService as any).errorHistory.clear();
    (errorNotificationService as any).alertCooldowns.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('End-to-End Error Processing', () => {
    it('should handle successful request with full monitoring', async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true, data: 'test' })
      );

      const wrappedHandler = withErrorHandler(withRequestCorrelation(mockHandler));
      
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'x-request-id': 'test-req-123',
          'user-agent': 'test-agent',
          'x-forwarded-for': '192.168.1.1'
        }
      });

      const response = await wrappedHandler(request);
      const responseData = await response.json();

      // Verify successful response
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      // Verify monitoring recorded the request
      const metrics = apiMonitoringService.getApiMetrics('GET', '/api/projects');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].totalRequests).toBe(1);
      expect(metrics[0].successfulRequests).toBe(1);
      expect(metrics[0].failedRequests).toBe(0);

      // Verify logging
      expect(mockLogger.http).toHaveBeenCalledWith(
        expect.stringContaining('Incoming GET'),
        expect.objectContaining({
          requestId: 'test-req-123'
        })
      );

      expect(mockLogger.logApiRequest).toHaveBeenCalledWith(
        'GET',
        'http://localhost:3000/api/projects',
        200,
        expect.any(Number),
        expect.objectContaining({
          requestId: 'test-req-123'
        })
      );

      // Verify response headers
      expect(response.headers.get('x-request-id')).toBe('test-req-123');
      expect(response.headers.get('x-response-time')).toMatch(/\d+ms/);
    });

    it('should handle application errors with full error processing', async () => {
      const mockHandler = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );

      const wrappedHandler = withErrorHandler(withRequestCorrelation(mockHandler));
      
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'x-request-id': 'error-req-456',
          'user-agent': 'test-agent',
          'x-forwarded-for': '192.168.1.100'
        }
      });

      mockNotificationService.notifyAdmins.mockResolvedValue();

      const response = await wrappedHandler(request);
      const responseData = await response.json();

      // Verify error response
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(responseData.error.requestId).toBe('error-req-456');

      // Verify monitoring recorded the error
      const metrics = apiMonitoringService.getApiMetrics('POST', '/api/projects');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].totalRequests).toBe(1);
      expect(metrics[0].successfulRequests).toBe(0);
      expect(metrics[0].failedRequests).toBe(1);
      expect(metrics[0].errorRate).toBe(100);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Request failed'),
        expect.objectContaining({
          requestId: 'error-req-456',
          error: 'Database connection failed'
        })
      );

      // Verify error notification processing
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async processing
      
      const errorStats = errorNotificationService.getErrorStatistics();
      expect(errorStats.totalErrors).toBeGreaterThan(0);
    });

    it('should handle multiple errors and trigger alert rules', async () => {
      const mockHandler = jest.fn().mockRejectedValue(
        Object.assign(new Error('Authentication failed'), { code: 'INVALID_CREDENTIALS' })
      );

      const wrappedHandler = withErrorHandler(withRequestCorrelation(mockHandler));
      
      mockNotificationService.notifyAdmins.mockResolvedValue();

      // Simulate multiple authentication failures
      for (let i = 0; i < 6; i++) {
        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'x-request-id': `auth-fail-${i}`,
            'x-forwarded-for': '192.168.1.200'
          }
        });

        await wrappedHandler(request);
      }

      // Wait for async error processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify monitoring recorded all failures
      const metrics = apiMonitoringService.getApiMetrics('POST', '/api/auth/login');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].totalRequests).toBe(6);
      expect(metrics[0].failedRequests).toBe(6);
      expect(metrics[0].errorRate).toBe(100);

      // Verify alert was triggered (authentication failures rule should trigger after 5 failures)
      expect(mockNotificationService.notifyAdmins).toHaveBeenCalled();

      const errorStats = errorNotificationService.getErrorStatistics();
      expect(errorStats.errorsByCode['INVALID_CREDENTIALS']).toBe(6);
    });

    it('should handle slow requests and log warnings', async () => {
      const mockHandler = jest.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(NextResponse.json({ success: true })), 2500)
        )
      );

      const wrappedHandler = withErrorHandler(withRequestCorrelation(mockHandler));
      
      const request = new NextRequest('http://localhost:3000/api/slow-endpoint', {
        method: 'GET',
        headers: {
          'x-request-id': 'slow-req-789'
        }
      });

      const response = await wrappedHandler(request);

      // Verify successful response
      expect(response.status).toBe(200);

      // Verify slow request was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Slow API request detected',
        expect.objectContaining({
          method: 'GET',
          endpoint: '/api/slow-endpoint',
          responseTime: expect.any(Number),
          statusCode: 200
        })
      );

      // Verify monitoring recorded the slow request
      const metrics = apiMonitoringService.getApiMetrics('GET', '/api/slow-endpoint');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].averageResponseTime).toBeGreaterThan(2000);
    });
  });

  describe('System Health Monitoring', () => {
    it('should provide comprehensive health status', async () => {
      // Record some test requests
      apiMonitoringService.recordRequest('GET', '/api/projects', 200, 100);
      apiMonitoringService.recordRequest('POST', '/api/tasks', 201, 150);
      apiMonitoringService.recordRequest('GET', '/api/materials', 500, 200, 'DATABASE_ERROR');

      const healthStatus = await apiMonitoringService.getHealthStatus();
      const systemMetrics = apiMonitoringService.getSystemMetrics();

      // Verify health status structure
      expect(healthStatus).toHaveProperty('status');
      expect(healthStatus).toHaveProperty('checks');
      expect(healthStatus).toHaveProperty('uptime');
      expect(healthStatus).toHaveProperty('version');
      expect(healthStatus).toHaveProperty('environment');

      // Verify system metrics structure
      expect(systemMetrics).toHaveProperty('timestamp');
      expect(systemMetrics).toHaveProperty('requests');
      expect(systemMetrics).toHaveProperty('performance');
      expect(systemMetrics).toHaveProperty('errors');
      expect(systemMetrics).toHaveProperty('resources');

      // Verify metrics values
      expect(systemMetrics.requests.total).toBe(3);
      expect(systemMetrics.requests.successful).toBe(2);
      expect(systemMetrics.requests.failed).toBe(1);
      expect(systemMetrics.errors.rate).toBeCloseTo(33.33, 1);
    });

    it('should track performance trends', () => {
      // Record requests with varying response times
      const endpoints = ['/api/fast', '/api/medium', '/api/slow'];
      const responseTimes = [50, 200, 800];

      endpoints.forEach((endpoint, index) => {
        for (let i = 0; i < 10; i++) {
          apiMonitoringService.recordRequest('GET', endpoint, 200, responseTimes[index] + (i * 10));
        }
      });

      const topEndpoints = apiMonitoringService.getTopEndpoints(3);
      const slowestEndpoints = apiMonitoringService.getSlowestEndpoints(3);

      // All endpoints should have 10 requests
      expect(topEndpoints.every(e => e.totalRequests === 10)).toBe(true);

      // Slowest should be in correct order
      expect(slowestEndpoints[0].endpoint).toBe('/api/slow');
      expect(slowestEndpoints[1].endpoint).toBe('/api/medium');
      expect(slowestEndpoints[2].endpoint).toBe('/api/fast');
    });
  });

  describe('Error Alert System', () => {
    it('should manage alert rules dynamically', () => {
      // Add custom alert rule
      const customRule = {
        name: 'Custom Test Rule',
        condition: {
          errorCode: 'CUSTOM_ERROR',
          severity: 'HIGH' as any
        },
        actions: {
          notify: true,
          escalate: false,
          autoResolve: true
        },
        recipients: ['admin'],
        enabled: true
      };

      const ruleId = errorNotificationService.addAlertRule(customRule);
      expect(ruleId).toBeDefined();

      // Verify rule was added
      const rules = errorNotificationService.getAlertRules();
      const addedRule = rules.find(r => r.id === ruleId);
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe('Custom Test Rule');

      // Update rule
      const updated = errorNotificationService.updateAlertRule(ruleId, {
        enabled: false
      });
      expect(updated).toBe(true);

      // Verify update
      const updatedRules = errorNotificationService.getAlertRules();
      const updatedRule = updatedRules.find(r => r.id === ruleId);
      expect(updatedRule?.enabled).toBe(false);

      // Delete rule
      const deleted = errorNotificationService.deleteAlertRule(ruleId);
      expect(deleted).toBe(true);

      // Verify deletion
      const finalRules = errorNotificationService.getAlertRules();
      expect(finalRules.find(r => r.id === ruleId)).toBeUndefined();
    });

    it('should provide comprehensive error statistics', async () => {
      // Generate various types of errors
      const errorTypes = [
        { code: 'DATABASE_ERROR', count: 5 },
        { code: 'VALIDATION_ERROR', count: 3 },
        { code: 'AUTH_ERROR', count: 2 },
        { code: 'RATE_LIMIT_EXCEEDED', count: 1 }
      ];

      for (const errorType of errorTypes) {
        for (let i = 0; i < errorType.count; i++) {
          const error = new Error(`Test ${errorType.code}`);
          (error as any).code = errorType.code;
          
          await errorNotificationService.processError(
            error,
            'HIGH' as any,
            { requestId: `req_${errorType.code}_${i}` }
          );
        }
      }

      const stats = errorNotificationService.getErrorStatistics();

      expect(stats.totalErrors).toBe(11);
      expect(stats.errorsByCode['DATABASE_ERROR']).toBe(5);
      expect(stats.errorsByCode['VALIDATION_ERROR']).toBe(3);
      expect(stats.errorsByCode['AUTH_ERROR']).toBe(2);
      expect(stats.errorsByCode['RATE_LIMIT_EXCEEDED']).toBe(1);
      expect(stats.recentErrors).toHaveLength(11);
    });
  });

  describe('Performance Impact', () => {
    it('should have minimal performance impact on successful requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const wrappedHandler = withErrorHandler(withRequestCorrelation(mockHandler));
      
      const startTime = Date.now();
      
      // Process multiple requests
      const requests = Array.from({ length: 100 }, (_, i) => 
        new NextRequest(`http://localhost:3000/api/test`, {
          method: 'GET',
          headers: {
            'x-request-id': `perf-test-${i}`
          }
        })
      );

      await Promise.all(requests.map(req => wrappedHandler(req)));
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 100;

      // Should process requests quickly (less than 10ms per request on average)
      expect(averageTime).toBeLessThan(10);

      // Verify all requests were recorded
      const metrics = apiMonitoringService.getApiMetrics('GET', '/api/test');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].totalRequests).toBe(100);
      expect(metrics[0].successfulRequests).toBe(100);
    });

    it('should handle high error rates without degrading performance', async () => {
      const mockHandler = jest.fn().mockRejectedValue(
        new Error('Simulated error')
      );

      const wrappedHandler = withErrorHandler(withRequestCorrelation(mockHandler));
      
      mockNotificationService.notifyAdmins.mockResolvedValue();
      
      const startTime = Date.now();
      
      // Process multiple error requests
      const requests = Array.from({ length: 50 }, (_, i) => 
        new NextRequest(`http://localhost:3000/api/error-test`, {
          method: 'POST',
          headers: {
            'x-request-id': `error-perf-${i}`
          }
        })
      );

      await Promise.all(requests.map(req => wrappedHandler(req)));
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 50;

      // Should still process error requests reasonably quickly
      expect(averageTime).toBeLessThan(50);

      // Verify all errors were recorded
      const metrics = apiMonitoringService.getApiMetrics('POST', '/api/error-test');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].totalRequests).toBe(50);
      expect(metrics[0].failedRequests).toBe(50);
      expect(metrics[0].errorRate).toBe(100);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with continuous monitoring', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate continuous API usage
      for (let i = 0; i < 1000; i++) {
        apiMonitoringService.recordRequest(
          'GET', 
          `/api/endpoint-${i % 10}`, 
          200, 
          Math.random() * 1000
        );
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB for 1000 requests)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});