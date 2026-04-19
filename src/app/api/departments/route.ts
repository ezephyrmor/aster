import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// GET /api/departments - List all departments for current company
export const GET = withAuth(async (_request: any, _context: any, auth: any) => {
  try {
    const companyId = auth.user.companyId;

    const departments = await prisma.department.findMany({
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

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
  }
});
