import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// GET /api/my-infractions - Get current user's infractions
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from NextAuth session
    const authResult = await requireAuth(request);

    // If authentication failed, return the error response
    if (authResult instanceof Response) {
      return authResult;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: {
      userId: string;
      acknowledgedBy?: string | null | { not: null };
    } = {
      userId: authResult.userId,
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
