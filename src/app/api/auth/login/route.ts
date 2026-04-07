import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { demoStore } from "@/lib/demo/store";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Check if demo mode is enabled
    if (process.env.DEMO_MODE === "true") {
      // Use demo authentication
      const demoUser = demoStore.validateCredentials(username, password);

      if (!demoUser) {
        return NextResponse.json(
          { error: "Invalid credentials. Try admin@demo.com / demo123" },
          { status: 401 },
        );
      }

      const response = NextResponse.json({
        success: true,
        user: demoUser,
      });

      // Set session cookie for demo user (use email as username for compatibility)
      response.cookies.set(
        "user",
        JSON.stringify({ id: demoUser.id, username: demoUser.email }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        },
      );

      return response;
    }

    // Find user in database (including salt for password verification)
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        salt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Verify password using stored salt
    const isValidPassword = await comparePassword(
      password,
      user.passwordHash,
      user.salt,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Create response with user data (excluding password hash)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });

    // Set session cookie (simple implementation - consider using NextAuth for production)
    response.cookies.set(
      "user",
      JSON.stringify({ id: user.id, username: user.username }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      },
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
