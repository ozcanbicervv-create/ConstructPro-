import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';

/**
 * Get user permissions based on role
 */
async function getUserPermissions(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!req.user?.role) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 400 }
      );
    }

    const permissions = AuthService.getUserPermissions(req.user.role);

    return NextResponse.json({
      role: req.user.role,
      permissions
    });

  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to get permissions' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUserPermissions, { requireAuth: true });