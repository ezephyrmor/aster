import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST /api/teams/[id]/members - Add member to team (supports transfers)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const body = await request.json();
    const { userId, isLeader, reason, performedBy, transferFromTeamId } = body;

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

    // Check if user is already in this specific team
    const existingMembershipInThisTeam = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
        leftAt: null, // Only check active memberships
      },
    });

    if (existingMembershipInThisTeam) {
      return NextResponse.json(
        { error: "User is already in this team" },
        { status: 400 },
      );
    }

    // Check if user is currently in another team (for transfer tracking)
    const existingActiveMembership = await prisma.teamMember.findFirst({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        team: true,
      },
    });

    const isTransfer = !!existingActiveMembership;

    // If this is a transfer, optionally remove from previous team first
    if (isTransfer && transferFromTeamId) {
      const prevTeamId = parseInt(transferFromTeamId);
      if (!isNaN(prevTeamId)) {
        // Log history for leaving previous team
        await prisma.teamHistory.create({
          data: {
            teamId: prevTeamId,
            teamMemberId: existingActiveMembership.id,
            action: "left",
            performedBy: performedBy || 1,
            reason: reason || "Transferred to another team",
            metadata: {
              userId,
              wasLeader: existingActiveMembership.isLeader,
              transferredToTeamId: teamId,
              transferredToTeamName: team.name,
            },
          },
        });

        // Update the previous membership to mark as left
        await prisma.teamMember.update({
          where: { id: existingActiveMembership.id },
          data: {
            leftAt: new Date(),
            status: "inactive" as const,
          },
        });
      }
    }

    // Add user to new team
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

    // Log history for joining new team
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
          isTransfer,
          transferredFromTeamId: isTransfer
            ? existingActiveMembership?.teamId
            : null,
          transferredFromTeamName: isTransfer
            ? existingActiveMembership?.team.name
            : null,
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
