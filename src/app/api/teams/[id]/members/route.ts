import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST /api/teams/[id]/members - Add member to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const body = await request.json();
    const { userId, isLeader, reason, performedBy } = body;

    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already in a team
    const existingMembership = await prisma.teamMember.findUnique({
      where: { userId },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already in a team" },
        { status: 400 },
      );
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        isLeader: isLeader || false,
      },
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    // Log history
    await prisma.teamHistory.create({
      data: {
        teamId,
        teamMemberId: teamMember.id,
        action: "joined",
        performedBy: performedBy || 1,
        reason,
        metadata: {
          userId,
          isLeader: isLeader || false,
        },
      },
    });

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 },
    );
  }
}
