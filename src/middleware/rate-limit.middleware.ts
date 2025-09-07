import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/redis';
import { performanceMonitor } from '@/lib/performance';

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: NextRequest, identifier: string) => void;
  message?: string;
  statusCode?: number;
}

// Default rate limit configurations
export const rateLimitConfigs = {
  // General API rate limit
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later.',
    statusCode: 429,
  },

  // Strict rate limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    statusCode: 429,
  },

  // File upload rate limit
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: 'Upload limit exceeded, please try again later.',
    statusCode: 429,
  },

  // Search rate limit
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: 'Search rate limit exceeded, please try again later.',
    statusCode: 429,
  },

  // Premium user rate limit (higher limits)
  premium: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes
    message: 'Rate limit exceeded, please try again later.',
    statusCode: 429,
  },
} as const;

// Default key generator (IP-based)
function defaultKeyGenerator(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             req.headers.get('x-real-ip') || 
             req.ip || 
             'unknown';
  return `rate_limit:${ip}`;
}

// User-based key generator
export function userKeyGenerator(req: NextRequest): string {
  const userId = req.headers.get('x-user-id') || 
                req.headers.get('authorization')?.split(' ')[1] || 
                'anonymous';
  return `rate_limit:user:${userId}`;
}

// Endpoint-specific key generator
export function endpointKeyGenerator(req: NextRequest): string {
  const ip = defaultKeyGenerator(req);
  const pathname = new URL(req.url).pathname;
  return `${ip}:${pathname}`;
}

// Rate limit middleware factory
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    onLimitReached,
    message = 'Too many requests',
    statusCode = 429,
  } = config;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const identifier = keyGenerator(req);
      const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
      const key = `${identifier}:${windowStart}`;

      // Get current request count
      const currentCount = await cacheManager.get<number>(key) || 0;

      // Check if limit exceeded
      if (currentCount >= max) {
        // Track rate limit hit
        performanceMonitor.trackRateLimitHit(
          new URL(req.url).pathname,
          req.headers.get('x-user-id') || undefined
        );

        // Call onLimitReached callback
        if (onLimitReached) {
          onLimitReached(req, identifier);
        }

        // Return rate limit exceeded response
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message,
            retryAfter: Math.ceil(windowMs / 1000),
            limit: max,
            remaining: 0,
            reset: windowStart + windowMs,
          },
          {
            status: statusCode,
            headers: {
              'X-RateLimit-Limit': max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (windowStart + windowMs).toString(),
              'Retry-After': Math.ceil(windowMs / 1000).toString(),
            },
          }
        );
      }

      // Execute the handler
      const response = await handler(req);

      // Check if we should count this request
      const shouldCount = !skipSuccessfulRequests || 
                         (response.status >= 400 && !skipFailedRequests);

      if (shouldCount) {
        // Increment request count
        const newCount = await cacheManager.incr(key, Math.ceil(windowMs / 1000));
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', max.toString());
        response.headers.set('X-RateLimit-Remaining', Math.max(0, max - newCount).toString());
        response.headers.set('X-RateLimit-Reset', (windowStart + windowMs).toString());
      }

      return response;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Continue without rate limiting if Redis is unavailable
      return handler(req);
    }
  };
}

// Sliding window rate limiter (more accurate but more expensive)
export function createSlidingWindowRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    keyGenerator = defaultKeyGenerator,
    message = 'Too many requests',
    statusCode = 429,
  } = config;

  return async function slidingWindowRateLimit(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const identifier = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;
      const key = `sliding:${identifier}`;

      // Use Redis sorted set to track requests in sliding window
      const pipeline = cacheManager.redis.pipeline();
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = (results?.[1]?.[1] as number) || 0;

      if (currentCount >= max) {
        // Remove the request we just added since we're over the limit
        await cacheManager.redis.zrem(key, `${now}-${Math.random()}`);

        performanceMonitor.trackRateLimitHit(
          new URL(req.url).pathname,
          req.headers.get('x-user-id') || undefined
        );

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message,
            retryAfter: Math.ceil(windowMs / 1000),
            limit: max,
            remaining: 0,
          },
          {
            status: statusCode,
            headers: {
              'X-RateLimit-Limit': max.toString(),
              'X-RateLimit-Remaining': '0',
              'Retry-After': Math.ceil(windowMs / 1000).toString(),
            },
          }
        );
      }

      const response = await handler(req);

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', max.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, max - currentCount - 1).toString());

      return response;
    } catch (error) {
      console.error('Sliding window rate limit error:', error);
      return handler(req);
    }
  };
}

