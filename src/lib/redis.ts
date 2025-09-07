import Redis from 'ioredis';

// Check if Redis is enabled
const isRedisEnabled = process.env.REDIS_ENABLED !== 'false';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: isRedisEnabled ? 3 : 0,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis instances or mock objects
export const redis = isRedisEnabled ? new Redis(redisConfig) : createMockRedis();
export const redisSession = isRedisEnabled ? new Redis({
  ...redisConfig,
  db: parseInt(process.env.REDIS_SESSION_DB || '1'),
}) : createMockRedis();

// Mock Redis for development without Redis server
function createMockRedis() {
  return {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 1,
    exists: async () => 0,
    expire: async () => 1,
    mget: async (...keys: string[]) => keys.map(() => null),
    keys: async () => [],
    ping: async () => 'PONG',
    info: async () => 'redis_version:mock\nused_memory_human:0B\nkeyspace_hits:0\nkeyspace_misses:0',
    incr: async () => 1,
    pipeline: () => ({
      setex: () => {},
      incr: () => {},
      expire: () => {},
      exec: async () => [[null, 'OK']],
    }),
    flushdb: async () => 'OK',
    on: () => {},
    emit: () => {},
  } as any;
}

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis cache connected');
});

redis.on('error', (error) => {
  console.error('❌ Redis cache error:', error);
});

redisSession.on('connect', () => {
  console.log('✅ Redis session store connected');
});

redisSession.on('error', (error) => {
  console.error('❌ Redis session store error:', error);
});

// Cache key prefixes
export const CACHE_KEYS = {
  PROJECT: 'project:',
  PROJECT_LIST: 'projects:',
  PROJECT_STATS: 'project:stats:',
  PROJECT_TEAM: 'project:team:',
  TASK: 'task:',
  TASK_LIST: 'tasks:',
  MATERIAL: 'material:',
  MATERIAL_LIST: 'materials:',
  USER: 'user:',
  USER_PERMISSIONS: 'user:permissions:',
  DOCUMENT: 'document:',
  DOCUMENT_LIST: 'documents:',
  API_RESPONSE: 'api:',
} as const;

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  SESSION: 86400, // 24 hours
} as const;

// Cache utility functions
export class CacheManager {
  private redis: Redis;

  constructor(redisInstance: Redis = redis) {
    this.redis = redisInstance;
  }

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set cached data with TTL
  async set(key: string, data: any, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete cached data
  async del(key: string | string[]): Promise<boolean> {
    try {
      await this.redis.del(Array.isArray(key) ? key : [key]);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Delete keys by pattern
  async delPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Set expiration for existing key
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  // Get multiple keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  // Set multiple keys
  async mset(keyValuePairs: Record<string, any>, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Increment counter
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      if (ttl) {
        pipeline.expire(key, ttl);
      }
      const results = await pipeline.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    memory: string;
    keys: number;
    hits: string;
    misses: string;
    hitRate: string;
  }> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      const stats = await this.redis.info('stats');
      
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const keysMatch = keyspace.match(/keys=(\d+)/);
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      
      const hits = parseInt(hitsMatch?.[1] || '0');
      const misses = parseInt(missesMatch?.[1] || '0');
      const total = hits + misses;
      const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : '0';
      
      return {
        memory: memoryMatch?.[1] || 'N/A',
        keys: parseInt(keysMatch?.[1] || '0'),
        hits: hitsMatch?.[1] || '0',
        misses: missesMatch?.[1] || '0',
        hitRate: `${hitRate}%`,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        memory: 'N/A',
        keys: 0,
        hits: '0',
        misses: '0',
        hitRate: '0%',
      };
    }
  }
}

// Default cache manager instance
export const cacheManager = new CacheManager();

// Cache invalidation strategies
export class CacheInvalidator {
  private cache: CacheManager;

  constructor(cacheManager: CacheManager = new CacheManager()) {
    this.cache = cacheManager;
  }

  // Invalidate project-related caches
  async invalidateProject(projectId: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.PROJECT}${projectId}*`,
      `${CACHE_KEYS.PROJECT_LIST}*`,
      `${CACHE_KEYS.PROJECT_STATS}${projectId}*`,
      `${CACHE_KEYS.PROJECT_TEAM}${projectId}*`,
      `${CACHE_KEYS.TASK_LIST}*project:${projectId}*`,
      `${CACHE_KEYS.MATERIAL_LIST}*project:${projectId}*`,
      `${CACHE_KEYS.DOCUMENT_LIST}*project:${projectId}*`,
    ];

    await Promise.all(patterns.map(pattern => this.cache.delPattern(pattern)));
  }

  // Invalidate task-related caches
  async invalidateTask(taskId: string, projectId?: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.TASK}${taskId}*`,
      `${CACHE_KEYS.TASK_LIST}*`,
    ];

    if (projectId) {
      patterns.push(
        `${CACHE_KEYS.PROJECT_STATS}${projectId}*`,
        `${CACHE_KEYS.TASK_LIST}*project:${projectId}*`
      );
    }

    await Promise.all(patterns.map(pattern => this.cache.delPattern(pattern)));
  }

  // Invalidate material-related caches
  async invalidateMaterial(materialId: string, projectId?: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.MATERIAL}${materialId}*`,
      `${CACHE_KEYS.MATERIAL_LIST}*`,
    ];

    if (projectId) {
      patterns.push(
        `${CACHE_KEYS.PROJECT_STATS}${projectId}*`,
        `${CACHE_KEYS.MATERIAL_LIST}*project:${projectId}*`
      );
    }

    await Promise.all(patterns.map(pattern => this.cache.delPattern(pattern)));
  }

  // Invalidate user-related caches
  async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.USER}${userId}*`,
      `${CACHE_KEYS.USER_PERMISSIONS}${userId}*`,
      `${CACHE_KEYS.PROJECT_TEAM}*user:${userId}*`,
    ];

    await Promise.all(patterns.map(pattern => this.cache.delPattern(pattern)));
  }

  // Invalidate document-related caches
  async invalidateDocument(documentId: string, projectId?: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.DOCUMENT}${documentId}*`,
      `${CACHE_KEYS.DOCUMENT_LIST}*`,
    ];

    if (projectId) {
      patterns.push(`${CACHE_KEYS.DOCUMENT_LIST}*project:${projectId}*`);
    }

    await Promise.all(patterns.map(pattern => this.cache.delPattern(pattern)));
  }

  // Clear all caches (use with caution)
  async clearAll(): Promise<void> {
    await this.cache.redis.flushdb();
  }
}

// Default cache invalidator instance
export const cacheInvalidator = new CacheInvalidator();