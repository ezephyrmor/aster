import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// GET /api/schedules - Get schedules for a user or all schedules (admin)
export const GET = withAuth(
  async (request: NextRequest, _context: any, auth: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId");
      const date = searchParams.get("date"); // Get schedules for a specific date

      // Pagination parameters
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const sortBy = searchParams.get("sortBy") || "effectiveFrom";
      const sortOrder = searchParams.get("sortOrder") || "desc";
      const search = searchParams.get("search"); // Search by employee name
      const companyId = auth.user.companyId;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {};

      // Apply company id filter from current user session
      if (companyId) {
        whereClause.companyId = companyId;
      }

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

      // Search by employee name
      if (search) {
        whereClause.user = {
          OR: [
            { username: { contains: search } },
            {
              employeeProfile: {
                firstName: { contains: search },
              },
            },
            {
              employeeProfile: {
                lastName: { contains: search },
              },
            },
          ],
        };
      }

      // Get total count for pagination
      const total = await prisma.workSchedule.count({
        where: whereClause,
      });

      const schedules = await prisma.workSchedule.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              employeeProfile: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ [sortBy]: sortOrder }],
      });

      return NextResponse.json({
        schedules,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching schedules:", error);
      return NextResponse.json(
        { error: "Failed to fetch schedules" },
        { status: 500 },
      );
    }
  },
);

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
