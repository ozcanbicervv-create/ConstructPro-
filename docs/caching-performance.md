# Caching and Performance Optimization

This document describes the comprehensive caching and performance optimization features implemented in ConstructPro.

## Overview

The caching and performance optimization system includes:

- **Redis-based caching** for API responses and session storage
- **Performance monitoring** with metrics collection and alerting
- **Database query optimization** with connection pooling and indexing
- **Response compression** to reduce bandwidth usage
- **Rate limiting** to prevent abuse and ensure fair usage
- **Cache invalidation strategies** for data consistency

## Redis Caching

### Configuration

Redis is configured with separate databases for different purposes:

```typescript
// Cache database (DB 0)
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: 0,
});

// Session database (DB 1)
export const redisSession = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: 1,
});
```

### Cache Keys and TTL

Standardized cache keys and TTL values:

```typescript
export const CACHE_KEYS = {
  PROJECT: 'project:',
  PROJECT_LIST: 'projects:',
  TASK: 'task:',
  MATERIAL: 'material:',
  USER: 'user:',
  API_RESPONSE: 'api:',
};

export const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 1800,     // 30 minutes
  VERY_LONG: 3600, // 1 hour
};
```

### Cache Manager Usage

```typescript
import { cacheManager } from '@/lib/redis';

// Get cached data
const project = await cacheManager.get<Project>('project:123');

// Set cached data with TTL
await cacheManager.set('project:123', projectData, CACHE_TTL.MEDIUM);

// Delete cached data
await cacheManager.del('project:123');

// Delete by pattern
await cacheManager.delPattern('project:*');
```

## API Response Caching

### Cache Middleware

Automatic caching for GET requests:

```typescript
import { createCacheMiddleware } from '@/middleware/cache.middleware';

// Basic caching
const cacheMiddleware = createCacheMiddleware({
  ttl: 300, // 5 minutes
});

// User-specific caching
const userCacheMiddleware = createCacheMiddleware({
  ttl: 300,
  varyBy: ['authorization'],
  keyGenerator: (req) => {
    const baseKey = defaultKeyGenerator(req);
    const userId = req.headers.get('x-user-id') || 'anonymous';
    return `${baseKey}:user:${userId}`;
  },
});
```

### Cache Headers

Responses include cache information:

```
X-Cache: HIT|MISS
X-Cache-Key: api:GET:/api/projects
X-Cache-Timestamp: 2024-01-01T12:00:00.000Z
Cache-Control: public, max-age=300
```

## Cache Invalidation

### Automatic Invalidation

Cache invalidation happens automatically on data changes:

```typescript
import { cacheInvalidator } from '@/lib/redis';

// Invalidate project-related caches
await cacheInvalidator.invalidateProject('project-123');

// Invalidate task-related caches
await cacheInvalidator.invalidateTask('task-456', 'project-123');

// Invalidate user-related caches
await cacheInvalidator.invalidateUser('user-789');
```

### API Cache Invalidation

```typescript
import { ApiCacheInvalidator } from '@/middleware/cache.middleware';

// Invalidate API response caches
await ApiCacheInvalidator.invalidateProject('project-123');
await ApiCacheInvalidator.invalidateTask('task-456');
```

## Performance Monitoring

### Metrics Collection

Automatic collection of performance metrics:

```typescript
import { performanceMonitor } from '@/lib/performance';

// HTTP request metrics
performanceMonitor.trackHttpRequest('GET', '/api/projects', 200, 150);

// Database query metrics
performanceMonitor.trackDatabaseQuery('findMany', 'Project', 50);

// Cache operation metrics
performanceMonitor.trackCacheOperation('hit', 'project:123');
```

### Available Metrics

- **HTTP Request Duration**: Response time histogram
- **HTTP Request Total**: Request count by method/route/status
- **Database Query Duration**: Query time by operation/table
- **Cache Hit Rate**: Cache operations by type/result
- **Active Connections**: Current connection count
- **Rate Limit Hits**: Rate limit violations

### Performance Summary

```typescript
const summary = await performanceMonitor.getPerformanceSummary();
// Returns:
// {
//   responseTime: { avg: 150, p95: 500, p99: 1000 },
//   requestCount: 1000,
//   errorRate: 0.02,
//   cacheStats: { hits: 800, misses: 200, hitRate: '80%' },
//   systemMetrics: { memoryUsage: 0.65, cpuUsage: 0.45 }
// }
```

### Health Checks

```typescript
const health = await performanceMonitor.healthCheck();
// Returns:
// {
//   status: 'healthy' | 'degraded' | 'unhealthy',
//   checks: {
//     redis: true,
//     database: true,
//     memory: true,
//     responseTime: true
//   },
//   metrics: { ... }
// }
```

## Database Optimization

### Connection Pooling

Optimized database connections:

```typescript
export const databaseConfig = {
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 5000,
  queryTimeout: 10000,
  slowQueryThreshold: 1000,
};
```

### Query Optimization

Optimized queries with proper indexing:

```typescript
// Optimized project queries
const { projects, total } = await optimizedPrisma.findProjectsOptimized({
  userId: 'user-123',
  status: 'IN_PROGRESS',
  search: 'construction',
  page: 1,
  limit: 10,
});
```

### Database Indexes

Automatic index creation for optimal performance:

