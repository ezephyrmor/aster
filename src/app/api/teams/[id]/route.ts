import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/teams/[id] - Get single team with members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              include: {
                employeeProfile: true,
              },
            },
          },
          orderBy: {
            isLeader: "desc",
          },
        },
        history: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          include: {
            teamMember: {
              include: {
                user: {
                  include: {
                    employeeProfile: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 },
    );
  }
}

// PUT /api/teams/[id] - Update team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const body = await request.json();
    const { name, description, brandId, managerId, status, performedBy } = body;

    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== existingTeam.name) {
      const nameExists = await prisma.team.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Team name already exists" },
          { status: 400 },
        );
      }
    }

    // Track changes for history
    const changes: string[] = [];
    const metadata: Record<string, any> = {};

    if (name && name !== existingTeam.name) {
      changes.push("name");
      metadata.name = { old: existingTeam.name, new: name };
    }

    if (description !== undefined && description !== existingTeam.description) {
      changes.push("description");
      metadata.description = {
        old: existingTeam.description,
        new: description,
      };
    }

    if (brandId !== undefined && parseInt(brandId) !== existingTeam.brandId) {
      changes.push("brand");
      metadata.brandId = { old: existingTeam.brandId, new: parseInt(brandId) };
    }

    // Update team
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: name || existingTeam.name,
        description:
          description !== undefined ? description : existingTeam.description,
        brandId:
          brandId !== undefined ? parseInt(brandId) : existingTeam.brandId,
        managerId,
        status,
      },
    });

    // Log history if any changes were made
    if (changes.length > 0) {
      await prisma.teamHistory.create({
        data: {
          teamId,
          action: "updated",
          performedBy: performedBy || 1,
          reason: changes.join(", "),
          metadata,
        },
      });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 },
    );
  }
}

// DELETE /api/teams/[id] - Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Delete team (cascade will handle members and history)
    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({
      message: "Team deleted successfully",
      teamId,
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}
