import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// GET /api/positions - List all positions for current company
export const GET = withAuth(async (_request: any, _context: any, auth: any) => {
  try {
    const companyId = auth.user.companyId;

    const positions = await prisma.position.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 },
    );
  }
});
