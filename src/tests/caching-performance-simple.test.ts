import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock Redis
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
    incr: jest.fn(),
    expire: jest.fn(),
    exec: jest.fn(),
  })),
  on: jest.fn(),
};

jest.mock('ioredis', () => jest.fn(() => mockRedis));

// Mock Prisma
jest.mock('@/lib/database-optimization', () => ({
  optimizedPrisma: {
    healthCheck: jest.fn(),
    findProjectsOptimized: jest.fn(),
    analyzeQueryPerformance: jest.fn(),
    $queryRaw: jest.fn(),
  },
  applyDatabaseIndexes: jest.fn(),
}));

import { cacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { performanceMonitor } from '@/lib/performance';
import { shouldCompress, CompressionStats } from '@/middleware/compression.middleware';

describe('Caching and Performance - Core Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Manager Core Functions', () => {
    it('should get cached data successfully', async () => {
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

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheManager.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should delete keys by pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      const result = await cacheManager.delPattern('test-*');
      
      expect(mockRedis.keys).toHaveBeenCalledWith('test-*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
      expect(result).toBe(true);
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

    it('should check if key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheManager.exists('test-key');
      
      expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should get multiple keys', async () => {
      const testData1 = { id: '1', name: 'Project 1' };
      const testData2 = { id: '2', name: 'Project 2' };
      
      mockRedis.mget.mockResolvedValue([
        JSON.stringify(testData1),
        JSON.stringify(testData2),
        null,
      ]);

      const result = await cacheManager.mget(['key1', 'key2', 'key3']);
      
      expect(mockRedis.mget).toHaveBeenCalledWith('key1', 'key2', 'key3');
      expect(result).toEqual([testData1, testData2, null]);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track HTTP request metrics', () => {
      // This should not throw an error
      expect(() => {
        performanceMonitor.trackHttpRequest('GET', '/api/projects', 200, 150);
      }).not.toThrow();
    });

    it('should track database query metrics', () => {
      expect(() => {
        performanceMonitor.trackDatabaseQuery('findMany', 'Project', 50);
      }).not.toThrow();
    });

    it('should track cache operations', () => {
      expect(() => {
        performanceMonitor.trackCacheOperation('hit', 'test-key');
        performanceMonitor.trackCacheOperation('miss', 'test-key');
      }).not.toThrow();
    });

    it('should track rate limit hits', () => {
      expect(() => {
        performanceMonitor.trackRateLimitHit('/api/projects', 'user-123');
      }).not.toThrow();
    });

    it('should get performance summary', async () => {
      // Mock Redis info responses
      mockRedis.info.mockResolvedValue('used_memory_human:1.5M\nkeyspace_hits:100\nkeyspace_misses:20');

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

  describe('Compression Utilities', () => {
    it('should identify compressible content types', () => {
      expect(shouldCompress('application/json', 2000, 'gzip, deflate')).toBe(true);
      expect(shouldCompress('text/html', 2000, 'gzip, deflate')).toBe(true);
      expect(shouldCompress('text/css', 2000, 'gzip, deflate')).toBe(true);
      expect(shouldCompress('application/javascript', 2000, 'gzip, deflate')).toBe(true);
    });

    it('should skip compression for non-compressible content', () => {
      expect(shouldCompress('image/jpeg', 2000, 'gzip, deflate')).toBe(false);
      expect(shouldCompress('image/png', 2000, 'gzip, deflate')).toBe(false);
      expect(shouldCompress('video/mp4', 2000, 'gzip, deflate')).toBe(false);
      expect(shouldCompress('application/pdf', 2000, 'gzip, deflate')).toBe(false);
    });

    it('should skip compression for small content', () => {
      expect(shouldCompress('application/json', 500, 'gzip, deflate')).toBe(false);
    });

    it('should skip compression when client does not support it', () => {
      expect(shouldCompress('application/json', 2000, '')).toBe(false);
      expect(shouldCompress('application/json', 2000, 'identity')).toBe(false);
    });

    it('should track compression statistics', () => {
      // Reset stats first
      CompressionStats.reset();
      
      CompressionStats.recordCompression(1000, 600);
      CompressionStats.recordCompression(2000, 1200);
      CompressionStats.recordUncompressed();
      
      const stats = CompressionStats.getStats();
      
      expect(stats.totalRequests).toBe(3);
      expect(stats.compressedRequests).toBe(2);
      expect(stats.compressionRate).toBeCloseTo((2/3) * 100, 1);
      expect(stats.totalBytesSaved).toBe(1200); // (1000-600) + (2000-1200)
      expect(stats.averageCompressionRatio).toBeCloseTo(40, 1); // 1200/3000 * 100
    });
  });

  describe('Cache Keys and TTL Constants', () => {
    it('should have proper cache key prefixes', () => {
      expect(CACHE_KEYS.PROJECT).toBe('project:');
      expect(CACHE_KEYS.PROJECT_LIST).toBe('projects:');
      expect(CACHE_KEYS.TASK).toBe('task:');
      expect(CACHE_KEYS.MATERIAL).toBe('material:');
      expect(CACHE_KEYS.USER).toBe('user:');
      expect(CACHE_KEYS.API_RESPONSE).toBe('api:');
    });

    it('should have proper TTL values', () => {
      expect(CACHE_TTL.SHORT).toBe(60);
      expect(CACHE_TTL.MEDIUM).toBe(300);
      expect(CACHE_TTL.LONG).toBe(1800);
      expect(CACHE_TTL.VERY_LONG).toBe(3600);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache set errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis write failed'));

      const result = await cacheManager.set('test-key', { data: 'test' });
      
      expect(result).toBe(false);
    });

    it('should handle cache delete errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis delete failed'));

      const result = await cacheManager.del('test-key');
      
      expect(result).toBe(false);
    });

    it('should handle pattern delete errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis keys failed'));

      const result = await cacheManager.delPattern('test-*');
      
      expect(result).toBe(false);
    });

    it('should handle exists check errors gracefully', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Redis exists failed'));

      const result = await cacheManager.exists('test-key');
      
      expect(result).toBe(false);
    });

    it('should handle increment errors gracefully', async () => {
      const mockPipeline = {
        incr: jest.fn(),
        expire: jest.fn(),
        exec: jest.fn().mockRejectedValue(new Error('Pipeline failed')),
      };
      mockRedis.pipeline.mockReturnValue(mockPipeline);

      const result = await cacheManager.incr('counter-key', 60);
      
      expect(result).toBe(0);
    });
  });

  describe('Cache Statistics', () => {
    it('should get cache statistics', async () => {
      mockRedis.info
        .mockResolvedValueOnce('used_memory_human:2.5M\nused_memory_rss:3000000')
        .mockResolvedValueOnce('db0:keys=150,expires=75')
        .mockResolvedValueOnce('keyspace_hits:800\nkeyspace_misses:200');

      const stats = await cacheManager.getStats();
      
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      
      expect(stats.memory).toBe('2.5M');
      expect(stats.keys).toBe(150);
      expect(stats.hits).toBe('800');
      expect(stats.misses).toBe('200');
      expect(stats.hitRate).toBe('80.00%');
    });

    it('should handle stats errors gracefully', async () => {
      mockRedis.info.mockRejectedValue(new Error('Info failed'));

      const stats = await cacheManager.getStats();
      
      expect(stats.memory).toBe('N/A');
      expect(stats.keys).toBe(0);
      expect(stats.hits).toBe('0');
      expect(stats.misses).toBe('0');
      expect(stats.hitRate).toBe('0%');
    });
  });
});

