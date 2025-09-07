import { NextRequest, NextResponse } from 'next/server';

import { withAuth, AuthenticatedRequest , AuthAuditLogger } from '@/middleware/auth.middleware';
import { AuthService } from '@/services/auth.service';

/**
 * Setup MFA for authenticated user
 */
async function setupMFA(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!req.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const mfaSetup = await AuthService.enableMFA(req.user.id);

    // Log MFA setup attempt
    await AuthAuditLogger.logAuthEvent(
      req.user.id,
      'mfa_enabled',
      {
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      }
    );

    return NextResponse.json({
      message: 'MFA setup initiated',
      secret: mfaSetup.secret,
      qrCodeUrl: mfaSetup.qrCodeUrl,
      backupCodes: mfaSetup.backupCodes
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup MFA' },
      { status: 400 }
    );
  }
}

export const POST = withAuth(setupMFA, { requireAuth: true });