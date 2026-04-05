import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/leaves/requests - Get leave requests
// Query params: userId (for employee's own requests), teamId (for manager to see team requests), statusId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const teamId = searchParams.get("teamId");
    const statusId = searchParams.get("statusId");

    // Build where clause dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    if (statusId) {
      whereClause.statusId = parseInt(statusId);
    }

    // If teamId is provided, get all team members and filter by their requests
    if (teamId) {
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: parseInt(teamId), status: "active" },
        select: { userId: true },
      });
      whereClause.userId = { in: teamMembers.map((m) => m.userId) };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
        leaveType: true,
        status: true,
        reviewer: {
          include: {
            employeeProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 },
    );
  }
}

// POST /api/leaves/requests - Create a new leave request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, leaveTypeId, startDate, endDate, reason } = body;

    // Validate required fields
    if (!userId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, leaveTypeId, startDate, endDate",
        },
        { status: 400 },
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    // Calculate number of days
    const daysRequested =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check if user has enough leave credits
    const userCredits = await prisma.leaveCredit.findMany({
      where: {
        userId: parseInt(userId),
        usedDate: null, // Only unused credits
      },
    });

    if (userCredits.length < daysRequested) {
      return NextResponse.json(
        {
          error: "Insufficient leave credits",
          availableCredits: userCredits.length,
          requestedDays: daysRequested,
        },
        { status: 400 },
      );
    }

    // Check for overlapping approved leaves
    const overlappingApprovedLeaves = await prisma.leaveRequest.findFirst({
      where: {
        userId: parseInt(userId),
        statusId: 2, // Approved status
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlappingApprovedLeaves) {
      return NextResponse.json(
        { error: "You already have an approved leave during this period" },
        { status: 400 },
      );
    }

    // Check for overlapping pending leaves
    const pendingStatus = await prisma.leaveStatus.findFirst({
      where: { name: "Pending" },
    });

    const overlappingPendingLeaves = await prisma.leaveRequest.findFirst({
      where: {
        userId: parseInt(userId),
        statusId: pendingStatus?.id || 1,
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlappingPendingLeaves) {
      return NextResponse.json(
        {
          error: "You already have a pending leave request during this period",
        },
        { status: 400 },
      );
    }

    // Check for exact duplicate (same dates and same leave type)
    const duplicateRequest = await prisma.leaveRequest.findFirst({
      where: {
        userId: parseInt(userId),
        leaveTypeId: parseInt(leaveTypeId),
        startDate: start,
        endDate: end,
        statusId: {
          not: 3, // Not denied
        },
      },
    });

    if (duplicateRequest) {
      return NextResponse.json(
        {
          error:
            "You have already submitted a request for these dates and leave type",
        },
        { status: 400 },
      );
    }

    // Create the leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: parseInt(userId),
        leaveTypeId: parseInt(leaveTypeId),
        statusId: pendingStatus?.id || 1,
        startDate: start,
        endDate: end,
        reason: reason || null,
      },
      include: {
        user: true,
        leaveType: true,
        status: true,
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 },
    );
  }
}