// Adaptive rate limiting based on system load
export class AdaptiveRateLimit {
  private baseConfig: RateLimitConfig;
  private loadThresholds = {
    low: 0.3,    // < 30% load
    medium: 0.6, // 30-60% load
    high: 0.8,   // 60-80% load
    critical: 1.0, // > 80% load
  };

  constructor(baseConfig: RateLimitConfig) {
    this.baseConfig = baseConfig;
  }

  async getAdaptiveLimit(): Promise<number> {
    try {
      // Get system metrics
      const memoryUsage = process.memoryUsage();
      const memoryRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
      
      // Get Redis memory usage
      const redisInfo = await cacheManager.redis.info('memory');
      const redisMemoryMatch = redisInfo.match(/used_memory_rss:(\d+)/);
      const redisMemory = redisMemoryMatch ? parseInt(redisMemoryMatch[1]) : 0;
      
      // Calculate overall system load (simplified)
      const systemLoad = Math.max(memoryRatio, redisMemory / (1024 * 1024 * 1024)); // Normalize Redis memory to GB

      // Adjust rate limit based on load
      if (systemLoad < this.loadThresholds.low) {
        return this.baseConfig.max * 1.5; // Increase limit by 50%
      } else if (systemLoad < this.loadThresholds.medium) {
        return this.baseConfig.max; // Normal limit
      } else if (systemLoad < this.loadThresholds.high) {
        return Math.floor(this.baseConfig.max * 0.7); // Reduce by 30%
      } else if (systemLoad < this.loadThresholds.critical) {
        return Math.floor(this.baseConfig.max * 0.5); // Reduce by 50%
      } else {
        return Math.floor(this.baseConfig.max * 0.2); // Reduce by 80%
      }
    } catch (error) {
      console.error('Error calculating adaptive rate limit:', error);
      return this.baseConfig.max;
    }
  }

  createMiddleware() {
    return async (req: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => {
      const adaptiveMax = await this.getAdaptiveLimit();
      const adaptiveConfig = { ...this.baseConfig, max: adaptiveMax };
      
      const middleware = createRateLimitMiddleware(adaptiveConfig);
      return middleware(req, handler);
    };
  }
}

// Rate limit bypass for trusted sources
export function createBypassableRateLimit(
  config: RateLimitConfig,
  bypassChecker: (req: NextRequest) => boolean | Promise<boolean>
) {
  const rateLimitMiddleware = createRateLimitMiddleware(config);

  return async function bypassableRateLimit(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Check if request should bypass rate limiting
    const shouldBypass = await bypassChecker(req);
    
    if (shouldBypass) {
      return handler(req);
    }

    return rateLimitMiddleware(req, handler);
  };
}

// Common bypass checkers
export const bypassCheckers = {
  // Bypass for API keys
  apiKey: (req: NextRequest) => {
    const apiKey = req.headers.get('x-api-key');
    const trustedKeys = process.env.TRUSTED_API_KEYS?.split(',') || [];
    return apiKey ? trustedKeys.includes(apiKey) : false;
  },

  // Bypass for internal requests
  internal: (req: NextRequest) => {
    const userAgent = req.headers.get('user-agent') || '';
    return userAgent.includes('ConstructPro-Internal');
  },

  // Bypass for premium users
  premium: async (req: NextRequest) => {
    const userId = req.headers.get('x-user-id');
    if (!userId) return false;
    
    // Check if user is premium (would need to query database)
    // For now, return false
    return false;
  },
};

// Rate limit statistics
export class RateLimitStats {
  static async getStats(): Promise<{
    totalRequests: number;
    blockedRequests: number;
    blockRate: number;
    topBlockedIPs: Array<{ ip: string; count: number }>;
    topBlockedEndpoints: Array<{ endpoint: string; count: number }>;
  }> {
    try {
      // This would require storing rate limit statistics
      // For now, return mock data
      return {
        totalRequests: 0,
        blockedRequests: 0,
        blockRate: 0,
        topBlockedIPs: [],
        topBlockedEndpoints: [],
      };
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return {
        totalRequests: 0,
        blockedRequests: 0,
        blockRate: 0,
        topBlockedIPs: [],
        topBlockedEndpoints: [],
      };
    }
  }
}

// Export predefined middleware
export const generalRateLimit = createRateLimitMiddleware(rateLimitConfigs.general);
export const authRateLimit = createRateLimitMiddleware(rateLimitConfigs.auth);
export const uploadRateLimit = createRateLimitMiddleware(rateLimitConfigs.upload);
export const searchRateLimit = createRateLimitMiddleware(rateLimitConfigs.search);