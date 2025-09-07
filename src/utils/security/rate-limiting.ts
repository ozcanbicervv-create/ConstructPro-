import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting utilities for API protection
 * Implements sliding window rate limiting with memory storage
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
  onLimitReached?: (request: NextRequest) => void;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  requests: number[];
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Default key generator using IP address and user agent
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
    request.headers.get('x-real-ip') || 
    request.ip || 
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`;
}

/**
 * Rate limiting middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = defaultKeyGenerator,
    onLimitReached,
  } = config;

  return async function rateLimit(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        requests: [],
      };
      rateLimitStore.set(key, entry);
    }

    // Clean old requests from sliding window
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);
    entry.count = entry.requests.length;

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      if (onLimitReached) {
        onLimitReached(request);
      }

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    // Execute the handler
    const response = await handler(request);
    const shouldCount = 
      (!skipSuccessfulRequests || response.status >= 400) &&
      (!skipFailedRequests || response.status < 400);

    if (shouldCount) {
      entry.requests.push(now);
      entry.count = entry.requests.length;
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());

    return response;
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  },

  // General API rate limiting
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },

  // File upload rate limiting
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
  },

  // Search rate limiting
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  },

  // Admin operations
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 admin operations per minute
  },
} as const;

/**
 * IP-based rate limiting for specific endpoints
 */
export function createIPRateLimit(maxRequests: number, windowMs: number) {
  return createRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      const forwarded = request.headers.get('x-forwarded-for');
      return forwarded ? forwarded.split(',')[0] : 
        request.headers.get('x-real-ip') || 
        request.ip || 
        'unknown';
    },
  });
}

/**
 * User-based rate limiting (requires authentication)
 */
export function createUserRateLimit(maxRequests: number, windowMs: number) {
  return createRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (request) => {
      // Extract user ID from session/token
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        // In a real implementation, decode JWT to get user ID
        return `user:${authHeader.substring(0, 20)}`;
      }
      // Fallback to IP-based limiting
      const forwarded = request.headers.get('x-forwarded-for');
      return forwarded ? forwarded.split(',')[0] : 
        request.headers.get('x-real-ip') || 
        request.ip || 
        'unknown';
    },
  });
}

/**
 * Rate limiting decorator for API routes
 */
export function withRateLimit(config: RateLimitConfig) {
  return function decorator(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const rateLimit = createRateLimit(config);

    descriptor.value = async function (request: NextRequest) {
      return rateLimit(request, originalMethod.bind(this));
    };

    return descriptor;
  };
}

/**
 * Middleware helper for applying rate limiting to API routes
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimit = createRateLimit(config);
  return rateLimit(request, handler);
}

export type { RateLimitConfig, RateLimitEntry };