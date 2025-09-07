import { NextRequest, NextResponse } from 'next/server';

import { performanceMonitor } from '@/lib/performance';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: NextRequest) => string;
  skipCache?: (req: NextRequest) => boolean;
  varyBy?: string[];
  tags?: string[];
}

// Default cache key generator
function defaultKeyGenerator(req: NextRequest): string {
  const url = new URL(req.url);
  const method = req.method;
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();
  
  return `${CACHE_KEYS.API_RESPONSE}${method}:${pathname}${searchParams ? `?${searchParams}` : ''}`;
}

// Cache middleware factory
export function createCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = CACHE_TTL.MEDIUM,
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    varyBy = [],
    tags = [],
  } = options;

  return async function cacheMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Skip caching for non-GET requests or when skipCache returns true
    if (req.method !== 'GET' || skipCache(req)) {
      return handler(req);
    }

    // Generate cache key
    let cacheKey = keyGenerator(req);
    
    // Add vary-by parameters to cache key
    if (varyBy.length > 0) {
      const varyValues = varyBy.map(header => req.headers.get(header) || '').join(':');
      cacheKey += `:vary:${varyValues}`;
    }

    try {
      // Try to get cached response
      const cachedResponse = await cacheManager.get<{
        status: number;
        headers: Record<string, string>;
        body: any;
        timestamp: number;
      }>(cacheKey);

      if (cachedResponse) {
        performanceMonitor.trackCacheOperation('hit', cacheKey);
        
        // Create response from cache
        const response = NextResponse.json(cachedResponse.body, {
          status: cachedResponse.status,
          headers: {
            ...cachedResponse.headers,
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
            'X-Cache-Timestamp': new Date(cachedResponse.timestamp).toISOString(),
          },
        });

        return response;
      }

      performanceMonitor.trackCacheOperation('miss', cacheKey);

      // Execute handler and cache response
      const response = await handler(req);
      
      // Only cache successful responses
      if (response.status >= 200 && response.status < 300) {
        const responseBody = await response.clone().json().catch(() => null);
        
        if (responseBody) {
          const cacheData = {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
            timestamp: Date.now(),
          };

          await cacheManager.set(cacheKey, cacheData, ttl);
          performanceMonitor.trackCacheOperation('set', cacheKey);
        }
      }

      // Add cache headers to response
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Cache-Key', cacheKey);
      response.headers.set('Cache-Control', `public, max-age=${ttl}`);

      return response;
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Fall back to executing handler without caching
      return handler(req);
    }
  };
}

// Predefined cache configurations
export const cacheConfigs = {
  // Short-lived cache for frequently changing data
  short: createCacheMiddleware({
    ttl: CACHE_TTL.SHORT,
  }),

  // Medium-lived cache for moderately changing data
  medium: createCacheMiddleware({
    ttl: CACHE_TTL.MEDIUM,
  }),

  // Long-lived cache for rarely changing data
  long: createCacheMiddleware({
    ttl: CACHE_TTL.LONG,
  }),

  // User-specific cache
  userSpecific: createCacheMiddleware({
    ttl: CACHE_TTL.MEDIUM,
    varyBy: ['authorization'],
    keyGenerator: (req) => {
      const baseKey = defaultKeyGenerator(req);
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `${baseKey}:user:${userId}`;
    },
  }),

  // Project-specific cache
  projectSpecific: createCacheMiddleware({
    ttl: CACHE_TTL.MEDIUM,
    keyGenerator: (req) => {
      const url = new URL(req.url);
      const projectId = url.pathname.match(/\/projects\/([^\/]+)/)?.[1];
      const baseKey = defaultKeyGenerator(req);
      return projectId ? `${baseKey}:project:${projectId}` : baseKey;
    },
  }),

  // Skip cache for authenticated requests with mutations
  skipMutations: createCacheMiddleware({
    skipCache: (req) => {
      const hasMutationParams = ['force', 'refresh', 'invalidate'].some(param =>
        new URL(req.url).searchParams.has(param)
      );
      return hasMutationParams;
    },
  }),
};

// Cache invalidation helper
export class ApiCacheInvalidator {
  // Invalidate API response caches by pattern
  static async invalidateByPattern(pattern: string): Promise<void> {
    try {
      await cacheManager.delPattern(`${CACHE_KEYS.API_RESPONSE}${pattern}`);
    } catch (error) {
      console.error('API cache invalidation error:', error);
    }
  }

  // Invalidate project-related API caches
  static async invalidateProject(projectId: string): Promise<void> {
    const patterns = [
      `*projects/${projectId}*`,
      `*projects*`,
      `*tasks*project:${projectId}*`,
      `*materials*project:${projectId}*`,
      `*documents*project:${projectId}*`,
    ];

    await Promise.all(
      patterns.map(pattern => this.invalidateByPattern(pattern))
    );
  }

  // Invalidate task-related API caches
  static async invalidateTask(taskId: string, projectId?: string): Promise<void> {
    const patterns = [
      `*tasks/${taskId}*`,
      `*tasks*`,
    ];

    if (projectId) {
      patterns.push(`*projects/${projectId}*`);
    }

    await Promise.all(
      patterns.map(pattern => this.invalidateByPattern(pattern))
    );
  }

  // Invalidate material-related API caches
  static async invalidateMaterial(materialId: string, projectId?: string): Promise<void> {
    const patterns = [
      `*materials/${materialId}*`,
      `*materials*`,
    ];

    if (projectId) {
      patterns.push(`*projects/${projectId}*`);
    }

    await Promise.all(
      patterns.map(pattern => this.invalidateByPattern(pattern))
    );
  }

  // Invalidate user-specific API caches
  static async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      `*user:${userId}*`,
      `*users/${userId}*`,
    ];

    await Promise.all(
      patterns.map(pattern => this.invalidateByPattern(pattern))
    );
  }

  // Clear all API response caches
  static async clearAll(): Promise<void> {
    await this.invalidateByPattern('*');
  }
}

// Response compression helper
export function shouldCompress(req: NextRequest, contentType?: string): boolean {
  // Check if client accepts compression
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  if (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate')) {
    return false;
  }

  // Check content type
  if (contentType) {
    const compressibleTypes = [
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/xml',
      'application/xml',
    ];
    
    return compressibleTypes.some(type => contentType.includes(type));
  }

  return true;
}

// Pagination helper for cached responses
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export function parsePaginationParams(req: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  req: NextRequest
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
} {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
  
  // Helper to create URL with page parameter
  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(url.searchParams);
    params.set('page', pageNum.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : undefined,
      prevPage: hasPrev ? page - 1 : undefined,
    },
    links: {
      self: createPageUrl(page),
      first: createPageUrl(1),
      last: createPageUrl(totalPages),
      next: hasNext ? createPageUrl(page + 1) : undefined,
      prev: hasPrev ? createPageUrl(page - 1) : undefined,
    },
  };
}