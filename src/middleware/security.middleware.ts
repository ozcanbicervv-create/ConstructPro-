import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { validateRequestBody, validateQueryParams, sanitizeText, sanitizeHtml } from '@/utils/security/input-validation';
import { createRateLimit, RateLimitConfigs } from '@/utils/security/rate-limiting';

/**
 * Security middleware for comprehensive API protection
 */

export interface SecurityOptions {
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
  };
  validateInput?: boolean;
  sanitizeInput?: boolean;
  requireHttps?: boolean;
  corsEnabled?: boolean;
  allowedOrigins?: string[];
}

/**
 * Comprehensive security middleware wrapper
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. HTTPS enforcement (in production)
      if (options.requireHttps && process.env.NODE_ENV === 'production') {
        const protocol = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol;
        if (protocol !== 'https:') {
          return NextResponse.json(
            { error: 'HTTPS required' },
            { status: 426 }
          );
        }
      }

      // 2. CORS handling
      if (options.corsEnabled) {
        const origin = req.headers.get('origin');
        const allowedOrigins = options.allowedOrigins || [process.env.FRONTEND_URL || 'http://localhost:3000'];
        
        if (origin && !allowedOrigins.includes(origin)) {
          return NextResponse.json(
            { error: 'CORS policy violation' },
            { status: 403 }
          );
        }
      }

      // 3. Rate limiting
      if (options.rateLimit) {
        const rateLimit = createRateLimit(options.rateLimit);
        const rateLimitResponse = await rateLimit(req, async (req) => {
          return NextResponse.next();
        });
        
        if (rateLimitResponse.status === 429) {
          return rateLimitResponse;
        }
      }

      // 4. Input validation and sanitization
      if (options.validateInput || options.sanitizeInput) {
        const contentType = req.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          try {
            const body = await req.json();
            
            if (options.sanitizeInput) {
              sanitizeRequestBody(body);
            }
            
            // Re-create request with sanitized body
            const sanitizedRequest = new NextRequest(req.url, {
              method: req.method,
              headers: req.headers,
              body: JSON.stringify(body),
            });
            
            return await handler(sanitizedRequest);
          } catch (error) {
            return NextResponse.json(
              { error: 'Invalid JSON format' },
              { status: 400 }
            );
          }
        }
      }

      // 5. Security headers
      const response = await handler(req);
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      return response;

    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Security validation failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Recursively sanitize request body
 */
function sanitizeRequestBody(obj: any): void {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      obj[index] = sanitizeRequestBody(item);
    });
    return;
  }
  
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeText(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeRequestBody(obj[key]);
      }
    });
  }
}

/**
 * Input validation middleware for specific schemas
 */
export function withInputValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const validation = await validateRequestBody(req, schema);
      
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validation.error
          },
          { status: 400 }
        );
      }

      return await handler(req, validation.data);
    } catch (error) {
      console.error('Input validation error:', error);
      return NextResponse.json(
        { error: 'Validation error' },
        { status: 400 }
      );
    }
  };
}

/**
 * Query parameter validation middleware
 */
export function withQueryValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, params: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(req.url);
      const validation = validateQueryParams(searchParams, schema);
      
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid query parameters',
            details: validation.error
          },
          { status: 400 }
        );
      }

      return await handler(req, validation.data);
    } catch (error) {
      console.error('Query validation error:', error);
      return NextResponse.json(
        { error: 'Query validation error' },
        { status: 400 }
      );
    }
  };
}

/**
 * Combined middleware for authentication, rate limiting, and validation
 */
export function withSecureAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: SecurityOptions & {
    requireAuth?: boolean;
    requiredRole?: UserRole;
    requiredPermission?: {
      resource: string;
      action: string;
    };
  } = {}
) {
  return withSecurity(
    async (req: NextRequest) => {
      // Apply authentication middleware
      const { withAuth } = await import('./auth.middleware');
      const authHandler = withAuth(handler, {
        requireAuth: options.requireAuth,
        requiredRole: options.requiredRole,
        requiredPermission: options.requiredPermission,
      });
      
      return await authHandler(req);
    },
    {
      rateLimit: options.rateLimit || RateLimitConfigs.api,
      validateInput: options.validateInput !== false,
      sanitizeInput: options.sanitizeInput !== false,
      requireHttps: options.requireHttps !== false,
      corsEnabled: options.corsEnabled !== false,
      allowedOrigins: options.allowedOrigins,
    }
  );
}

export type { SecurityOptions };