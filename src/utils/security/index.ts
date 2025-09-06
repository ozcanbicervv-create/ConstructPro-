/**
 * Security utilities index for ConstructPro
 * Centralized exports for all security-related functionality
 */

// Configuration
export { SecurityConfig, getSecurityConfig } from './config';
export type { SecurityConfigType } from './config';

// Input validation and sanitization
export {
  ValidationPatterns,
  BaseSchemas,
  ApiSchemas,
  ConstructionSchemas,
  sanitizeHtml,
  sanitizeText,
  sanitizeFilename,
  validateRequestBody,
  validateQueryParams,
} from './input-validation';
export type { ValidationResult } from './input-validation';

// Rate limiting
export {
  createRateLimit,
  createIPRateLimit,
  createUserRateLimit,
  withRateLimit,
  applyRateLimit,
  RateLimitConfigs,
} from './rate-limiting';
export type { RateLimitConfig, RateLimitEntry } from './rate-limiting';

// Security headers
export {
  defaultSecurityConfig,
  developmentSecurityConfig,
  applySecurityHeaders,
  createSecurityHeadersMiddleware,
  applyApiSecurityHeaders,
  applyUploadSecurityHeaders,
} from './headers';
export type { SecurityHeadersConfig } from './headers';

// JWT and authentication
export {
  generateToken,
  verifyToken,
  generateTokenPair,
  refreshAccessToken,
  extractTokenFromHeader,
  validateRequestAuth,
  generateResetToken,
  generateVerificationToken,
  validateResetToken,
  validateVerificationToken,
  isTokenExpired,
  getTokenExpiration,
  generateSessionId,
  blacklistToken,
  isTokenBlacklisted,
  requireAuth,
  TokenExpiration,
} from './jwt';
export type { TokenPayload, TokenPair, TokenType } from './jwt';

// Vulnerability scanning
export {
  scanDependencies,
  validateSecurityPolicy,
  generateSecurityReport,
  saveSecurityReport,
  runSecurityScan,
  securityGate,
  defaultSecurityPolicy,
} from './vulnerability-scanner';
export type { 
  VulnerabilityReport, 
  VulnerabilityDetail, 
  SecurityPolicy 
} from './vulnerability-scanner';

/**
 * Security middleware factory
 * Creates a comprehensive security middleware with all features
 */
export function createSecurityMiddleware(options: {
  rateLimit?: boolean;
  auth?: boolean;
  headers?: boolean;
  validation?: boolean;
} = {}) {
  const {
    rateLimit = true,
    auth = true,
    headers = true,
    validation = true,
  } = options;

  return {
    rateLimit: rateLimit ? createRateLimit : null,
    auth: auth ? requireAuth : null,
    headers: headers ? applySecurityHeaders : null,
    validation: validation ? validateRequestBody : null,
  };
}

/**
 * Security utilities for common use cases
 */
export const SecurityUtils = {
  // Quick validation helpers
  isValidEmail: (email: string) => BaseSchemas.email.safeParse(email).success,
  isValidPassword: (password: string) => BaseSchemas.password.safeParse(password).success,
  isValidUUID: (id: string) => BaseSchemas.id.safeParse(id).success,
  isValidURL: (url: string) => BaseSchemas.url.safeParse(url).success,

  // Quick sanitization helpers
  sanitize: {
    html: sanitizeHtml,
    text: sanitizeText,
    filename: sanitizeFilename,
  },

  // Security checks
  checkPasswordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

    return { checks, score, strength };
  },

  // Generate secure random values
  generateSecureId: () => crypto.randomUUID(),
  generateSecureToken: (length = 32) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
};

/**
 * Security constants
 */
export const SecurityConstants = {
  // HTTP status codes
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    TOO_MANY_REQUESTS: 429,
    UNPROCESSABLE_ENTITY: 422,
  },

  // Error messages
  ERRORS: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Insufficient permissions',
    RATE_LIMITED: 'Too many requests',
    INVALID_INPUT: 'Invalid input data',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
  },

  // Security headers
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    X_RATE_LIMIT: 'X-RateLimit-Limit',
    X_RATE_REMAINING: 'X-RateLimit-Remaining',
    X_RATE_RESET: 'X-RateLimit-Reset',
  },
} as const;