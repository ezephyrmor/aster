import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Fetch all calendar events (optionally filtered by date range)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: {
      startDate?: { gte?: Date; lte?: Date };
    } = {};

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    } else if (endDate) {
      where.startDate = { lte: new Date(endDate) };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
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
    }));

    return NextResponse.json(formattedEvents);
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
