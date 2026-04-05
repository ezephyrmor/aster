import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/leaves/requests/[id] - Approve or deny a leave request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { statusId, reviewedBy, reason } = body;

    if (!statusId) {
      return NextResponse.json(
        { error: "Status ID is required" },
        { status: 400 },
      );
    }

    // Get the leave request
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        leaveType: true,
        status: true,
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 },
      );
    }

    // Check if already finalized
    if (leaveRequest.status.isFinal) {
      return NextResponse.json(
        { error: "This leave request has already been finalized" },
        { status: 400 },
      );
    }

    // Get the new status
    const newStatus = await prisma.leaveStatus.findUnique({
      where: { id: statusId },
    });

    if (!newStatus) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the leave request
    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id: parseInt(id) },
      data: {
        statusId,
        reviewedBy: reviewedBy ? parseInt(reviewedBy) : null,
        reviewedAt: new Date(),
      },
      include: {
        user: true,
        leaveType: true,
        status: true,
        reviewer: true,
      },
    });

    // If approved, mark the leave credits as used
    if (newStatus.name === "Approved") {
      // Calculate days requested
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);
      const daysRequested =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      // Get unused credits for this user (oldest first - FIFO)
      const unusedCredits = await prisma.leaveCredit.findMany({
        where: {
          userId: leaveRequest.userId,
          usedDate: null,
        },
        orderBy: { earnedDate: "asc" },
        take: daysRequested,
      });

      // Mark credits as used and create leave usage records
      for (const credit of unusedCredits) {
        await prisma.leaveCredit.update({
          where: { id: credit.id },
          data: { usedDate: new Date() },
        });

        await prisma.leaveUsage.create({
          data: {
            leaveRequestId: leaveRequest.id,
            leaveCreditId: credit.id,
          },
        });
      }
    } else if (newStatus.name === "Denied" || newStatus.name === "Cancelled") {
      // If denied or cancelled, release any reserved credits
      await prisma.leaveUsage.deleteMany({
        where: { leaveRequestId: leaveRequest.id },
      });

      // Reset usedDate on the credits
      const usageCredits = await prisma.leaveUsage.findMany({
        where: { leaveRequestId: leaveRequest.id },
        select: { leaveCreditId: true },
      });

      for (const usage of usageCredits) {
        await prisma.leaveCredit.update({
          where: { id: usage.leaveCreditId },
          data: { usedDate: null },
        });
      }

      await prisma.leaveUsage.deleteMany({
        where: { leaveRequestId: leaveRequest.id },
      });
    }

    return NextResponse.json(updatedLeaveRequest);
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { error: "Failed to update leave request" },
      { status: 500 },
    );
  }
}

// GET /api/leaves/requests/[id] - Get a single leave request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: parseInt(id) },
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
        leaveUsage: {
          include: {
            leaveCredit: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Error fetching leave request:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave request" },
      { status: 500 },
    );
  }
}
