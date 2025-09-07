import { UserRole } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { AuthService } from '@/services/auth.service';
import { prisma } from '@/utils/db';
import { validateRequestBody, sanitizeText } from '@/utils/security/input-validation';
import { createRateLimit, RateLimitConfigs } from '@/utils/security/rate-limiting';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

/**
 * Authentication middleware for API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { requireAuth = true, requiredRole, requiredPermission } = options;

    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (requireAuth && !token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (token) {
        try {
          // Verify JWT token
          const payload = verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret') as any;
          
          // Get user from database
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
              id: true,
              email: true,
              role: true,
              isOnline: true,
              lastActive: true
            }
          });

          if (!user) {
            return NextResponse.json(
              { error: 'User not found' },
              { status: 401 }
            );
          }

          // Update last active timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastActive: new Date(),
              isOnline: true
            }
          });

          // Attach user to request
          (req as AuthenticatedRequest).user = {
            id: user.id,
            email: user.email,
            role: user.role
          };

          // Check role requirement
          if (requiredRole && user.role !== requiredRole) {
            // Allow higher privilege roles
            const roleHierarchy: UserRole[] = [
              UserRole.WORKER,
              UserRole.SUPPLIER,
              UserRole.CLIENT,
              UserRole.SITE_SUPERVISOR,
              UserRole.PROJECT_MANAGER,
              UserRole.ADMIN
            ];

            const userRoleIndex = roleHierarchy.indexOf(user.role);
            const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

            if (userRoleIndex < requiredRoleIndex) {
              return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
              );
            }
          }

          // Check specific permission
          if (requiredPermission) {
            const hasPermission = AuthService.checkPermission(
              user.role,
              requiredPermission.resource,
              requiredPermission.action
            );

            if (!hasPermission) {
              return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
              );
            }
          }

        } catch (tokenError) {
          if (requireAuth) {
            return NextResponse.json(
              { error: 'Invalid token' },
              { status: 401 }
            );
          }
        }
      }

      // Call the handler
      return await handler(req as AuthenticatedRequest);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Session management utilities
 */
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Check if user session is active
   */
  static async isSessionActive(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActive: true, isOnline: true }
    });

    if (!user || !user.isOnline) {
      return false;
    }

    const timeSinceLastActive = Date.now() - user.lastActive.getTime();
    return timeSinceLastActive < this.SESSION_TIMEOUT;
  }

  /**
   * Cleanup inactive sessions
   */
  static async cleanupInactiveSessions(): Promise<void> {
    const cutoffTime = new Date(Date.now() - this.SESSION_TIMEOUT);

    await prisma.user.updateMany({
      where: {
        isOnline: true,
        lastActive: {
          lt: cutoffTime
        }
      },
      data: {
        isOnline: false
      }
    });
  }

  /**
   * Force logout user
   */
  static async forceLogout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false }
    });
  }

  /**
   * Get active sessions count
   */
  static async getActiveSessionsCount(): Promise<number> {
    return await prisma.user.count({
      where: { isOnline: true }
    });
  }
}

/**
 * Audit logging for authentication events
 */
export class AuthAuditLogger {
  /**
   * Log authentication event
   */
  static async logAuthEvent(
    userId: string,
    event: 'login' | 'logout' | 'mfa_enabled' | 'mfa_disabled' | 'password_changed' | 'failed_login',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { getAuditLogger } = await import('@/utils/audit-logger');
      const auditLogger = getAuditLogger();

      // Map events to audit event types
      const eventMap = {
        'login': 'LOGIN_SUCCESS' as const,
        'logout': 'LOGOUT' as const,
        'mfa_enabled': 'MFA_ENABLED' as const,
        'mfa_disabled': 'MFA_DISABLED' as const,
        'password_changed': 'PASSWORD_CHANGE' as const,
        'failed_login': 'LOGIN_FAILURE' as const
      };

      await auditLogger.logAuth(
        eventMap[event],
        userId,
        metadata
      );

    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }
}