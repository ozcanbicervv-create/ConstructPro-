import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth.middleware';
import { withSecurity } from '@/middleware/security.middleware';
import { ApiKeyService } from '@/middleware/api-key.middleware';
import { validateRequestBody } from '@/utils/security/input-validation';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  type: z.enum(['USER', 'SYSTEM']).default('USER'),
  expiresAt: z.string().datetime().optional()
});

/**
 * GET /api/auth/api-keys - List user's API keys
 */
export const GET = withSecurity(
  withAuth(async (req) => {
    try {
      const user = (req as any).user;
      
      const apiKeys = await ApiKeyService.listUserApiKeys(user.id);
      
      return NextResponse.json({
        success: true,
        data: apiKeys
      });

    } catch (error) {
      console.error('Failed to list API keys:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve API keys' },
        { status: 500 }
      );
    }
  }, {
    requireAuth: true
  }),
  {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30
    }
  }
);

/**
 * POST /api/auth/api-keys - Create new API key
 */
export const POST = withSecurity(
  withAuth(async (req) => {
    try {
      const user = (req as any).user;
      
      const validation = await validateRequestBody(req, createApiKeySchema);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      const { name, permissions, type, expiresAt } = validation.data;

      // Only admins can create system keys
      if (type === 'SYSTEM' && user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: 'Only administrators can create system API keys' },
          { status: 403 }
        );
      }

      // Set expiration date
      const expiration = expiresAt 
        ? new Date(expiresAt)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default

      const result = await ApiKeyService.createApiKey({
        name,
        permissions,
        type,
        userId: type === 'USER' ? user.id : undefined,
        expiresAt: expiration
      });

      return NextResponse.json({
        success: true,
        data: {
          apiKey: result.apiKey,
          key: result.key // Only returned once
        }
      }, { status: 201 });

    } catch (error) {
      console.error('Failed to create API key:', error);
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }
  }, {
    requireAuth: true
  }),
  {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5 // Limit API key creation
    }
  }
);