```sql
-- Project indexes
CREATE INDEX IF NOT EXISTS idx_project_manager ON "Project"("managerId");
CREATE INDEX IF NOT EXISTS idx_project_status ON "Project"(status);
CREATE INDEX IF NOT EXISTS idx_project_priority ON "Project"(priority);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_task_project ON "Task"("projectId");
CREATE INDEX IF NOT EXISTS idx_task_assignee ON "Task"("assignedTo");
CREATE INDEX IF NOT EXISTS idx_task_status ON "Task"(status);
```

## Response Compression

### Automatic Compression

Responses are automatically compressed when appropriate:

```typescript
import { compressionMiddleware } from '@/middleware/compression.middleware';

// Compression is applied based on:
// - Content type (JSON, HTML, CSS, JS)
// - Content size (> 1KB threshold)
// - Client support (Accept-Encoding header)
```

### Compression Configuration

```typescript
const compressionConfig = {
  level: 6,           // Compression level (1-9)
  threshold: 1024,    // Minimum size to compress
  memLevel: 8,        // Memory usage level
  windowBits: 15,     // Window size
  chunkSize: 16384,   // Chunk size
};
```

### Compression Statistics

```typescript
import { CompressionStats } from '@/middleware/compression.middleware';

const stats = CompressionStats.getStats();
// Returns:
// {
//   totalRequests: 1000,
//   compressedRequests: 800,
//   compressionRate: 80,
//   totalBytesSaved: 2048000,
//   averageCompressionRatio: 65.5
// }
```

## Rate Limiting

### Rate Limit Configurations

Predefined rate limits for different endpoints:

```typescript
export const rateLimitConfigs = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // 100 requests
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                  // 10 requests
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,                  // 50 uploads
  },
};
```

### Rate Limit Middleware

```typescript
import { createRateLimitMiddleware } from '@/middleware/rate-limit.middleware';

const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
  message: 'Too many requests',
});
```

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200000
Retry-After: 900
```

### Adaptive Rate Limiting

Rate limits adjust based on system load:

```typescript
import { AdaptiveRateLimit } from '@/middleware/rate-limit.middleware';

const adaptiveRateLimit = new AdaptiveRateLimit(baseConfig);
const middleware = adaptiveRateLimit.createMiddleware();
```

## Performance API

### Admin Performance Endpoint

Access performance metrics via API:

```bash
# Get performance summary
GET /api/admin/performance?type=summary

# Get detailed metrics (Prometheus format)
GET /api/admin/performance?type=metrics

# Get health check
GET /api/admin/performance?type=health

# Get cache statistics
GET /api/admin/performance?type=cache

# Get database statistics
GET /api/admin/performance?type=database
```

### Performance Actions

```bash
# Clear cache
POST /api/admin/performance
{
  "action": "clear_cache",
  "target": "all|api|projects|tasks|materials"
}

# Reset statistics
POST /api/admin/performance
{
  "action": "reset_stats",
  "target": "compression|all"
}

# Optimize database
POST /api/admin/performance
{
  "action": "optimize_database"
}
```

## Environment Variables

Required environment variables for caching and performance:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_SESSION_DB=1

# Performance Configuration
CACHE_DEFAULT_TTL=300
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Configuration
DATABASE_CONNECTION_LIMIT=20
DATABASE_QUERY_TIMEOUT=10000
SLOW_QUERY_THRESHOLD=1000

# Monitoring Configuration
PERFORMANCE_MONITORING_ENABLED=true
SLOW_RESPONSE_THRESHOLD=5000
HIGH_ERROR_RATE_THRESHOLD=0.05
```

## Best Practices

### Cache Strategy

1. **Cache frequently accessed data** with appropriate TTL
2. **Use cache invalidation** to maintain data consistency
3. **Monitor cache hit rates** and adjust TTL accordingly
4. **Use different cache keys** for user-specific data

### Performance Optimization

1. **Monitor response times** and set up alerts
2. **Use database indexes** for frequently queried fields
3. **Implement pagination** for large datasets
4. **Compress responses** to reduce bandwidth

### Rate Limiting

1. **Set appropriate limits** based on usage patterns
2. **Use different limits** for different endpoints
3. **Implement bypass mechanisms** for trusted sources
4. **Monitor rate limit hits** to detect abuse

### Monitoring

1. **Set up performance alerts** for critical thresholds
2. **Monitor system resources** (memory, CPU, disk)
3. **Track cache performance** and hit rates
4. **Review slow queries** regularly

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**
   - Check Redis server status
   - Verify connection configuration
   - Check network connectivity

2. **Cache Invalidation Issues**
   - Verify invalidation patterns
   - Check cache key consistency
   - Monitor invalidation logs

3. **Performance Degradation**
   - Check system resources
   - Review slow query logs
   - Analyze cache hit rates

4. **Rate Limit False Positives**
   - Review rate limit configuration
   - Check key generation logic
   - Implement bypass mechanisms

### Debugging

Enable debug logging:

```bash
NODE_ENV=development
DEBUG=cache,performance,rate-limit
```

Monitor Redis operations:

```bash
redis-cli monitor
```

Check performance metrics:

```bash
curl http://localhost:3000/api/admin/performance?type=summary
```

## Security Considerations

1. **Secure Redis access** with authentication
2. **Validate cache keys** to prevent injection
3. **Rate limit admin endpoints** to prevent abuse
4. **Monitor performance metrics** for anomalies
5. **Use HTTPS** for all API communications

This comprehensive caching and performance optimization system ensures ConstructPro can handle production workloads efficiently while maintaining data consistency and security.