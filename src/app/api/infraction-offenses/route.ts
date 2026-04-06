import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/infraction-offenses - Get all infraction offenses
// Query params: typeId (optional) - filter by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get("typeId");

    const where: { isActive: boolean; typeId?: number } = {
      isActive: true,
    };

    if (typeId) {
      where.typeId = parseInt(typeId);
    }

    const offenses = await prisma.infractionOffense.findMany({
      where,
      include: {
        type: true,
      },
      orderBy: [{ type: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json(offenses);
  } catch (error) {
    console.error("Error fetching infraction offenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch infraction offenses" },
      { status: 500 },
    );
  }
}
