import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/infractions - List all infractions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const typeId = searchParams.get("typeId");
    const offenseId = searchParams.get("offenseId");
    const acknowledged = searchParams.get("acknowledged");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (typeId) {
      where.typeId = parseInt(typeId);
    }

    if (offenseId) {
      where.offenseId = parseInt(offenseId);
    }

    if (acknowledged !== null && acknowledged !== undefined) {
      if (acknowledged === "true") {
        where.acknowledgedBy = { not: null };
      } else if (acknowledged === "false") {
        where.acknowledgedBy = null;
      }
    }

    const infractions = await prisma.infraction.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(infractions);
  } catch (error) {
    console.error("Error fetching infractions:", error);
    return NextResponse.json(
      { error: "Failed to fetch infractions" },
      { status: 500 },
    );
  }
}

// POST /api/infractions - Create a new infraction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, offenseId, typeId, date, details, comment, createdBy } =
      body;

    // Validate required fields
    if (!userId || !offenseId || !typeId || !date || !createdBy) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, offenseId, typeId, date, createdBy",
        },
        { status: 400 },
      );
    }

    // Verify the offense and type match
    const offense = await prisma.infractionOffense.findUnique({
      where: { id: offenseId },
    });

    if (!offense || offense.typeId !== typeId) {
      return NextResponse.json(
        { error: "Invalid offense or type" },
        { status: 400 },
      );
    }

    const infraction = await prisma.infraction.create({
      data: {
        userId: parseInt(userId),
        offenseId: parseInt(offenseId),
        typeId: parseInt(typeId),
        date: new Date(date),
        details,
        comment,
        createdBy: parseInt(createdBy),
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
      },
    });

    return NextResponse.json(infraction, { status: 201 });
  } catch (error) {
    console.error("Error creating infraction:", error);
    return NextResponse.json(
      { error: "Failed to create infraction" },
      { status: 500 },
    );
  }
}
