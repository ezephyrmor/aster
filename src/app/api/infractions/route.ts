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

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search"); // Search by employee name

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

    // Search by employee name
    if (search) {
      where.user = {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          {
            employeeProfile: {
              firstName: { contains: search, mode: "insensitive" },
            },
          },
          {
            employeeProfile: {
              lastName: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    // Get total count for pagination
    const total = await prisma.infraction.count({
      where,
    });

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
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({
      infractions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
