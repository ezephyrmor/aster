import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user's role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id, 10) },
      include: {
        employeeProfile: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        roleId: dbUser.employeeProfile?.roleId,
        role: dbUser.employeeProfile?.role,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
