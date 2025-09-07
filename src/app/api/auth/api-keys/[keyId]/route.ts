import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { withSecurity } from '@/middleware/security.middleware';
import { ApiKeyService } from '@/middleware/api-key.middleware';
import { prisma } from '@/utils/db';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: {
    keyId: string;
  };
}

/**
 * GET /api/auth/api-keys/[keyId] - Get API key details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  return withSecurity(
    withAuth(async (req) => {
      try {
        const user = (req as any).user;
        const { keyId } = params;

        const apiKey = await prisma.apiKey.findUnique({
          where: { id: keyId },
          select: {
            id: true,
            name: true,
            permissions: true,
            type: true,
            userId: true,
            lastUsed: true,
            usageCount: true,
            createdAt: true,
            expiresAt: true,
            isActive: true
          }
        });

        if (!apiKey) {
          return NextResponse.json(
            { error: 'API key not found' },
            { status: 404 }
          );
        }

        // Check ownership or admin access
        if (apiKey.userId !== user.id && user.role !== UserRole.ADMIN) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }

        const stats = await ApiKeyService.getApiKeyStats(keyId);

        return NextResponse.json({
          success: true,
          data: {
            ...apiKey,
            stats
          }
        });

      } catch (error) {
        console.error('Failed to get API key:', error);
        return NextResponse.json(
          { error: 'Failed to retrieve API key' },
          { status: 500 }
        );
      }
    }, {
      requireAuth: true
    }),
    {
      rateLimit: {
        windowMs: 60 * 1000,
        maxRequests: 60
      }
    }
  )(req);
}

/**
 * DELETE /api/auth/api-keys/[keyId] - Revoke API key
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return withSecurity(
    withAuth(async (req) => {
      try {
        const user = (req as any).user;
        const { keyId } = params;

        const apiKey = await prisma.apiKey.findUnique({
          where: { id: keyId },
          select: {
            id: true,
            userId: true,
            name: true
          }
        });

        if (!apiKey) {
          return NextResponse.json(
            { error: 'API key not found' },
            { status: 404 }
          );
        }

        // Check ownership or admin access
        if (apiKey.userId !== user.id && user.role !== UserRole.ADMIN) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }

        await ApiKeyService.revokeApiKey(keyId, user.id);

        return NextResponse.json({
          success: true,
          message: 'API key revoked successfully'
        });

      } catch (error) {
        console.error('Failed to revoke API key:', error);
        return NextResponse.json(
          { error: 'Failed to revoke API key' },
          { status: 500 }
        );
      }
    }, {
      requireAuth: true
    }),
    {
      rateLimit: {
        windowMs: 60 * 1000,
        maxRequests: 10
      }
    }
  )(req);
}