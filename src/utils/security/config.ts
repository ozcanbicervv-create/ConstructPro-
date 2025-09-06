/**
 * Security configuration for ConstructPro
 * Centralized security settings and constants
 */

export const SecurityConfig = {
  // Authentication settings
  auth: {
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
  },

  // Rate limiting settings
  rateLimiting: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // per window
    authWindowMs: 15 * 60 * 1000, // 15 minutes for auth
    authMaxRequests: 5, // per auth window
    uploadWindowMs: 60 * 1000, // 1 minute for uploads
    uploadMaxRequests: 10, // per upload window
  },

  // File upload security
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/json',
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.pdf', '.txt', '.csv', '.json',
    ],
    quarantineDirectory: './uploads/quarantine',
    scanForViruses: process.env.NODE_ENV === 'production',
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for development
      'https://vercel.live',
      'https://cdn.socket.io',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS
      'https://fonts.googleapis.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://images.unsplash.com',
      'https://avatars.githubusercontent.com',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    connectSrc: [
      "'self'",
      'https://api.constructpro.com',
      'wss://constructpro.com',
      'ws://localhost:*',
      'https://vercel.live',
    ],
    mediaSrc: ["'self'", 'data:', 'blob:'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
  },

  // CORS settings
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://constructpro.com',
      'https://www.constructpro.com',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    maxAge: 86400, // 24 hours
  },

  // Input validation
  validation: {
    maxStringLength: 1000,
    maxTextLength: 5000,
    maxArrayLength: 100,
    allowedHtmlTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    sanitizeHtml: true,
    stripScriptTags: true,
  },

  // Logging and monitoring
  logging: {
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    logSecurityEvents: true,
    logFailedAuth: true,
    logRateLimitHits: true,
    logSuspiciousActivity: true,
    maxLogFileSize: 10 * 1024 * 1024, // 10MB
    logRetentionDays: 30,
  },

  // Security headers
  headers: {
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    xssProtection: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'self'"],
      payment: ["'none'"],
      usb: ["'none'"],
    },
  },

  // API security
  api: {
    requireHttps: process.env.NODE_ENV === 'production',
    validateContentType: true,
    maxRequestSize: 1024 * 1024, // 1MB
    timeoutMs: 30000, // 30 seconds
    enableCors: true,
    requireAuth: true,
    logRequests: process.env.NODE_ENV === 'production',
  },

  // Database security
  database: {
    connectionTimeout: 10000, // 10 seconds
    queryTimeout: 30000, // 30 seconds
    maxConnections: 10,
    enableQueryLogging: process.env.NODE_ENV === 'development',
    sanitizeQueries: true,
    preventSqlInjection: true,
  },

  // Environment-specific overrides
  development: {
    rateLimiting: {
      maxRequests: 1000, // More lenient for development
      authMaxRequests: 50,
    },
    csp: {
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'http://localhost:*',
        'ws://localhost:*',
      ],
      connectSrc: [
        "'self'",
        'http://localhost:*',
        'ws://localhost:*',
        'wss://localhost:*',
      ],
    },
    logging: {
      logLevel: 'debug',
      logSecurityEvents: false,
    },
  },

  production: {
    auth: {
      maxLoginAttempts: 3, // Stricter in production
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
    },
    fileUpload: {
      scanForViruses: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB in production
    },
    api: {
      requireHttps: true,
      logRequests: true,
    },
    logging: {
      logLevel: 'warn',
      logSecurityEvents: true,
    },
  },
} as const;

/**
 * Get environment-specific security configuration
 */
export function getSecurityConfig() {
  const baseConfig = SecurityConfig;
  const envConfig = process.env.NODE_ENV === 'production' 
    ? SecurityConfig.production 
    : SecurityConfig.development;

  // Deep merge configurations
  return mergeDeep(baseConfig, envConfig);
}

/**
 * Deep merge utility for configuration objects
 */
function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export type SecurityConfigType = typeof SecurityConfig;