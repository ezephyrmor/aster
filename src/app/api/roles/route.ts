import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// GET /api/roles - List all roles for current company
export const GET = withAuth(async (_request: any, _context: any, auth: any) => {
  try {
    const companyId = auth.user.companyId;

    const roles = await prisma.role.findMany({
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

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
});
