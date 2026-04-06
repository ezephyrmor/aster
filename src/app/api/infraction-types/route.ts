import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/infraction-types - Get all infraction types
export async function GET() {
  try {
    const types = await prisma.infractionType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching infraction types:", error);
    return NextResponse.json(
      { error: "Failed to fetch infraction types" },
      { status: 500 },
    );
  }
}
