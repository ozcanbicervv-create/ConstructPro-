import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { SessionManager , withAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';


/**
 * Get current session status
 */
async function getSession(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!req.user?.id) {
      return NextResponse.json({
        authenticated: false,
        session: null
      });
    }

    const isActive = await SessionManager.isSessionActive(req.user.id);

    return NextResponse.json({
      authenticated: true,
      session: {
        user: req.user,
        isActive,
        lastActive: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

/**
 * Force logout user (admin only)
 */
async function forceLogout(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await SessionManager.forceLogout(userId);

    return NextResponse.json({
      message: 'User logged out successfully'
    });

  } catch (error) {
    console.error('Force logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout user' },
      { status: 500 }
    );
  }
}

/**
 * Get active sessions count (admin only)
 */
async function getActiveSessions(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const count = await SessionManager.getActiveSessionsCount();

    return NextResponse.json({
      activeSessionsCount: count
    });

  } catch (error) {
    console.error('Get active sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get active sessions' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSession, { requireAuth: false });
export const POST = withAuth(forceLogout, { 
  requireAuth: true, 
  requiredRole: UserRole.ADMIN 
});
export const PUT = withAuth(getActiveSessions, { 
  requireAuth: true, 
  requiredRole: UserRole.ADMIN 
});