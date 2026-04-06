import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/infractions/[id] - Get a single infraction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const infraction = await prisma.infraction.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            employeeProfile: {
              include: {
                department: true,
                position: true,
              },
            },
          },
        },
        offense: {
          include: {
            type: true,
          },
        },
        type: true,
        creator: {
          include: {
            employeeProfile: true,
          },
        },
        ackUser: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    if (!infraction) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(infraction);
  } catch (error) {
    console.error("Error fetching infraction:", error);
    return NextResponse.json(
      { error: "Failed to fetch infraction" },
      { status: 500 },
    );
  }
}

// PUT /api/infractions/[id] - Update an infraction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { offenseId, typeId, date, details, comment } = body;

    // Check if infraction exists
    const existing = await prisma.infraction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 },
      );
    }

    // Verify the offense and type match if offenseId is provided
    if (offenseId) {
      const offense = await prisma.infractionOffense.findUnique({
        where: { id: offenseId },
      });

      if (!offense || (typeId && offense.typeId !== typeId)) {
        return NextResponse.json(
          { error: "Invalid offense or type" },
          { status: 400 },
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (offenseId !== undefined) updateData.offenseId = parseInt(offenseId);
    if (typeId !== undefined) updateData.typeId = parseInt(typeId);
    if (date !== undefined) updateData.date = new Date(date);
    if (details !== undefined) updateData.details = details;
    if (comment !== undefined) updateData.comment = comment;

    const infraction = await prisma.infraction.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
        offense: {
          include: {
            type: true,
          },
        },
        type: true,
        creator: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    return NextResponse.json(infraction);
  } catch (error) {
    console.error("Error updating infraction:", error);
    return NextResponse.json(
      { error: "Failed to update infraction" },
      { status: 500 },
    );
  }
}

// DELETE /api/infractions/[id] - Delete an infraction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Check if infraction exists
    const existing = await prisma.infraction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 },
      );
    }

    await prisma.infraction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Infraction deleted successfully" });
  } catch (error) {
    console.error("Error deleting infraction:", error);
    return NextResponse.json(
      { error: "Failed to delete infraction" },
      { status: 500 },
    );
  }
}
