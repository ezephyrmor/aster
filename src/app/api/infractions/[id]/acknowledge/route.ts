import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT /api/infractions/[id]/acknowledge - Acknowledge an infraction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { acknowledgedBy, comment } = body;

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

    // Check if already acknowledged
    if (existing.acknowledgedBy) {
      return NextResponse.json(
        { error: "Infraction already acknowledged" },
        { status: 400 },
      );
    }

    if (!acknowledgedBy) {
      return NextResponse.json(
        { error: "acknowledgedBy (user ID) is required" },
        { status: 400 },
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Comment is required when acknowledging an infraction" },
        { status: 400 },
      );
    }

    const infraction = await prisma.infraction.update({
      where: { id },
      data: {
        acknowledgedBy: parseInt(acknowledgedBy),
        acknowledgedAt: new Date(),
        comment: comment || existing.comment,
      },
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
        ackUser: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    return NextResponse.json(infraction);
  } catch (error) {
    console.error("Error acknowledging infraction:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge infraction" },
      { status: 500 },
    );
  }
}
