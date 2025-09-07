import { NextRequest, NextResponse } from 'next/server';

import { withAuth, AuthenticatedRequest , AuthAuditLogger } from '@/middleware/auth.middleware';
import { AuthService } from '@/services/auth.service';

/**
 * Logout user and clear session
 */
async function logout(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (req.user?.id) {
      await AuthService.logout(req.user.id);

      // Log logout
      await AuthAuditLogger.logAuthEvent(
        req.user.id,
        'logout',
        {
          userAgent: req.headers.get('user-agent'),
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
        }
      );
    }

    // Clear refresh token cookie
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(logout, { requireAuth: false });