import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/my-infractions/[id] - Get a specific infraction for current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Get current user from cookie
    const userCookie = request.cookies.get("user")?.value;

    if (!userCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = JSON.parse(userCookie);

    // Fetch infraction for current user only
    const infraction = await prisma.infraction.findFirst({
      where: {
        id,
        userId: user.id, // Only allow users to see their own infractions
      },
      include: {
        offense: {
          include: {
            type: true,
          },
        },
        type: true,
        ackUser: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    if (!infraction) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(infraction);
  } catch (error) {
    console.error("Error fetching infraction:", error);
    return NextResponse.json(
      { error: "Failed to fetch infraction" },
      { status: 500 },
    );
  }
}
