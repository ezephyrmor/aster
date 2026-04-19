import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface LeaveRequestWithRelations {
  id: number;
  userId: number;
  leaveTypeId: number;
  statusId: number;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  reviewedBy: number | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
  leaveType: {
    id: number;
    name: string;
    description: string | null;
    color: string;
  };
  status: {
    id: number;
    name: string;
    color: string;
  };
}

// GET - Fetch calendar events (and optionally leave requests)
// Query params: startDate, endDate, userId (optional), includeLeaves (optional, default: false)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");
    const includeLeaves = searchParams.get("includeLeaves") === "true";

    const dateWhere: {
      startDate?: { gte?: Date; lte?: Date };
      createdBy?: number;
    } = {};

    if (startDate && endDate) {
      dateWhere.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      dateWhere.startDate = { gte: new Date(startDate) };
    } else if (endDate) {
      dateWhere.startDate = { lte: new Date(endDate) };
    }

    // Calendar events are company-wide, do NOT filter by creator user
    // Only leave requests will be filtered by userId when provided

    // Fetch calendar events
    const events = await prisma.calendarEvent.findMany({
      where: dateWhere,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Build leave query - if userId is provided, only show that user's leaves
    // Otherwise show all leaves (for managers/admins)
    const leaveWhere: {
      startDate?: { gte?: Date; lte?: Date };
      userId?: number;
    } = {};

    if (startDate && endDate) {
      leaveWhere.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      leaveWhere.startDate = { gte: new Date(startDate) };
    } else if (endDate) {
      leaveWhere.startDate = { lte: new Date(endDate) };
    }

    if (userId) {
      leaveWhere.userId = parseInt(userId);
    }

    // Only fetch leave requests if includeLeaves is true
    let leaveRequests: LeaveRequestWithRelations[] = [];
    if (includeLeaves) {
      leaveRequests = await prisma.leaveRequest.findMany({
        where: leaveWhere,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              employeeProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          leaveType: true,
          status: true,
        },
        orderBy: {
          startDate: "asc",
        },
      });
    }

    // Transform events for the frontend
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      color: event.color,
      createdBy: event.createdBy,
      creatorName: event.user.username,
      createdAt: event.createdAt.toISOString(),
      type: "event",
    }));

    // Transform leave requests for the frontend
    const formattedLeaves = leaveRequests.map((leave) => {
      const isOwnLeave = !userId || leave.userId === parseInt(userId);
      return {
        id: leave.id,
        title: isOwnLeave
          ? leave.leaveType.name
          : `${leave.user.employeeProfile?.firstName || leave.user.username} ${leave.user.employeeProfile?.lastName || ""} - ${leave.leaveType.name}`,
        description:
          leave.reason || `${leave.leaveType.name} - ${leave.status.name}`,
        startDate: leave.startDate.toISOString(),
        endDate: leave.endDate.toISOString(),
        color: leave.leaveType.color,
        createdBy: leave.userId,
        creatorName:
          `${leave.user.employeeProfile?.firstName || leave.user.username} ${leave.user.employeeProfile?.lastName || ""}`.trim(),
        createdAt: leave.createdAt.toISOString(),
        type: "leave",
        status: leave.status.name,
        statusColor: leave.status.color,
      };
    });

    // Combine and sort by start date
    const allEvents = [...formattedEvents, ...formattedLeaves].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Calendar events GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, color, createdBy } = body;

    // Validate required fields
    if (!title || !startDate || !endDate || !createdBy) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, startDate, endDate, createdBy",
        },
        { status: 400 },
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }
    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        startDate: start,
        endDate: end,
        color: color || "blue",
        createdBy,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        color: event.color,
        createdBy: event.createdBy,
        creatorName: event.user.username,
        createdAt: event.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Calendar event POST error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create calendar event: ${errorMessage}` },
      { status: 500 },
    );
  }
}
