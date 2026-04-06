import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/brands/[id]/manager/history - Get audit trail for brand manager changes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const brandId = parseInt(id);

    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const action = searchParams.get("action") || undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { brandId };

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    // Get total count
    const total = await prisma.brandManagerHistory.count({ where });

    // Get history records with pagination
    const history = await prisma.brandManagerHistory.findMany({
      where,
      include: {
        user: {
          include: {
            employeeProfile: true,
          },
        },
        performedByUser: {
          include: {
            employeeProfile: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
    });

    // Format response
    interface HistoryRecord {
      id: number;
      brandId: number;
      action: string;
      timestamp: Date;
      reason: string | null;
      ipAddress: string | null;
      userAgent: string | null;
      user: {
        id: number;
        username: string;
        employeeProfile: {
          firstName: string;
          lastName: string;
        } | null;
      } | null;
      performedByUser: {
        id: number;
        username: string;
        employeeProfile: {
          firstName: string;
          lastName: string;
        } | null;
      };
      previousManagerId: number | null;
    }

    const formattedHistory = history.map((record: HistoryRecord) => ({
      id: record.id,
      brandId: record.brandId,
      action: record.action,
      timestamp: record.timestamp,
      reason: record.reason,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      manager: record.user
        ? {
            id: record.user.id,
            username: record.user.username,
            name: record.user.employeeProfile
              ? `${record.user.employeeProfile.firstName} ${record.user.employeeProfile.lastName}`
              : null,
          }
        : null,
      performedBy: {
        id: record.performedByUser.id,
        username: record.performedByUser.username,
        name: record.performedByUser.employeeProfile
          ? `${record.performedByUser.employeeProfile.firstName} ${record.performedByUser.employeeProfile.lastName}`
          : null,
      },
      previousManager: record.previousManagerId
        ? { id: record.previousManagerId }
        : null,
    }));

    return NextResponse.json({
      history: formattedHistory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching brand manager history:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand manager history" },
      { status: 500 },
    );
  }
}
