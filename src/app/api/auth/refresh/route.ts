import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

/**
 * Refresh access token using refresh token
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.get('refreshToken')?.value || 
                        (await req.json().catch(() => ({})))?.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 401 }
      );
    }

    const result = await AuthService.refreshToken(refreshToken);

    // Set new refresh token cookie
    const response = NextResponse.json({
      message: 'Token refreshed successfully',
      user: result.user,
      accessToken: result.accessToken
    });

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear invalid refresh token cookie
    const response = NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );

    response.cookies.delete('refreshToken');
    
    return response;
  }
}