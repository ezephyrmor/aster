import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/teams - List all teams
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
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
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

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
