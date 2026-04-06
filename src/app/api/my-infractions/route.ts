import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/my-infractions - Get current user's infractions
export async function GET(request: NextRequest) {
  try {
    // Get current user from cookie
    const userCookie = request.cookies.get("user")?.value;

    if (!userCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = JSON.parse(userCookie);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: {
      userId: number;
      acknowledgedBy?: number | null | { not: null };
    } = {
      userId: user.id,
    };

    // Filter by status if provided
    if (status === "pending") {
      where.acknowledgedBy = null;
    } else if (status === "acknowledged") {
      where.acknowledgedBy = { not: null };
    }

    // Fetch infractions for current user
    const infractions = await prisma.infraction.findMany({
      where,
      include: {
        offense: {
          include: {
            type: true,
          },
        },
        type: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(infractions);
  } catch (error) {
    console.error("Error fetching user infractions:", error);
    return NextResponse.json(
      { error: "Failed to fetch infractions" },
      { status: 500 },
    );
  }
}
