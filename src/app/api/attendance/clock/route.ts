import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/attendance/clock - Get today's attendance status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Get current date in Asia/Manila timezone (UTC+8)
    const now = new Date();

    // Get the current date components in Manila timezone
    const manilaDateStr = now.toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Parse the Manila date string (format: MM/DD/YYYY)
    const [month, day, year] = manilaDateStr.split("/").map(Number);

    // Create a date at midnight UTC that represents Manila's current date
    // This date will be used for database queries (stored as DATE type in MySQL)
    const today = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Manila timezone offset in minutes (UTC+8 = -480 minutes for getTimezoneOffset)
    const MANILA_OFFSET_MINUTES = -8 * 60;

    // Calculate the UTC equivalent of Manila midnight
    // Manila midnight = UTC time - 8 hours
    // So if today is April 6 in Manila, the UTC equivalent of that midnight is April 5, 16:00 UTC
    const manilaMidnightUTC = new Date(
      today.getTime() + MANILA_OFFSET_MINUTES * 60000,
    );

    // Get today's attendance record
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: parseInt(userId),
          date: today,
        },
      },
      include: {
        schedule: true,
      },
    });

    // Get user's schedule for today
    const dayOfWeek = today.getDay();
    const schedule = await prisma.workSchedule.findFirst({
      where: {
        userId: parseInt(userId),
        dayOfWeek: dayOfWeek,
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      },
    });

    // Debug logging
    console.log("GET Clock-in debug:", {
      userId: parseInt(userId),
      dayOfWeek,
      today: today.toISOString(),
      scheduleFound: !!schedule,
      attendanceFound: !!attendance,
      attendanceClockIn: attendance?.clockIn,
      attendance: attendance
        ? {
            id: attendance.id,
            clockIn: attendance.clockIn,
            clockOut: attendance.clockOut,
          }
        : null,
    });

    return NextResponse.json({
      attendance,
      schedule,
      canClockIn: !attendance?.clockIn,
      canClockOut: !!(attendance?.clockIn && !attendance.clockOut),
    });
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance status" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/clock - Clock in or clock out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type } = body; // type: "in" or "out"

    if (!userId || !type) {
      return NextResponse.json(
        { error: "userId and type (in/out) are required" },
        { status: 400 },
      );
    }

    if (type !== "in" && type !== "out") {
      return NextResponse.json(
        { error: "type must be 'in' or 'out'" },
        { status: 400 },
      );
    }

    // Get current time in Asia/Manila timezone (UTC+8)
    const now = new Date();

    // Get the current date components in Manila timezone
    const manilaDateStr = now.toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Parse the Manila date string (format: MM/DD/YYYY)
    const [month, day, year] = manilaDateStr.split("/").map(Number);

    // Create a date at midnight UTC that represents Manila's current date
    // This date will be used for database queries (stored as DATE type in MySQL)
    const today = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Manila timezone offset in minutes (UTC+8 = -480 minutes for getTimezoneOffset)
    const MANILA_OFFSET_MINUTES = -8 * 60;

    // Calculate the UTC equivalent of Manila midnight
    // Manila midnight = UTC time - 8 hours
    // So if today is April 6 in Manila, the UTC equivalent of that midnight is April 5, 16:00 UTC
    const manilaMidnightUTC = new Date(
      today.getTime() + MANILA_OFFSET_MINUTES * 60000,
    );

    // Debug: Show what date we're using
    console.log("Date calculation:", {
      utcNow: now.toISOString(),
      todayDate: today.toISOString(),
      manilaMidnightUTC: manilaMidnightUTC.toISOString(),
      timezone: "Asia/Manila (UTC+8)",
    });

    // Get user's schedule for today
    const dayOfWeek = today.getDay();
    const schedule = await prisma.workSchedule.findFirst({
      where: {
        userId: parseInt(userId),
        dayOfWeek: dayOfWeek,
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      },
    });

    if (type === "in") {
      // Clock In Logic
      // Employee must have a schedule for today
      if (!schedule) {
        return NextResponse.json(
          {
            error:
              "No work schedule found for today. Please contact your manager to set up your schedule.",
          },
          { status: 400 },
        );
      }

      // Check if can clock in (2 hours before scheduled start time)
      let lateMinutes = 0;
      const [startHour, startMinute] = schedule.startTime
        .split(":")
        .map(Number);

      // Create scheduled start time in Manila timezone
      // today is at midnight UTC representing Manila date
      // To get the actual UTC time for Manila 18:00, we need:
      // Manila 18:00 = UTC 10:00 (18:00 - 8 hours)
      // So: scheduledStart = manilaMidnightUTC + startHour in Manila time
      // Which equals: today - 8 hours + startHour
      const scheduledStart = new Date(
        manilaMidnightUTC.getTime() + (startHour * 60 + startMinute) * 60000,
      );

      // Allow clock-in 2 hours before scheduled start
      const earliestClockIn = new Date(
        scheduledStart.getTime() - 2 * 60 * 60000,
      );

      // Debug: Show time comparison
      console.log("Clock-in time check:", {
        now: now.toISOString(),
        scheduledStart: scheduledStart.toISOString(),
        earliestClockIn: earliestClockIn.toISOString(),
        isTooEarly: now < earliestClockIn,
      });

      // Only block if trying to clock in too early (more than 2 hours before start)
      // Clock-in is always allowed AFTER the earliest time (including after scheduled start - just marked as late)
      if (now < earliestClockIn) {
        return NextResponse.json(
          {
            error: `Cannot clock in yet. Earliest clock-in time is 2 hours before your scheduled start time (${schedule.startTime})`,
            earliestClockIn: earliestClockIn.toISOString(),
          },
          { status: 400 },
        );
      }

      // Calculate late minutes if clocking in after scheduled start
      if (now > scheduledStart) {
        lateMinutes = Math.floor(
          (now.getTime() - scheduledStart.getTime()) / (1000 * 60),
        );
      }

      // Use upsert to handle race conditions atomically
      let attendance;
      try {
        attendance = await prisma.attendance.upsert({
          where: {
            userId_date: {
              userId: parseInt(userId),
              date: today,
            },
          },
          create: {
            userId: parseInt(userId),
            scheduleId: schedule?.id || null,
            date: today,
            clockIn: now,
            status: lateMinutes > 0 ? "late" : "present",
            lateMinutes,
          },
          update: {
            scheduleId: schedule?.id || null,
            clockIn: now,
            status: lateMinutes > 0 ? "late" : "present",
            lateMinutes,
          },
          include: {
            schedule: true,
          },
        });

        // Check if this was an update (already clocked in)
        if (
          attendance.clockIn &&
          attendance.clockIn.getTime() !== now.getTime()
        ) {
          // If the existing clockIn is different from what we just set, someone else clocked in
          return NextResponse.json(
            { error: "Already clocked in for today" },
            { status: 400 },
          );
        }
      } catch (error: unknown) {
        const prismaError = error as { code?: string };
        if (prismaError.code === "P2002") {
          return NextResponse.json(
            { error: "Already clocked in for today" },
            { status: 400 },
          );
        }
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "Clocked in successfully",
        attendance,
        lateMinutes,
      });
    } else {
      // Clock Out Logic
      const { reason } = body; // Optional reason for early clock-out

      const attendance = await prisma.attendance.findUnique({
        where: {
          userId_date: {
            userId: parseInt(userId),
            date: today,
          },
        },
      });

      if (!attendance?.clockIn) {
        return NextResponse.json(
          { error: "No clock-in record found for today" },
          { status: 400 },
        );
      }

      if (attendance.clockOut) {
        return NextResponse.json(
          { error: "Already clocked out for today" },
          { status: 400 },
        );
      }

      // Calculate undertime and check if clocking out early
      let undertimeMinutes = 0;
      let isEarlyClockOut = false;
      let earlyMinutes = 0;

      if (schedule) {
        const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

        // Create scheduled end time in Manila timezone
        const scheduledEnd = new Date(
          manilaMidnightUTC.getTime() + (endHour * 60 + endMinute) * 60000,
        );

        // Check if clocking out before scheduled end time
        if (now < scheduledEnd) {
          isEarlyClockOut = true;
          earlyMinutes = Math.floor(
            (scheduledEnd.getTime() - now.getTime()) / (1000 * 60),
          );

          // If trying to clock out early without a reason, reject
          if (!reason || reason.trim() === "") {
            return NextResponse.json(
              {
                error: "Early clock-out requires a reason",
                isEarlyClockOut: true,
                earlyMinutes,
                scheduledEndTime: schedule.endTime,
              },
              { status: 400 },
            );
          }
        }

        // Calculate undertime minutes
        if (now < scheduledEnd) {
          undertimeMinutes = Math.floor(
            (scheduledEnd.getTime() - now.getTime()) / (1000 * 60),
          );
        }
      }

      // Update attendance record with clock-out and reason
      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOut: now,
          undertimeMinutes,
          status: undertimeMinutes > 0 ? "undertime" : attendance.status,
          earlyClockOutReason: reason || null,
        },
        include: {
          schedule: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Clocked out successfully",
        attendance: updatedAttendance,
        undertimeMinutes,
        isEarlyClockOut,
      });
    }
  } catch (error) {
    console.error("Error processing clock action:", error);
    return NextResponse.json(
      { error: "Failed to process clock action" },
      { status: 500 },
    );
  }
}
