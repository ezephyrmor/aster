import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/users/search - Search for employees (for team member autocomplete)
// Query params: q (search query), teamId (optional - exclude members of this team)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const teamId = searchParams.get("teamId");

    // Build where clause
    const whereClauses: {
      OR?: Array<{
        employeeProfile?: {
          firstName?: { contains: string };
          lastName?: { contains: string };
        };
        username?: { contains: string };
      }>;
      teamMember?: { is: null };
    }[] = [];

    // Search filter (employee name or username)
    if (query) {
      const searchLower = query.toLowerCase();
      whereClauses.push({
        OR: [
          {
            employeeProfile: {
              firstName: { contains: searchLower },
            },
          },
          {
            employeeProfile: {
              lastName: { contains: searchLower },
            },
          },
          {
            username: { contains: searchLower },
          },
        ],
      });
    }

    // Exclude users who are already members of the specified team
    if (teamId) {
      const teamIdNum = parseInt(teamId);
      if (!isNaN(teamIdNum)) {
        whereClauses.push({
          teamMember: {
            is: null, // Only users who are NOT team members
          },
        });
      }
    }

    // Combine all where clauses with AND
    const where =
      whereClauses.length > 0
        ? whereClauses.length === 1
          ? whereClauses[0]
          : { AND: whereClauses }
        : {};

    // Get users with employee profile
    const users = await prisma.user.findMany({
      where,
      include: {
        employeeProfile: true,
      },
      take: 10, // Limit results for autocomplete
      orderBy: [
        { employeeProfile: { firstName: "asc" } },
        { employeeProfile: { lastName: "asc" } },
      ],
    });

    // Format response for autocomplete
    const results = users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.employeeProfile
        ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`
        : user.username,
      position: user.employeeProfile?.position || null,
      department: user.employeeProfile?.department || null,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 },
    );
  }
}
