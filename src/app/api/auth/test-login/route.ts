import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/utils/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Test login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('👤 User lookup result:', { 
      found: !!user, 
      email: user?.email,
      hasPassword: !!user?.password 
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await compare(password, user.password);
    console.log('🔑 Password check:', { 
      isValid: isPasswordValid,
      inputLength: password.length,
      hashLength: user.password.length 
    });

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Test login error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}