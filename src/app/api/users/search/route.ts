import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/users/search - Search for employees (for team member autocomplete)
// Query params: q (search query), teamId (optional - to show if user is already in this team)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const teamId = searchParams.get("teamId");

    // Build where clause for search
    const whereClauses: {
      OR?: Array<{
        employeeProfile?: {
          firstName?: { contains: string };
          lastName?: { contains: string };
        };
        username?: { contains: string };
      }>;
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

    // Combine all where clauses with AND
    const where =
      whereClauses.length > 0
        ? whereClauses.length === 1
          ? whereClauses[0]
          : { AND: whereClauses }
        : {};

    // Get users with employee profile and team members
    const users = await prisma.user.findMany({
      where,
      include: {
        employeeProfile: {
          include: {
            position: true,
            department: true,
          },
        },
        teamMembers: {
          where: {
            leftAt: null, // Only active team memberships
          },
          include: {
            team: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
      take: 20, // Limit results for autocomplete
      orderBy: [
        { employeeProfile: { firstName: "asc" } },
        { employeeProfile: { lastName: "asc" } },
      ],
    });

    // Parse teamId if provided
    const teamIdNum = teamId ? parseInt(teamId) : null;

    // Format response for autocomplete
    const results = users.map((user) => {
      // Get active team membership (if any)
      const activeMembership = user.teamMembers.find(
        (tm) => tm.leftAt === null,
      );

      // Check if user is already in the specified team
      const isInSpecifiedTeam =
        teamIdNum && activeMembership && activeMembership.teamId === teamIdNum;

      return {
        id: user.id,
        username: user.username,
        displayName: user.employeeProfile
          ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`
          : user.username,
        position: user.employeeProfile?.position?.name || null,
        department: user.employeeProfile?.department?.name || null,
        currentTeam: activeMembership
          ? {
              teamId: activeMembership.teamId,
              teamName: activeMembership.team.name,
              brandName: activeMembership.team.brand.name,
              isLeader: activeMembership.isLeader,
              status: activeMembership.status,
              isInSpecifiedTeam: isInSpecifiedTeam || false,
            }
          : null,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 },
    );
  }
}
