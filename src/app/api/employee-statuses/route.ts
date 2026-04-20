import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// GET /api/employee-statuses - List all employee statuses
export const GET = withAuth(async (_request: any, _context: any, auth: any) => {
  try {
    const statuses = await prisma.employeeStatusModel.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching employee statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee statuses" },
      { status: 500 },
    );
  }
});
