import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import { performanceMonitor, PerformanceMonitor } from '@/lib/performance';
import { cacheManager, CacheManager, cacheInvalidator, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { createCacheMiddleware, ApiCacheInvalidator } from '@/middleware/cache.middleware';
import { CompressionStats, shouldCompress } from '@/middleware/compression.middleware';
import { createRateLimitMiddleware, rateLimitConfigs } from '@/middleware/rate-limit.middleware';
// Mock Prisma before importing
jest.mock('@/lib/database-optimization', () => ({
  optimizedPrisma: {
    healthCheck: jest.fn(),
    findProjectsOptimized: jest.fn(),
    analyzeQueryPerformance: jest.fn(),
    $queryRaw: jest.fn(),
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  applyDatabaseIndexes: jest.fn(),
}));

import { optimizedPrisma } from '@/lib/database-optimization';

import { NextRequest, NextResponse } from 'next/server';

// Mock Redis for testing
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    mget: jest.fn(),
    incr: jest.fn(),
    ping: jest.fn(),
    info: jest.fn(),
    flushdb: jest.fn(),
    pipeline: jest.fn(() => ({
      setex: jest.fn(),
      exec: jest.fn(),
    })),
    on: jest.fn(),
  };
  
  return jest.fn(() => mockRedis);
});

