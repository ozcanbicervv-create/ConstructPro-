/**
 * Security Middleware for ConstructPro
 * Implements security measures including rate limiting, input validation, and request sanitization
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage
const rateLimitMap = new Map<string, number[]>();
const bruteForceMap = new Map<string, { attempts: number; lastAttempt: number }>();

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  bruteForce: {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs: number;
  };
  blockedIPs: string[];
  allowedOrigins: string[];
}

const defaultSecurityConfig: SecurityConfig = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  bruteForce: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  blockedIPs: [],
  allowedOrigins: [
    'https://constructpro.vovelet-tech.com',
    'http://localhost:3000',
  ],
};

/**
 * Rate limiting middleware
 */
export function rateLimit(config: SecurityConfig['rateLimit'] = defaultSecurityConfig.rateLimit) {
  return (req: NextRequest): boolean => {
    const ip = getClientIP(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean old entries
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap.get(ip)!;
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= config.maxRequests) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return false;
    }

    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);
    return true;
  };
}

/**
 * Brute force protection middleware
 */
export function bruteForceProtection(config: SecurityConfig['bruteForce'] = defaultSecurityConfig.bruteForce) {
  return {
    check: (req: NextRequest): boolean => {
      const ip = getClientIP(req);
      const now = Date.now();
      
      if (!bruteForceMap.has(ip)) {
        return true; // No previous attempts
      }

      const record = bruteForceMap.get(ip)!;
      
      // Check if still in block period
      if (record.attempts >= config.maxAttempts) {
        const timeSinceLastAttempt = now - record.lastAttempt;
        if (timeSinceLastAttempt < config.blockDurationMs) {
          console.warn(`Brute force protection: IP ${ip} is blocked`);
          return false;
        } else {
          // Reset after block period
          bruteForceMap.delete(ip);
          return true;
        }
      }

      return true;
    },
    
    recordFailedAttempt: (req: NextRequest): void => {
      const ip = getClientIP(req);
      const now = Date.now();
      
      if (!bruteForceMap.has(ip)) {
        bruteForceMap.set(ip, { attempts: 1, lastAttempt: now });
      } else {
        const record = bruteForceMap.get(ip)!;
        
        // Reset if outside window
        if (now - record.lastAttempt > config.windowMs) {
          record.attempts = 1;
        } else {
          record.attempts++;
        }
        
        record.lastAttempt = now;
      }
    },
    
    recordSuccessfulAttempt: (req: NextRequest): void => {
      const ip = getClientIP(req);
      bruteForceMap.delete(ip); // Clear on successful login
    },
  };
}

/**
 * IP blocking middleware
 */
export function ipBlocking(blockedIPs: string[] = defaultSecurityConfig.blockedIPs) {
  return (req: NextRequest): boolean => {
    const ip = getClientIP(req);
    
    if (blockedIPs.includes(ip)) {
      console.warn(`Blocked IP attempted access: ${ip}`);
      return false;
    }
    
    return true;
  };
}

/**
 * CORS middleware
 */
export function corsProtection(allowedOrigins: string[] = defaultSecurityConfig.allowedOrigins) {
  return (req: NextRequest): { allowed: boolean; headers?: Record<string, string> } => {
    const origin = req.headers.get('origin');
    
    // Allow requests without origin (same-origin, mobile apps, etc.)
    if (!origin) {
      return { allowed: true };
    }
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost'));
    
    if (!isAllowed) {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      return { allowed: false };
    }
    
    return {
      allowed: true,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    };
  };
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Basic XSS prevention
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' ws: wss:; " +
    "frame-ancestors 'none';"
  );
  
  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

/**
 * Comprehensive security middleware
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: Partial<SecurityConfig> = {}
): (req: NextRequest) => Promise<NextResponse> {
  const securityConfig = { ...defaultSecurityConfig, ...config };
  const rateLimiter = rateLimit(securityConfig.rateLimit);
  const bruteForce = bruteForceProtection(securityConfig.bruteForce);
  const ipBlocker = ipBlocking(securityConfig.blockedIPs);
  const corsChecker = corsProtection(securityConfig.allowedOrigins);
  
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // IP blocking check
      if (!ipBlocker(req)) {
        return new NextResponse('Forbidden', { status: 403 });
      }
      
      // Brute force protection
      if (!bruteForce.check(req)) {
        return new NextResponse('Too Many Attempts', { status: 429 });
      }
      
      // Rate limiting
      if (!rateLimiter(req)) {
        return new NextResponse('Rate Limit Exceeded', { status: 429 });
      }
      
      // CORS check
      const corsResult = corsChecker(req);
      if (!corsResult.allowed) {
        return new NextResponse('CORS Policy Violation', { status: 403 });
      }
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        if (corsResult.headers) {
          Object.entries(corsResult.headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
        return addSecurityHeaders(response);
      }
      
      // Execute the handler
      const response = await handler(req);
      
      // Add CORS headers if needed
      if (corsResult.headers) {
        Object.entries(corsResult.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      
      // Add security headers
      return addSecurityHeaders(response);
      
    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Don't expose internal errors
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  };
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Validate request size
 */
export function validateRequestSize(maxSizeBytes: number = 1024 * 1024) { // 1MB default
  return async (req: NextRequest): Promise<boolean> => {
    const contentLength = req.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      console.warn(`Request size too large: ${contentLength} bytes`);
      return false;
    }
    
    return true;
  };
}

// Export brute force protection for use in auth routes
export const authBruteForce = bruteForceProtection();

console.log('🔒 Security middleware initialized for ConstructPro');