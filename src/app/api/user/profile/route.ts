import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/utils/db";
import { updateProfileSchema } from "@/utils/validations/auth";
import { authOptions } from "@/utils/auth";
import { applyRateLimit, RateLimitConfigs } from "@/utils/security/rate-limiting";
import { applyApiSecurityHeaders } from "@/utils/security/headers";
import { sanitizeText } from "@/utils/security/input-validation";

export async function PATCH(request: NextRequest) {
  try {
    return await applyRateLimit(
      request,
      RateLimitConfigs.api,
      async (req) => {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
          const response = NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
          );
          return applyApiSecurityHeaders(response);
        }

        const body = await req.json();
        const validatedData = updateProfileSchema.parse(body);

        // Sanitize input data
        const sanitizedData = {
          firstName: validatedData.firstName ? sanitizeText(validatedData.firstName) : undefined,
          lastName: validatedData.lastName ? sanitizeText(validatedData.lastName) : undefined,
          company: validatedData.company ? sanitizeText(validatedData.company) : undefined,
          title: validatedData.title ? sanitizeText(validatedData.title) : undefined,
          phone: validatedData.phone,
          theme: validatedData.theme,
          language: validatedData.language,
        };

        // Update the user
        const updatedUser = await prisma.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            firstName: sanitizedData.firstName,
            lastName: sanitizedData.lastName,
            name: sanitizedData.firstName && sanitizedData.lastName 
              ? `${sanitizedData.firstName} ${sanitizedData.lastName}`
              : undefined,
            company: sanitizedData.company,
            title: sanitizedData.title,
            phone: sanitizedData.phone,
            theme: sanitizedData.theme,
            language: sanitizedData.language,
          },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            company: true,
            title: true,
            phone: true,
            role: true,
            theme: true,
            language: true,
            image: true,
          },
        });

        const response = NextResponse.json(updatedUser);
        return applyApiSecurityHeaders(response);
      }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    
    let response;
    if (error instanceof Error) {
      response = NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    } else {
      response = NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
    
    return applyApiSecurityHeaders(response);
  }
}

export async function GET(request: NextRequest) {
  try {
    return await applyRateLimit(
      request,
      RateLimitConfigs.api,
      async (req) => {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
          const response = NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
          );
          return applyApiSecurityHeaders(response);
        }

        const user = await prisma.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            company: true,
            title: true,
            phone: true,
            role: true,
            theme: true,
            language: true,
            image: true,
            isOnline: true,
            lastActive: true,
            createdAt: true,
          },
        });

        if (!user) {
          const response = NextResponse.json(
            { message: "User not found" },
            { status: 404 }
          );
          return applyApiSecurityHeaders(response);
        }

        const response = NextResponse.json(user);
        return applyApiSecurityHeaders(response);
      }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    const response = NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
    return applyApiSecurityHeaders(response);
  }
}