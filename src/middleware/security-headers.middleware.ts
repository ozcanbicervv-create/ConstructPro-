import { NextRequest, NextResponse } from 'next/server';

export interface SecurityConfig {
  cors?: {
    origin?: string | string[] | boolean;
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  };
  csp?: {
    directives?: Record<string, string | string[]>;
    reportOnly?: boolean;
  };
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
}

const defaultSecurityConfig: SecurityConfig = {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-API-Key',
      'X-Correlation-ID'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.socket.io'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': ["'self'", 'ws:', 'wss:', 'https://api.constructpro.com'],
      'media-src': ["'self'", 'blob:'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    },
    reportOnly: process.env.NODE_ENV === 'development'
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: ['self'],
    microphone: ['self'],
    geolocation: ['self'],
    payment: ['none'],
    usb: ['none']
  }
};

export function createSecurityHeadersMiddleware(config: SecurityConfig = {}) {
  const finalConfig = { ...defaultSecurityConfig, ...config };

  return (request: NextRequest) => {
    const response = NextResponse.next();
    const origin = request.headers.get('origin');
    const method = request.method;

    // Handle CORS
    if (finalConfig.cors) {
      const { origin: allowedOrigins, methods, allowedHeaders, credentials, maxAge } = finalConfig.cors;

      // Handle preflight requests
      if (method === 'OPTIONS') {
        const preflightResponse = new NextResponse(null, { status: 200 });
        
        if (allowedOrigins) {
          if (typeof allowedOrigins === 'boolean' && allowedOrigins) {
            preflightResponse.headers.set('Access-Control-Allow-Origin', '*');
          } else if (typeof allowedOrigins === 'string') {
            preflightResponse.headers.set('Access-Control-Allow-Origin', allowedOrigins);
          } else if (Array.isArray(allowedOrigins) && origin && allowedOrigins.includes(origin)) {
            preflightResponse.headers.set('Access-Control-Allow-Origin', origin);
          }
        }

        if (methods) {
          preflightResponse.headers.set('Access-Control-Allow-Methods', methods.join(', '));
        }

        if (allowedHeaders) {
          preflightResponse.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
        }

        if (credentials) {
          preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        if (maxAge) {
          preflightResponse.headers.set('Access-Control-Max-Age', maxAge.toString());
        }

        return preflightResponse;
      }

      // Handle actual requests
      if (allowedOrigins) {
        if (typeof allowedOrigins === 'boolean' && allowedOrigins) {
          response.headers.set('Access-Control-Allow-Origin', '*');
        } else if (typeof allowedOrigins === 'string') {
          response.headers.set('Access-Control-Allow-Origin', allowedOrigins);
        } else if (Array.isArray(allowedOrigins) && origin && allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        }
      }

      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
    }

    // Content Security Policy
    if (finalConfig.csp) {
      const { directives, reportOnly } = finalConfig.csp;
      if (directives) {
        const cspString = Object.entries(directives)
          .map(([directive, sources]) => {
            if (Array.isArray(sources)) {
              return `${directive} ${sources.join(' ')}`;
            }
            return `${directive} ${sources}`;
          })
          .join('; ');

        const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
        response.headers.set(headerName, cspString);
      }
    }

    // HTTP Strict Transport Security
    if (finalConfig.hsts && request.nextUrl.protocol === 'https:') {
      const { maxAge, includeSubDomains, preload } = finalConfig.hsts;
      let hstsValue = `max-age=${maxAge}`;
      if (includeSubDomains) {hstsValue += '; includeSubDomains';}
      if (preload) {hstsValue += '; preload';}
      response.headers.set('Strict-Transport-Security', hstsValue);
    }

    // X-Frame-Options
    if (finalConfig.frameOptions) {
      response.headers.set('X-Frame-Options', finalConfig.frameOptions);
    }

    // X-Content-Type-Options
    if (finalConfig.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (finalConfig.referrerPolicy) {
      response.headers.set('Referrer-Policy', finalConfig.referrerPolicy);
    }

    // Permissions Policy
    if (finalConfig.permissionsPolicy) {
      const permissionsString = Object.entries(finalConfig.permissionsPolicy)
        .map(([directive, allowlist]) => {
          if (allowlist.length === 0) {
            return `${directive}=()`;
          }
          return `${directive}=(${allowlist.map(origin => origin === 'self' ? 'self' : `"${origin}"`).join(' ')})`;
        })
        .join(', ');
      response.headers.set('Permissions-Policy', permissionsString);
    }

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

    return response;
  };
}

// Environment-specific configurations
export const securityConfigs = {
  development: {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    csp: {
      reportOnly: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", 'ws://localhost:*', 'wss://localhost:*']
      }
    }
  },
  production: {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    },
    csp: {
      reportOnly: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'wss:', 'https:'],
        'report-uri': ['/api/csp-report']
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};

export default createSecurityHeadersMiddleware;