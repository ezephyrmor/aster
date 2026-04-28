import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/schedules/[id] - Get a specific schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schedule = await prisma.workSchedule.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 },
    );
  }
}

// PUT /api/schedules/[id] - Update a schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      dayOfWeek,
      startTime,
      endTime,
      breakMinutes,
      effectiveFrom,
      effectiveTo,
    } = body;

    // Check if schedule exists
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    // Validate day of week if provided
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return NextResponse.json(
        {
          error:
            "Invalid day of week. Must be between 0 (Sunday) and 6 (Saturday)",
        },
        { status: 400 },
      );
    }

    // Validate time format if provided
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (startTime && !timeRegex.test(startTime)) {
      return NextResponse.json(
        { error: "Invalid start time format. Use HH:MM (24-hour format)" },
        { status: 400 },
      );
    }
    if (endTime && !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid end time format. Use HH:MM (24-hour format)" },
        { status: 400 },
      );
    }

    // Validate effectiveTo is after effectiveFrom
    if (effectiveTo && effectiveFrom) {
      if (new Date(effectiveTo) < new Date(effectiveFrom)) {
        return NextResponse.json(
          { error: "Effective end date must be after effective start date" },
          { status: 400 },
        );
      }
    }

    const schedule = await prisma.workSchedule.update({
      where: { id },
      data: {
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        breakMinutes:
          breakMinutes !== undefined ? parseInt(breakMinutes) : undefined,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null, // null means indefinite
      },
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 },
    );
  }
}

// DELETE /api/schedules/[id] - Delete a schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if schedule exists
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 },
      );
    }

    await prisma.workSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 },
    );
  }
}
