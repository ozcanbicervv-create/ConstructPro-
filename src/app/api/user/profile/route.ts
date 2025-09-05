import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update the user
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        name: validatedData.firstName && validatedData.lastName 
          ? `${validatedData.firstName} ${validatedData.lastName}`
          : undefined,
        company: validatedData.company,
        title: validatedData.title,
        phone: validatedData.phone,
        theme: validatedData.theme,
        language: validatedData.language,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}