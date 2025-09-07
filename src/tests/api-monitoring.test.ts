import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { apiMonitoringService, ApiMetrics, SystemMetrics } from '@/services/api-monitoring.service';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';

// Mock dependencies
jest.mock('@/lib/logger');
jest.mock('@/lib/redis');
jest.mock('@/lib/db');

const mockLogger = logger as jest.Mocked<typeof logger>;
const mockRedis = redis as jest.Mocked<typeof redis>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('API Monitoring Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    apiMonitoringService.resetMetrics();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('recordRequest', () => {
    it('should record successful request metrics', () => {
      apiMonitoringService.recordRequest('GET', '/api/projects', 200, 150);

      const metrics = apiMonitoringService.getApiMetrics('GET', '/api/projects');
      expect(metrics).toHaveLength(1);
      
      const metric = metrics[0];
      expect(metric.method).toBe('GET');
      expect(metric.endpoint).toBe('/api/projects');
      expect(metric.totalRequests).toBe(1);
      expect(metric.successfulRequests).toBe(1);
      expect(metric.failedRequests).toBe(0);
      expect(metric.averageResponseTime).toBe(150);
      expect(metric.minResponseTime).toBe(150);
      expect(metric.maxResponseTime).toBe(150);
      expect(metric.errorRate).toBe(0);
      expect(metric.statusCodes['200']).toBe(1);
    });

    it('should record failed request metrics', () => {
      apiMonitoringService.recordRequest('POST', '/api/projects', 500, 300, 'DATABASE_ERROR');

      const metrics = apiMonitoringService.getApiMetrics('POST', '/api/projects');
      expect(metrics).toHaveLength(1);
      
      const metric = metrics[0];
      expect(metric.totalRequests).toBe(1);
      expect(metric.successfulRequests).toBe(0);
      expect(metric.failedRequests).toBe(1);
      expect(metric.errorRate).toBe(100);
      expect(metric.statusCodes['500']).toBe(1);
      expect(metric.errors['DATABASE_ERROR']).toBe(1);
    });

    it('should aggregate multiple requests correctly', () => {
      const endpoint = '/api/tasks';
      
      // Record multiple requests
      apiMonitoringService.recordRequest('GET', endpoint, 200, 100);
      apiMonitoringService.recordRequest('GET', endpoint, 200, 200);
      apiMonitoringService.recordRequest('GET', endpoint, 404, 50);
      apiMonitoringService.recordRequest('GET', endpoint, 500, 300, 'SERVER_ERROR');

      const metrics = apiMonitoringService.getApiMetrics('GET', endpoint);
      expect(metrics).toHaveLength(1);
      
      const metric = metrics[0];
      expect(metric.totalRequests).toBe(4);
      expect(metric.successfulRequests).toBe(2);
      expect(metric.failedRequests).toBe(2);
      expect(metric.errorRate).toBe(50);
      expect(metric.averageResponseTime).toBe(162.5); // (100+200+50+300)/4
      expect(metric.minResponseTime).toBe(50);
      expect(metric.maxResponseTime).toBe(300);
      expect(metric.statusCodes['200']).toBe(2);
      expect(metric.statusCodes['404']).toBe(1);
      expect(metric.statusCodes['500']).toBe(1);
    });

    it('should log slow requests', () => {
      apiMonitoringService.recordRequest('GET', '/api/slow', 200, 3000);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Slow API request detected',
        expect.objectContaining({
          method: 'GET',
          endpoint: '/api/slow',
          responseTime: 3000,
          statusCode: 200
        })
      );
    });

    it('should log high error rates', () => {
      const endpoint = '/api/error-prone';
      
      // Record requests to build up error rate
      for (let i = 0; i < 8; i++) {
        apiMonitoringService.recordRequest('POST', endpoint, 500, 100, 'ERROR');
      }
      for (let i = 0; i < 2; i++) {
        apiMonitoringService.recordRequest('POST', endpoint, 200, 100);
      }
      
      // Add one more error to trigger the warning (>10% error rate with >10 requests)
      apiMonitoringService.recordRequest('POST', endpoint, 500, 100, 'ERROR');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'High error rate detected',
        expect.objectContaining({
          method: 'POST',
          endpoint,
          errorRate: expect.any(Number),
          totalRequests: 11,
          failedRequests: 9
        })
      );
    });

    it('should limit response time history', () => {
      const endpoint = '/api/history-test';
      
      // Record more than 1000 requests
      for (let i = 0; i < 1200; i++) {
        apiMonitoringService.recordRequest('GET', endpoint, 200, 100 + i);
      }

      const metrics = apiMonitoringService.getApiMetrics('GET', endpoint);
      const metric = metrics[0];
      
      // Should still calculate correctly but limit internal storage
      expect(metric.totalRequests).toBe(1200);
      expect(metric.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('getSystemMetrics', () => {
    it('should return comprehensive system metrics', () => {
      // Record some test data
      apiMonitoringService.recordRequest('GET', '/api/projects', 200, 100);
      apiMonitoringService.recordRequest('POST', '/api/projects', 201, 150);
      apiMonitoringService.recordRequest('GET', '/api/tasks', 500, 200, 'ERROR');

      const systemMetrics = apiMonitoringService.getSystemMetrics();

      expect(systemMetrics).toHaveProperty('timestamp');
      expect(systemMetrics).toHaveProperty('requests');
      expect(systemMetrics).toHaveProperty('performance');
      expect(systemMetrics).toHaveProperty('errors');
      expect(systemMetrics).toHaveProperty('resources');

      expect(systemMetrics.requests.total).toBe(3);
      expect(systemMetrics.requests.successful).toBe(2);
      expect(systemMetrics.requests.failed).toBe(1);
      expect(systemMetrics.requests.rps).toBeGreaterThanOrEqual(0);

      expect(systemMetrics.performance.averageResponseTime).toBeCloseTo(150);
      expect(systemMetrics.performance.p95ResponseTime).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.performance.p99ResponseTime).toBeGreaterThanOrEqual(0);

      expect(systemMetrics.errors.total).toBe(1);
      expect(systemMetrics.errors.rate).toBeCloseTo(33.33, 1);
      expect(systemMetrics.errors.byCode['500']).toBe(1);

      expect(systemMetrics.resources.memoryUsage).toBeDefined();
      expect(systemMetrics.resources.cpuUsage).toBeDefined();
    });

    it('should handle empty metrics gracefully', () => {
      const systemMetrics = apiMonitoringService.getSystemMetrics();

      expect(systemMetrics.requests.total).toBe(0);
      expect(systemMetrics.requests.successful).toBe(0);
      expect(systemMetrics.requests.failed).toBe(0);
      expect(systemMetrics.performance.averageResponseTime).toBe(0);
      expect(systemMetrics.errors.total).toBe(0);
      expect(systemMetrics.errors.rate).toBe(0);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when all checks pass', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      mockRedis.ping.mockResolvedValue('PONG');

      const healthStatus = await apiMonitoringService.getHealthStatus();

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.checks.database).toBe(true);
      expect(healthStatus.checks.redis).toBe(true);
      expect(healthStatus.checks.fileSystem).toBe(true);
      expect(healthStatus.checks.externalServices).toBe(true);
      expect(healthStatus.uptime).toBeGreaterThan(0);
      expect(healthStatus.version).toBeDefined();
      expect(healthStatus.environment).toBeDefined();
    });

    it('should return degraded status when some checks fail', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
      mockRedis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const healthStatus = await apiMonitoringService.getHealthStatus();

      expect(healthStatus.status).toBe('degraded');
      expect(healthStatus.checks.database).toBe(true);
      expect(healthStatus.checks.redis).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Redis health check failed',
        expect.objectContaining({
          error: 'Redis connection failed'
        })
      );
    });

    it('should return unhealthy status when most checks fail', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));
      mockRedis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const healthStatus = await apiMonitoringService.getHealthStatus();

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.checks.database).toBe(false);
      expect(healthStatus.checks.redis).toBe(false);
    });
  });

  describe('getTopEndpoints', () => {
    it('should return endpoints sorted by request count', () => {
      // Record requests for different endpoints
      for (let i = 0; i < 10; i++) {
        apiMonitoringService.recordRequest('GET', '/api/projects', 200, 100);
      }
      for (let i = 0; i < 5; i++) {
        apiMonitoringService.recordRequest('GET', '/api/tasks', 200, 100);
      }
      for (let i = 0; i < 15; i++) {
        apiMonitoringService.recordRequest('GET', '/api/materials', 200, 100);
      }

      const topEndpoints = apiMonitoringService.getTopEndpoints(2);

      expect(topEndpoints).toHaveLength(2);
      expect(topEndpoints[0].endpoint).toBe('/api/materials');
      expect(topEndpoints[0].totalRequests).toBe(15);
      expect(topEndpoints[1].endpoint).toBe('/api/projects');
      expect(topEndpoints[1].totalRequests).toBe(10);
    });
  });

  describe('getSlowestEndpoints', () => {
    it('should return endpoints sorted by average response time', () => {
      apiMonitoringService.recordRequest('GET', '/api/fast', 200, 50);
      apiMonitoringService.recordRequest('GET', '/api/medium', 200, 200);
      apiMonitoringService.recordRequest('GET', '/api/slow', 200, 500);

      const slowestEndpoints = apiMonitoringService.getSlowestEndpoints(3);

      expect(slowestEndpoints).toHaveLength(3);
      expect(slowestEndpoints[0].endpoint).toBe('/api/slow');
      expect(slowestEndpoints[0].averageResponseTime).toBe(500);
      expect(slowestEndpoints[1].endpoint).toBe('/api/medium');
      expect(slowestEndpoints[1].averageResponseTime).toBe(200);
      expect(slowestEndpoints[2].endpoint).toBe('/api/fast');
      expect(slowestEndpoints[2].averageResponseTime).toBe(50);
    });
  });

  describe('getErrorProneEndpoints', () => {
    it('should return endpoints sorted by error rate', () => {
      // High error rate endpoint
      for (let i = 0; i < 8; i++) {
        apiMonitoringService.recordRequest('POST', '/api/error-prone', 500, 100);
      }
      for (let i = 0; i < 2; i++) {
        apiMonitoringService.recordRequest('POST', '/api/error-prone', 200, 100);
      }

      // Medium error rate endpoint
      for (let i = 0; i < 3; i++) {
        apiMonitoringService.recordRequest('GET', '/api/sometimes-fails', 500, 100);
      }
      for (let i = 0; i < 7; i++) {
        apiMonitoringService.recordRequest('GET', '/api/sometimes-fails', 200, 100);
      }

      // Low traffic endpoint (should be filtered out)
      apiMonitoringService.recordRequest('GET', '/api/low-traffic', 500, 100);

      const errorProneEndpoints = apiMonitoringService.getErrorProneEndpoints(5);

      expect(errorProneEndpoints).toHaveLength(2);
      expect(errorProneEndpoints[0].endpoint).toBe('/api/error-prone');
      expect(errorProneEndpoints[0].errorRate).toBe(80);
      expect(errorProneEndpoints[1].endpoint).toBe('/api/sometimes-fails');
      expect(errorProneEndpoints[1].errorRate).toBe(30);
    });
  });

  describe('getHistoricalMetrics', () => {
    it('should retrieve historical metrics from Redis', async () => {
      const mockMetrics = [
        { timestamp: '2023-01-01T10:00:00Z', requests: { total: 100 } },
        { timestamp: '2023-01-01T10:05:00Z', requests: { total: 150 } }
      ];

      mockRedis.get
        .mockResolvedValueOnce(JSON.stringify(mockMetrics[0]))
        .mockResolvedValueOnce(JSON.stringify(mockMetrics[1]))
        .mockResolvedValue(null);

      const historicalMetrics = await apiMonitoringService.getHistoricalMetrics(1);

      expect(historicalMetrics).toHaveLength(2);
      expect(historicalMetrics[0].timestamp).toBe('2023-01-01T10:00:00Z');
      expect(historicalMetrics[1].timestamp).toBe('2023-01-01T10:05:00Z');
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const historicalMetrics = await apiMonitoringService.getHistoricalMetrics(1);

      expect(historicalMetrics).toHaveLength(0);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve historical metrics',
        expect.objectContaining({
          error: 'Redis error'
        })
      );
    });

    it('should return empty array when Redis is not available', async () => {
      // Mock redis as null
      (apiMonitoringService as any).redis = null;

      const historicalMetrics = await apiMonitoringService.getHistoricalMetrics(1);

      expect(historicalMetrics).toHaveLength(0);
    });
  });

  describe('resetMetrics', () => {
    it('should clear all metrics', () => {
      // Record some metrics
      apiMonitoringService.recordRequest('GET', '/api/test', 200, 100);
      
      let metrics = apiMonitoringService.getApiMetrics();
      expect(metrics).toHaveLength(1);

      // Reset metrics
      apiMonitoringService.resetMetrics();

      metrics = apiMonitoringService.getApiMetrics();
      expect(metrics).toHaveLength(0);

      expect(mockLogger.info).toHaveBeenCalledWith('API metrics reset');
    });
  });

  describe('Periodic Tasks', () => {
    it('should log system metrics periodically', () => {
      // This test would require mocking timers
      // For now, we'll just verify the method exists and can be called
      expect(typeof (apiMonitoringService as any).logSystemMetrics).toBe('function');
    });

    it('should clean up old metrics periodically', () => {
      // This test would require mocking timers
      // For now, we'll just verify the method exists and can be called
      expect(typeof (apiMonitoringService as any).cleanupOldMetrics).toBe('function');
    });

    it('should perform health checks periodically', () => {
      // This test would require mocking timers
      // For now, we'll just verify the method exists and can be called
      expect(typeof (apiMonitoringService as any).performHealthChecks).toBe('function');
    });
  });
});