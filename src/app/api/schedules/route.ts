import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/schedules - Get schedules for a user or all schedules (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date"); // Get schedules for a specific date

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    // If date is provided, filter by day of week
    if (date) {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      whereClause.dayOfWeek = dayOfWeek;

      // Also filter by effective date range
      whereClause.effectiveFrom = { lte: targetDate };
      whereClause.OR = [
        { effectiveTo: null },
        { effectiveTo: { gte: targetDate } },
      ];
    }

    const schedules = await prisma.workSchedule.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { effectiveFrom: "desc" }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 },
    );
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      dayOfWeek,
      startTime,
      endTime,
      breakMinutes = 60,
      effectiveFrom,
      effectiveTo,
    } = body;

    // Validate required fields
    if (
      !userId ||
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      !effectiveFrom
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, dayOfWeek, startTime, endTime, effectiveFrom",
        },
        { status: 400 },
      );
    }

    // Validate day of week (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        {
          error:
            "Invalid day of week. Must be between 0 (Sunday) and 6 (Saturday)",
        },
        { status: 400 },
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:MM (24-hour format)" },
        { status: 400 },
      );
    }

    // Validate effectiveTo is after effectiveFrom
    if (effectiveTo && new Date(effectiveTo) < new Date(effectiveFrom)) {
      return NextResponse.json(
        { error: "Effective end date must be after effective start date" },
        { status: 400 },
      );
    }

    // Check for conflicting schedules
    const conflictingSchedule = await prisma.workSchedule.findFirst({
      where: {
        userId: parseInt(userId),
        dayOfWeek: parseInt(dayOfWeek),
        effectiveTo: null, // Only check active schedules
      },
    });

    if (conflictingSchedule) {
      return NextResponse.json(
        { error: "User already has an active schedule for this day of week" },
        { status: 400 },
      );
    }

    const schedule = await prisma.workSchedule.create({
      data: {
        userId: parseInt(userId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        breakMinutes: parseInt(breakMinutes),
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 },
    );
  }
}
