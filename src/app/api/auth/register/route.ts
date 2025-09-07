import { NextRequest, NextResponse } from "next/server";

import { AuthAuditLogger } from "@/middleware/auth.middleware";
import { AuthService } from "@/services/auth.service";
import { signUpSchema } from "@/utils/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    const result = await AuthService.register({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      company: validatedData.company,
      title: validatedData.title,
      phone: validatedData.phone,
      role: validatedData.role,
    });

    // Log successful registration
    await AuthAuditLogger.logAuthEvent(
      result.user.id,
      'login', // Registration automatically logs in
      {
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        registrationFlow: true
      }
    );

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: result.user,
        accessToken: result.accessToken,
      },
      { status: 201 }
    );

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}