describe('Integration Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle cache miss scenario', async () => {
    // Simulate cache miss
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue('OK');

    const cacheKey = 'project:123';
    
    // Try to get from cache (miss)
    let result = await cacheManager.get(cacheKey);
    expect(result).toBeNull();
    
    // Set data in cache
    const projectData = { id: '123', name: 'Test Project' };
    await cacheManager.set(cacheKey, projectData, CACHE_TTL.MEDIUM);
    
    // Verify set was called
    expect(mockRedis.setex).toHaveBeenCalledWith(
      cacheKey,
      CACHE_TTL.MEDIUM,
      JSON.stringify(projectData)
    );
  });

  it('should handle cache invalidation scenario', async () => {
    mockRedis.keys.mockResolvedValue(['project:123', 'projects:list:user:456']);
    mockRedis.del.mockResolvedValue(2);

    // Invalidate project caches
    await cacheManager.delPattern('project*');
    
    expect(mockRedis.keys).toHaveBeenCalledWith('project*');
    expect(mockRedis.del).toHaveBeenCalledWith('project:123', 'projects:list:user:456');
  });

  it('should handle performance monitoring workflow', async () => {
    const startTime = Date.now();
    
    // Simulate API request
    performanceMonitor.trackHttpRequest('GET', '/api/projects', 200, 150);
    
    // Simulate database query
    performanceMonitor.trackDatabaseQuery('findMany', 'Project', 50);
    
    // Simulate cache operations
    performanceMonitor.trackCacheOperation('miss');
    performanceMonitor.trackCacheOperation('set');
    
    // This should not throw any errors
    expect(true).toBe(true);
  });
});