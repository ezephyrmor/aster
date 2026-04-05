import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT - Update a calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, color } = body;

    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate dates if provided
    if (startDate && endDate) {
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
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: title ?? existingEvent.title,
        description: description ?? existingEvent.description,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : existingEvent.endDate,
        color: color ?? existingEvent.color,
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

    return NextResponse.json({
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startDate: updatedEvent.startDate.toISOString(),
      endDate: updatedEvent.endDate.toISOString(),
      color: updatedEvent.color,
      createdBy: updatedEvent.createdBy,
      creatorName: updatedEvent.user.username,
      createdAt: updatedEvent.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Calendar event PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      message: "Event deleted successfully",
      id: eventId,
    });
  } catch (error) {
    console.error("Calendar event DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 },
    );
  }
}
