import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withAuth, AuthenticatedRequest , AuthAuditLogger } from '@/middleware/auth.middleware';
import { AuthService } from '@/services/auth.service';


const verifyMFASchema = z.object({
  code: z.string().min(6, 'MFA code must be 6 digits').max(6, 'MFA code must be 6 digits')
});

/**
 * Verify MFA code and complete setup
 */
async function verifyMFA(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!req.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = verifyMFASchema.parse(body);

    const isValid = await AuthService.verifyMFA(req.user.id, code);

    if (isValid) {
      // Log successful MFA verification
      await AuthAuditLogger.logAuthEvent(
        req.user.id,
        'mfa_enabled',
        {
          userAgent: req.headers.get('user-agent'),
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          success: true
        }
      );

      return NextResponse.json({
        message: 'MFA enabled successfully',
        success: true
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid MFA code' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify MFA' },
      { status: 400 }
    );
  }
}

export const POST = withAuth(verifyMFA, { requireAuth: true });