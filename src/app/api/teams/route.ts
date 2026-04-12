import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// GET /api/teams - List all teams with pagination, search, and filtering
export const GET = withAuth(
  async (request: NextRequest, _context: any, auth: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const brandId = searchParams.get("brandId") || "";
      let sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = searchParams.get("sortOrder") || "desc";
      const companyId = auth.user.companyId;

      const skip = (page - 1) * limit;

      // Validate sortBy to prevent invalid fields
      const validSortFields = ["name", "createdAt"];
      if (!validSortFields.includes(sortBy)) {
        sortBy = "createdAt";
      }

      // Build where clause for filtering
      const whereClauses: any[] = [];

      // Apply company id filter from current user session
      if (companyId) {
        whereClauses.push({ companyId });
      }

      // Brand filter
      if (brandId) {
        const brandIdNum = parseInt(brandId);
        if (!isNaN(brandIdNum)) {
          whereClauses.push({ brandId: brandIdNum });
        }
      }

      // Search filter (team name)
      if (search) {
        whereClauses.push({
          name: { contains: search.toLowerCase() },
        });
      }

      // Combine all where clauses with AND
      const where =
        whereClauses.length > 0
          ? whereClauses.length === 1
            ? whereClauses[0]
            : { AND: whereClauses }
          : {};

      // Get total count for pagination
      const total = await prisma.team.count({ where });

      // Get teams with pagination
      const teams = await prisma.team.findMany({
        where,
        include: {
          members: {
            include: {
              user: {
                include: {
                  employeeProfile: true,
                },
              },
            },
          },
          brand: true,
          _count: {
            select: { members: true },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      // Get brands for filter
      const brands = await prisma.brand.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        teams,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        brands,
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 },
      );
    }
  },
);

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, brandId, leaderId, performedBy } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 },
      );
    }

    if (!brandId) {
      return NextResponse.json({ error: "Brand is required" }, { status: 400 });
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 400 });
    }

    // Check if team name already exists
    const existingTeam = await prisma.team.findUnique({
      where: { name },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "Team name already exists" },
        { status: 400 },
      );
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name,
        description,
        brandId,
      },
    });

    // Add team leader if provided
    if (leaderId) {
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: leaderId,
          isLeader: true,
        },
      });

      // Log history
      await prisma.teamHistory.create({
        data: {
          teamId: team.id,
          action: "joined",
          performedBy: performedBy || 1, // Default to admin if not provided
          metadata: {
            userId: leaderId,
            isLeader: true,
          },
        },
      });
    }

    // Log team creation
    await prisma.teamHistory.create({
      data: {
        teamId: team.id,
        action: "created",
        performedBy: performedBy || 1,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
