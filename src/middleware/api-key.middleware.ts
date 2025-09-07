import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { createHash, randomBytes } from 'crypto';

/**
 * API Key authentication middleware for third-party integrations
 */

export interface ApiKeyRequest extends NextRequest {
  apiKey?: {
    id: string;
    name: string;
    permissions: string[];
    userId?: string;
    lastUsed: Date;
  };
}

export interface ApiKeyOptions {
  requiredPermissions?: string[];
  allowUserKeys?: boolean;
  allowSystemKeys?: boolean;
}

/**
 * API Key authentication middleware
 */
export function withApiKey(
  handler: (req: ApiKeyRequest) => Promise<NextResponse>,
  options: ApiKeyOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { 
      requiredPermissions = [],
      allowUserKeys = true,
      allowSystemKeys = true 
    } = options;

    try {
      // Extract API key from header
      const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!apiKeyHeader) {
        return NextResponse.json(
          { error: 'API key required' },
          { status: 401 }
        );
      }

      // Hash the provided key for database lookup
      const hashedKey = createHash('sha256').update(apiKeyHeader).digest('hex');

      // Find API key in database
      const apiKey = await prisma.apiKey.findUnique({
        where: { 
          hashedKey,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isOnline: true
            }
          }
        }
      });

      if (!apiKey) {
        // Log failed API key attempt
        await AuditLogger.logApiKeyEvent(null, 'invalid_key_attempt', {
          providedKey: apiKeyHeader.substring(0, 8) + '...',
          ipAddress: getClientIP(req),
          userAgent: req.headers.get('user-agent')
        });

        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Check key type permissions
      if (apiKey.type === 'USER' && !allowUserKeys) {
        return NextResponse.json(
          { error: 'User API keys not allowed for this endpoint' },
          { status: 403 }
        );
      }

      if (apiKey.type === 'SYSTEM' && !allowSystemKeys) {
        return NextResponse.json(
          { error: 'System API keys not allowed for this endpoint' },
          { status: 403 }
        );
      }

      // Check required permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          apiKey.permissions.includes(permission) || apiKey.permissions.includes('*')
        );

        if (!hasAllPermissions) {
          await AuditLogger.logApiKeyEvent(apiKey.id, 'insufficient_permissions', {
            requiredPermissions,
            availablePermissions: apiKey.permissions,
            ipAddress: getClientIP(req),
            userAgent: req.headers.get('user-agent')
          });

          return NextResponse.json(
            { error: 'Insufficient API key permissions' },
            { status: 403 }
          );
        }
      }

      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { 
          lastUsed: new Date(),
          usageCount: {
            increment: 1
          }
        }
      });

      // Log successful API key usage
      await AuditLogger.logApiKeyEvent(apiKey.id, 'key_used', {
        endpoint: req.nextUrl.pathname,
        method: req.method,
        ipAddress: getClientIP(req),
        userAgent: req.headers.get('user-agent')
      });

      // Attach API key info to request
      (req as ApiKeyRequest).apiKey = {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        userId: apiKey.userId || undefined,
        lastUsed: apiKey.lastUsed
      };

      return await handler(req as ApiKeyRequest);

    } catch (error) {
      console.error('API key middleware error:', error);
      return NextResponse.json(
        { error: 'API key validation failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * API Key management service
 */
export class ApiKeyService {
  /**
   * Generate a new API key
   */
  static generateApiKey(): { key: string; hashedKey: string } {
    const key = `ck_${randomBytes(32).toString('hex')}`;
    const hashedKey = createHash('sha256').update(key).digest('hex');
    return { key, hashedKey };
  }

  /**
   * Create a new API key
   */
  static async createApiKey(data: {
    name: string;
    permissions: string[];
    type: 'USER' | 'SYSTEM';
    userId?: string;
    expiresAt?: Date;
  }) {
    const { key, hashedKey } = this.generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        name: data.name,
        hashedKey,
        permissions: data.permissions,
        type: data.type,
        userId: data.userId,
        expiresAt: data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        isActive: true,
        usageCount: 0
      }
    });

    // Log API key creation
    await AuditLogger.logApiKeyEvent(apiKey.id, 'key_created', {
      name: data.name,
      type: data.type,
      permissions: data.permissions,
      userId: data.userId
    });

    return { apiKey, key }; // Return the plain key only once
  }

  /**
   * Revoke an API key
   */
  static async revokeApiKey(keyId: string, revokedBy?: string) {
    const apiKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { 
        isActive: false,
        revokedAt: new Date(),
        revokedBy
      }
    });

    await AuditLogger.logApiKeyEvent(keyId, 'key_revoked', {
      revokedBy,
      revokedAt: new Date()
    });

    return apiKey;
  }

  /**
   * List API keys for a user
   */
  static async listUserApiKeys(userId: string) {
    return await prisma.apiKey.findMany({
      where: { 
        userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        permissions: true,
        type: true,
        lastUsed: true,
        usageCount: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get API key usage statistics
   */
  static async getApiKeyStats(keyId: string) {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      select: {
        id: true,
        name: true,
        usageCount: true,
        lastUsed: true,
        createdAt: true
      }
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Get usage over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // This would require an audit log table to track detailed usage
    // For now, return basic stats
    return {
      ...apiKey,
      dailyUsage: [], // Would be populated from audit logs
      totalRequests: apiKey.usageCount
    };
  }
}

/**
 * Audit logging for API key events
 */
class AuditLogger {
  static async logApiKeyEvent(
    keyId: string | null,
    event: 'key_created' | 'key_used' | 'key_revoked' | 'invalid_key_attempt' | 'insufficient_permissions',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        keyId,
        event,
        metadata: {
          ...metadata,
          timestamp: new Date()
        }
      };

      console.log('API_KEY_AUDIT:', JSON.stringify(logEntry));

      // TODO: Store in dedicated audit log table
      // await prisma.apiKeyAuditLog.create({
      //   data: {
      //     keyId,
      //     event,
      //     metadata: logEntry.metadata,
      //     timestamp: new Date()
      //   }
      // });

    } catch (error) {
      console.error('Failed to log API key event:', error);
    }
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return req.headers.get('x-real-ip') || 
         req.ip || 
         'unknown';
}

/**
 * Predefined API key permissions
 */
export const ApiKeyPermissions = {
  // Project permissions
  'projects:read': 'Read project information',
  'projects:write': 'Create and update projects',
  'projects:delete': 'Delete projects',
  
  // Task permissions
  'tasks:read': 'Read task information',
  'tasks:write': 'Create and update tasks',
  'tasks:delete': 'Delete tasks',
  
  // Material permissions
  'materials:read': 'Read material information',
  'materials:write': 'Create and update materials',
  'materials:delete': 'Delete materials',
  
  // Document permissions
  'documents:read': 'Read document information',
  'documents:write': 'Upload and update documents',
  'documents:delete': 'Delete documents',
  
  // User permissions
  'users:read': 'Read user information',
  'users:write': 'Update user information',
  
  // Admin permissions
  'admin:*': 'Full administrative access',
  '*': 'Full access to all resources'
} as const;

export type ApiKeyPermission = keyof typeof ApiKeyPermissions;
export type { ApiKeyRequest, ApiKeyOptions };