import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { AuthAuditLogger } from '@/middleware/auth.middleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional()
});

/**
 * Enhanced login with MFA support
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const credentials = loginSchema.parse(body);

    const result = await AuthService.login(credentials);

    // If MFA is required but not provided
    if (result.requiresMFA) {
      return NextResponse.json({
        message: 'MFA code required',
        requiresMFA: true
      }, { status: 200 });
    }

    // Log successful login
    await AuthAuditLogger.logAuthEvent(
      result.user.id,
      'login',
      {
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        mfaUsed: !!credentials.mfaCode
      }
    );

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      message: 'Login successful',
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
    console.error('Login error:', error);

    // Log failed login attempt
    if (error instanceof Error && error.message === 'Invalid credentials') {
      const body = await req.json().catch(() => ({}));
      if (body.email) {
        // Try to find user to log failed attempt
        try {
          const { prisma } = await import('@/utils/db');
          const user = await prisma.user.findUnique({
            where: { email: body.email },
            select: { id: true }
          });

          if (user) {
            await AuthAuditLogger.logAuthEvent(
              user.id,
              'failed_login',
              {
                userAgent: req.headers.get('user-agent'),
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
                reason: 'invalid_credentials'
              }
            );
          }
        } catch (logError) {
          console.error('Failed to log failed login:', logError);
        }
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}