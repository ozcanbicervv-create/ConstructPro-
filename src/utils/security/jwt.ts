import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

/**
 * JWT token handling utilities for ConstructPro
 * Provides secure token generation, validation, and management
 */

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);
const JWT_ISSUER = 'constructpro';
const JWT_AUDIENCE = 'constructpro-users';

// Token expiration times
export const TokenExpiration = {
  ACCESS_TOKEN: '15m', // 15 minutes
  REFRESH_TOKEN: '7d', // 7 days
  RESET_TOKEN: '1h', // 1 hour
  VERIFICATION_TOKEN: '24h', // 24 hours
} as const;

// Token types
export type TokenType = 'access' | 'refresh' | 'reset' | 'verification';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: TokenType;
  sessionId?: string;
  permissions?: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Generates a JWT token with specified payload and expiration
 */
export async function generateToken(
  payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  expiresIn: string = TokenExpiration.ACCESS_TOKEN
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  return new SignJWT({
    ...payload,
    iat: now,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generates an access token and refresh token pair
 */
export async function generateTokenPair(
  userId: string,
  email: string,
  role: string,
  sessionId: string,
  permissions: string[] = []
): Promise<TokenPair> {
  const basePayload = {
    userId,
    email,
    role,
    sessionId,
    permissions,
  };

  const [accessToken, refreshToken] = await Promise.all([
    generateToken(
      { ...basePayload, type: 'access' },
      TokenExpiration.ACCESS_TOKEN
    ),
    generateToken(
      { ...basePayload, type: 'refresh' },
      TokenExpiration.REFRESH_TOKEN
    ),
  ]);

  // Calculate expiration time for access token (15 minutes from now)
  const expiresAt = Date.now() + 15 * 60 * 1000;

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Refreshes an access token using a refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const payload = await verifyToken(refreshToken);
  
  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  // Generate new token pair
  return generateTokenPair(
    payload.userId,
    payload.email,
    payload.role,
    payload.sessionId || '',
    payload.permissions || []
  );
}

/**
 * Extracts token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Validates request authentication and returns user payload
 */
export async function validateRequestAuth(request: NextRequest): Promise<TokenPayload | null> {
  const token = extractTokenFromHeader(request);
  
  if (!token) {
    return null;
  }
  
  const payload = await verifyToken(token);
  
  if (!payload || payload.type !== 'access') {
    return null;
  }
  
  return payload;
}

/**
 * Generates a password reset token
 */
export async function generateResetToken(userId: string, email: string): Promise<string> {
  return generateToken(
    {
      userId,
      email,
      role: 'user', // Generic role for reset tokens
      type: 'reset',
    },
    TokenExpiration.RESET_TOKEN
  );
}

/**
 * Generates an email verification token
 */
export async function generateVerificationToken(userId: string, email: string): Promise<string> {
  return generateToken(
    {
      userId,
      email,
      role: 'user', // Generic role for verification tokens
      type: 'verification',
    },
    TokenExpiration.VERIFICATION_TOKEN
  );
}

/**
 * Validates a reset token
 */
export async function validateResetToken(token: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);
  
  if (!payload || payload.type !== 'reset') {
    return null;
  }
  
  return payload;
}

/**
 * Validates a verification token
 */
export async function validateVerificationToken(token: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);
  
  if (!payload || payload.type !== 'verification') {
    return null;
  }
  
  return payload;
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(payload: TokenPayload): boolean {
  if (!payload.exp) {
    return true;
  }
  
  return Date.now() >= payload.exp * 1000;
}

/**
 * Gets token expiration time in milliseconds
 */
export function getTokenExpiration(payload: TokenPayload): number | null {
  if (!payload.exp) {
    return null;
  }
  
  return payload.exp * 1000;
}

/**
 * Creates a secure session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('');
  
  return `${timestamp}-${randomString}`;
}

/**
 * Token blacklist for logout functionality (in production, use Redis)
 */
const tokenBlacklist = new Set<string>();

/**
 * Adds a token to the blacklist
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
  
  // Clean up expired tokens periodically
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 15 * 60 * 1000); // Remove after 15 minutes (access token expiry)
}

/**
 * Checks if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

/**
 * Middleware helper for JWT authentication
 */
export async function requireAuth(
  request: NextRequest,
  requiredRole?: string,
  requiredPermissions?: string[]
): Promise<{ success: true; user: TokenPayload } | { success: false; error: string }> {
  const token = extractTokenFromHeader(request);
  
  if (!token) {
    return { success: false, error: 'No authentication token provided' };
  }
  
  if (isTokenBlacklisted(token)) {
    return { success: false, error: 'Token has been revoked' };
  }
  
  const payload = await verifyToken(token);
  
  if (!payload || payload.type !== 'access') {
    return { success: false, error: 'Invalid or expired token' };
  }
  
  if (isTokenExpired(payload)) {
    return { success: false, error: 'Token has expired' };
  }
  
  // Check role requirement
  if (requiredRole && payload.role !== requiredRole && payload.role !== 'ADMIN') {
    return { success: false, error: 'Insufficient permissions' };
  }
  
  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = payload.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission) || payload.role === 'ADMIN'
    );
    
    if (!hasAllPermissions) {
      return { success: false, error: 'Insufficient permissions' };
    }
  }
  
  return { success: true, user: payload };
}

export type { TokenPayload, TokenPair, TokenType };