import { NextResponse } from "next/server";

/**
 * Security headers configuration for ConstructPro
 * Implements comprehensive security headers including CSP, HSTS, and more
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: {
    directives: Record<string, string[]>;
    reportOnly?: boolean;
  };
  strictTransportSecurity?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
  crossOriginEmbedderPolicy?: 'require-corp' | 'unsafe-none';
  crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin';
}

/**
 * Default security configuration for ConstructPro
 */
export const defaultSecurityConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for development
        'https://vercel.live',
        'https://cdn.socket.io',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://images.unsplash.com',
        'https://avatars.githubusercontent.com',
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      'connect-src': [
        "'self'",
        'https://api.constructpro.com',
        'wss://constructpro.com',
        'ws://localhost:*',
        'https://vercel.live',
      ],
      'media-src': ["'self'", 'data:', 'blob:'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    },
    reportOnly: process.env.NODE_ENV === 'development',
  },
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: ["'none'"],
    microphone: ["'none'"],
    geolocation: ["'self'"],
    payment: ["'none'"],
    usb: ["'none'"],
    'display-capture': ["'none'"],
  },
  crossOriginEmbedderPolicy: 'unsafe-none', // Required for some third-party integrations
  crossOriginOpenerPolicy: 'same-origin-allow-popups',
  crossOriginResourcePolicy: 'same-site',
};

/**
 * Development-specific security configuration (more permissive)
 */
export const developmentSecurityConfig: SecurityHeadersConfig = {
  ...defaultSecurityConfig,
  contentSecurityPolicy: {
    directives: {
      ...defaultSecurityConfig.contentSecurityPolicy!.directives,
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'http://localhost:*',
        'ws://localhost:*',
        'https://vercel.live',
      ],
      'connect-src': [
        "'self'",
        'http://localhost:*',
        'ws://localhost:*',
        'wss://localhost:*',
        'https://vercel.live',
      ],
    },
    reportOnly: true,
  },
};

/**
 * Generates Content Security Policy header value
 */
function generateCSPHeader(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Generates Permissions Policy header value
 */
function generatePermissionsPolicyHeader(permissions: Record<string, string[]>): string {
  return Object.entries(permissions)
    .map(([feature, allowlist]) => `${feature}=(${allowlist.join(' ')})`)
    .join(', ');
}

/**
 * Applies security headers to a NextResponse
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = defaultSecurityConfig
): NextResponse {
  // Content Security Policy
  if (config.contentSecurityPolicy) {
    const cspValue = generateCSPHeader(config.contentSecurityPolicy.directives);
    const headerName = config.contentSecurityPolicy.reportOnly 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    response.headers.set(headerName, cspValue);
  }

  // Strict Transport Security
  if (config.strictTransportSecurity) {
    const { maxAge, includeSubDomains, preload } = config.strictTransportSecurity;
    let hstsValue = `max-age=${maxAge}`;
    if (includeSubDomains) hstsValue += '; includeSubDomains';
    if (preload) hstsValue += '; preload';
    response.headers.set('Strict-Transport-Security', hstsValue);
  }

  // X-Frame-Options
  if (config.frameOptions) {
    response.headers.set('X-Frame-Options', config.frameOptions);
  }

  // X-Content-Type-Options
  if (config.contentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Referrer Policy
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy);
  }

  // Permissions Policy
  if (config.permissionsPolicy) {
    const permissionsValue = generatePermissionsPolicyHeader(config.permissionsPolicy);
    response.headers.set('Permissions-Policy', permissionsValue);
  }

  // Cross-Origin Embedder Policy
  if (config.crossOriginEmbedderPolicy) {
    response.headers.set('Cross-Origin-Embedder-Policy', config.crossOriginEmbedderPolicy);
  }

  // Cross-Origin Opener Policy
  if (config.crossOriginOpenerPolicy) {
    response.headers.set('Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy);
  }

  // Cross-Origin Resource Policy
  if (config.crossOriginResourcePolicy) {
    response.headers.set('Cross-Origin-Resource-Policy', config.crossOriginResourcePolicy);
  }

  // Additional security headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

/**
 * Creates a security headers middleware
 */
export function createSecurityHeadersMiddleware(config?: SecurityHeadersConfig) {
  const securityConfig = config || 
    (process.env.NODE_ENV === 'development' ? developmentSecurityConfig : defaultSecurityConfig);

  return function securityHeadersMiddleware(response: NextResponse): NextResponse {
    return applySecurityHeaders(response, securityConfig);
  };
}

/**
 * API-specific security headers
 */
export function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent caching of API responses
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  // API-specific security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // CORS headers (configure as needed)
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'https://constructpro.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Security headers for file uploads
 */
export function applyUploadSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Content-Disposition', 'attachment');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

export type { SecurityHeadersConfig };