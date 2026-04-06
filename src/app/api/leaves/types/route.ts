import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/leaves/types - Get all active leave types
export async function GET() {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(leaveTypes);
  } catch (error) {
    console.error("Error fetching leave types:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave types" },
      { status: 500 },
    );
  }
}