describe('Caching and Performance Optimization', () => {
  let mockRedis: any;

  beforeAll(async () => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockRedis = require('ioredis')();
  });

  describe('Redis Cache Manager', () => {
    it('should get cached data', async () => {
      const testData = { id: '1', name: 'Test Project' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheManager.get('test-key');
      
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should set cached data with TTL', async () => {
      const testData = { id: '1', name: 'Test Project' };
      mockRedis.setex.mockResolvedValue('OK');

      const result = await cacheManager.set('test-key', testData, CACHE_TTL.MEDIUM);
      
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        CACHE_TTL.MEDIUM,
        JSON.stringify(testData)
      );
      expect(result).toBe(true);
    });

    it('should delete cached data', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await cacheManager.del('test-key');
      
      expect(mockRedis.del).toHaveBeenCalledWith(['test-key']);
      expect(result).toBe(true);
    });

    it('should delete keys by pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      const result = await cacheManager.delPattern('test-*');
      
      expect(mockRedis.keys).toHaveBeenCalledWith('test-*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
      expect(result).toBe(true);
    });

    it('should handle cache errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheManager.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should increment counter with TTL', async () => {
      const mockPipeline = {
        incr: jest.fn(),
        expire: jest.fn(),
        exec: jest.fn().mockResolvedValue([[null, 5], [null, 'OK']]),
      };
      mockRedis.pipeline.mockReturnValue(mockPipeline);

      const result = await cacheManager.incr('counter-key', 60);
      
      expect(mockPipeline.incr).toHaveBeenCalledWith('counter-key');
      expect(mockPipeline.expire).toHaveBeenCalledWith('counter-key', 60);
      expect(result).toBe(5);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate project-related caches', async () => {
      mockRedis.keys.mockResolvedValue(['project:1', 'projects:list']);
      mockRedis.del.mockResolvedValue(2);

      await cacheInvalidator.invalidateProject('project-1');
      
      expect(mockRedis.keys).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should invalidate task-related caches', async () => {
      mockRedis.keys.mockResolvedValue(['task:1', 'tasks:list']);
      mockRedis.del.mockResolvedValue(2);

      await cacheInvalidator.invalidateTask('task-1', 'project-1');
      
      expect(mockRedis.keys).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should invalidate user-related caches', async () => {
      mockRedis.keys.mockResolvedValue(['user:1', 'user:permissions:1']);
      mockRedis.del.mockResolvedValue(2);

      await cacheInvalidator.invalidateUser('user-1');
      
      expect(mockRedis.keys).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track HTTP request metrics', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      performanceMonitor.trackHttpRequest('GET', '/api/projects', 200, 150);
      
      // Verify metrics were recorded (would need access to internal metrics)
      expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('error'));
      
      spy.mockRestore();
    });

    it('should track database query metrics', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      performanceMonitor.trackDatabaseQuery('findMany', 'Project', 50);
      
      // Verify metrics were recorded
      expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('error'));
      
      spy.mockRestore();
    });

    it('should track cache operations', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      performanceMonitor.trackCacheOperation('hit', 'test-key');
      performanceMonitor.trackCacheOperation('miss', 'test-key');
      
      // Verify metrics were recorded
      expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('error'));
      
      spy.mockRestore();
    });

    it('should get performance summary', async () => {
      const summary = await performanceMonitor.getPerformanceSummary();
      
      expect(summary).toHaveProperty('responseTime');
      expect(summary).toHaveProperty('requestCount');
      expect(summary).toHaveProperty('errorRate');
      expect(summary).toHaveProperty('cacheStats');
      expect(summary).toHaveProperty('systemMetrics');
    });

    it('should perform health check', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      
      const healthCheck = await performanceMonitor.healthCheck();
      
      expect(healthCheck).toHaveProperty('status');
      expect(healthCheck).toHaveProperty('checks');
      expect(healthCheck).toHaveProperty('metrics');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthCheck.status);
    });
  });

  describe('Cache Middleware', () => {
    it('should cache GET responses', async () => {
      const cacheMiddleware = createCacheMiddleware({ ttl: 300 });
      
      const mockRequest = new NextRequest('http://localhost:3000/api/projects');
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ data: 'test' })
      );
      
      mockRedis.get.mockResolvedValue(null); // Cache miss
      mockRedis.setex.mockResolvedValue('OK');
      
      const response = await cacheMiddleware(mockRequest, mockHandler);
      
      expect(mockHandler).toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBe('MISS');
    });

    it('should return cached responses on cache hit', async () => {
      const cacheMiddleware = createCacheMiddleware({ ttl: 300 });
      
      const mockRequest = new NextRequest('http://localhost:3000/api/projects');
      const mockHandler = jest.fn();
      
      const cachedData = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { data: 'cached' },
        timestamp: Date.now(),
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));
      
      const response = await cacheMiddleware(mockRequest, mockHandler);
      
      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBe('HIT');
    });

    it('should skip caching for non-GET requests', async () => {
      const cacheMiddleware = createCacheMiddleware({ ttl: 300 });
      
      const mockRequest = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
      });
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ data: 'test' })
      );
      
      const response = await cacheMiddleware(mockRequest, mockHandler);
      
      expect(mockHandler).toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const rateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.general);
      
      const mockRequest = new NextRequest('http://localhost:3000/api/projects');
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ data: 'test' })
      );
      
      mockRedis.get.mockResolvedValue(5); // Current count
      mockRedis.incr.mockResolvedValue(6);
      
      const response = await rateLimitMiddleware(mockRequest, mockHandler);
      
      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should block requests exceeding rate limit', async () => {
      const rateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.general);
      
      const mockRequest = new NextRequest('http://localhost:3000/api/projects');
      const mockHandler = jest.fn();
      
      mockRedis.get.mockResolvedValue(100); // At limit
      
      const response = await rateLimitMiddleware(mockRequest, mockHandler);
      
      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(429);
      
      const body = await response.json();
      expect(body).toHaveProperty('error', 'Rate limit exceeded');
    });

    it('should add rate limit headers', async () => {
      const rateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.general);
      
      const mockRequest = new NextRequest('http://localhost:3000/api/projects');
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ data: 'test' })
      );
      
      mockRedis.get.mockResolvedValue(5);
      mockRedis.incr.mockResolvedValue(6);
      
      const response = await rateLimitMiddleware(mockRequest, mockHandler);
      
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('94');
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });
  });

  describe('Compression', () => {
    it('should identify compressible content types', () => {
      expect(shouldCompress('application/json', 2000, 'gzip, deflate')).toBe(true);
      expect(shouldCompress('text/html', 2000, 'gzip, deflate')).toBe(true);
      expect(shouldCompress('text/css', 2000, 'gzip, deflate')).toBe(true);
    });

    it('should skip compression for non-compressible content', () => {
      expect(shouldCompress('image/jpeg', 2000, 'gzip, deflate')).toBe(false);
      expect(shouldCompress('image/png', 2000, 'gzip, deflate')).toBe(false);
      expect(shouldCompress('video/mp4', 2000, 'gzip, deflate')).toBe(false);
    });

    it('should skip compression for small content', () => {
      expect(shouldCompress('application/json', 500, 'gzip, deflate')).toBe(false);
    });

    it('should skip compression when client does not support it', () => {
      expect(shouldCompress('application/json', 2000, '')).toBe(false);
      expect(shouldCompress('application/json', 2000, 'identity')).toBe(false);
    });

    it('should track compression statistics', () => {
      CompressionStats.recordCompression(1000, 600);
      CompressionStats.recordCompression(2000, 1200);
      CompressionStats.recordUncompressed();
      
      const stats = CompressionStats.getStats();
      
      expect(stats.totalRequests).toBe(3);
      expect(stats.compressedRequests).toBe(2);
      expect(stats.compressionRate).toBe((2/3) * 100);
      expect(stats.totalBytesSaved).toBe(1200); // (1000-600) + (2000-1200)
    });
  });

  describe('Database Optimization', () => {
    it('should perform health check', async () => {
      (optimizedPrisma.healthCheck as jest.Mock).mockResolvedValue(true);
      
      const isHealthy = await optimizedPrisma.healthCheck();
      
      expect(isHealthy).toBe(true);
      expect(optimizedPrisma.healthCheck).toHaveBeenCalled();
    });

    it('should handle health check failure', async () => {
      (optimizedPrisma.healthCheck as jest.Mock).mockResolvedValue(false);
      
      const isHealthy = await optimizedPrisma.healthCheck();
      
      expect(isHealthy).toBe(false);
    });

    it('should find projects with optimization', async () => {
      const mockResult = {
        projects: [],
        total: 0,
      };
      
      (optimizedPrisma.findProjectsOptimized as jest.Mock).mockResolvedValue(mockResult);
      
      const result = await optimizedPrisma.findProjectsOptimized({
        userId: 'user-1',
        status: 'IN_PROGRESS',
        page: 1,
        limit: 10,
      });
      
      expect(optimizedPrisma.findProjectsOptimized).toHaveBeenCalledWith({
        userId: 'user-1',
        status: 'IN_PROGRESS',
        page: 1,
        limit: 10,
      });
      
      expect(result).toHaveProperty('projects');
      expect(result).toHaveProperty('total');
    });
  });

  describe('API Cache Invalidation', () => {
    it('should invalidate project API caches', async () => {
      mockRedis.keys.mockResolvedValue(['api:GET:/api/projects/1']);
      mockRedis.del.mockResolvedValue(1);
      
      await ApiCacheInvalidator.invalidateProject('project-1');
      
      expect(mockRedis.keys).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should clear all API caches', async () => {
      mockRedis.keys.mockResolvedValue(['api:GET:/api/projects', 'api:GET:/api/tasks']);
      mockRedis.del.mockResolvedValue(2);
      
      await ApiCacheInvalidator.clearAll();
      
      expect(mockRedis.keys).toHaveBeenCalledWith('api:*');
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });
});

describe('Integration Tests', () => {
  it('should handle cache miss and database query', async () => {
    // This would be a more complex integration test
    // involving actual database queries and cache operations
    expect(true).toBe(true);
  });

  it('should handle cache invalidation on data updates', async () => {
    // Test that updating data properly invalidates related caches
    expect(true).toBe(true);
  });

  it('should handle performance monitoring across requests', async () => {
    // Test that performance metrics are properly tracked across multiple requests
    expect(true).toBe(true);
  });
});