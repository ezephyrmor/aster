import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/leaves/statuses - Get all leave statuses
export async function GET() {
  try {
    const leaveStatuses = await prisma.leaveStatus.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(leaveStatuses);
  } catch (error) {
    console.error("Error fetching leave statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave statuses" },
      { status: 500 },
    );
  }
}
