import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT /api/teams/[id]/members/[memberId] - Update team member (e.g., make leader)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id, memberId } = await params;
    const teamId = parseInt(id);
    const memberRecordId = parseInt(memberId);
    const body = await request.json();
    const { isLeader, reason, performedBy } = body;

    if (isNaN(teamId) || isNaN(memberRecordId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if team member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: memberRecordId },
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }

    if (existingMember.teamId !== teamId) {
      return NextResponse.json(
        { error: "Member does not belong to this team" },
        { status: 400 },
      );
    }

    // Determine action for history
    const action: "promoted" | "demoted" =
      isLeader && !existingMember.isLeader ? "promoted" : "demoted";

    // Update member
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberRecordId },
      data: {
        isLeader: isLeader !== undefined ? isLeader : existingMember.isLeader,
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
        teamMemberId: memberRecordId,
        action,
        performedBy: performedBy || 1,
        reason,
        metadata: {
          userId: existingMember.userId,
          wasLeader: existingMember.isLeader,
          isLeader: updatedMember.isLeader,
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 },
    );
  }
}

// DELETE /api/teams/[id]/members/[memberId] - Remove member from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id, memberId } = await params;
    const teamId = parseInt(id);
    const memberRecordId = parseInt(memberId);
    const body = await request.json();
    const { reason, performedBy } = body || {};

    if (isNaN(teamId) || isNaN(memberRecordId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if team member exists
    const existingMember = await prisma.teamMember.findUnique({
      where: { id: memberRecordId },
      include: {
        user: true,
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }

    if (existingMember.teamId !== teamId) {
      return NextResponse.json(
        { error: "Member does not belong to this team" },
        { status: 400 },
      );
    }

    // Log history before deletion (for attrition tracking)
    await prisma.teamHistory.create({
      data: {
        teamId,
        teamMemberId: memberRecordId,
        action: "left",
        performedBy: performedBy || 1,
        reason,
        metadata: {
          userId: existingMember.userId,
          wasLeader: existingMember.isLeader,
          joinedAt: existingMember.joinedAt,
          leftAt: new Date(),
        },
      },
    });

    // Delete the team member
    await prisma.teamMember.delete({
      where: { id: memberRecordId },
    });

    return NextResponse.json({
      message: "Member removed from team successfully",
      userId: existingMember.userId,
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 },
    );
  }
}
