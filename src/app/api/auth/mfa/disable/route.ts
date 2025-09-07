import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { AuthAuditLogger } from '@/middleware/auth.middleware';
import { z } from 'zod';

const disableMFASchema = z.object({
  password: z.string().min(1, 'Password is required')
});

/**
 * Disable MFA for authenticated user
 */
async function disableMFA(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!req.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { password } = disableMFASchema.parse(body);

    await AuthService.disableMFA(req.user.id, password);

    // Log MFA disable
    await AuthAuditLogger.logAuthEvent(
      req.user.id,
      'mfa_disabled',
      {
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      }
    );

    return NextResponse.json({
      message: 'MFA disabled successfully'
    });

  } catch (error) {
    console.error('MFA disable error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disable MFA' },
      { status: 400 }
    );
  }
}

export const POST = withAuth(disableMFA, { requireAuth: true });