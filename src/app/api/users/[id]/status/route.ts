import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/next-auth";
import { z } from "zod";

export const runtime = "nodejs";

const statusChangeSchema = z.object({
  statusId: z.string().uuid(),
  effectiveDate: z.coerce.date().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = id;
    const currentUserId = session.user.id;

    const body = await request.json();
    const validation = statusChangeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { statusId, effectiveDate, reason, notes } = validation.data;

    // Verify status exists
    const statusExists = await prisma.employeeStatusModel.findUnique({
      where: { id: statusId },
    });

    if (!statusExists) {
      return NextResponse.json({ error: "Invalid status ID" }, { status: 400 });
    }

    // Get IP and user agent for audit log
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("remote-host") ||
      null;

    const userAgent = request.headers.get("user-agent") || null;

    // Atomic transaction: update profile AND create history record
    const result = await prisma.$transaction(async (tx) => {
      // Update employee profile status
      const updatedProfile = await tx.employeeProfile.update({
        where: { userId },
        data: {
          statusId,
          updatedAt: new Date(),
        },
      });

      // Create history record
      const historyRecord = await tx.employeeStatusHistory.create({
        data: {
          userId,
          statusId,
          effectiveDate: effectiveDate || new Date(),
          reason,
          notes,
          performedBy: currentUserId,
          ipAddress,
          userAgent,
        },
        include: {
          status: true,
          performedByUser: {
            select: {
              id: true,
              username: true,
              employeeProfile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });

      return { updatedProfile, historyRecord };
    });

    return NextResponse.json({
      success: true,
      message: "Employee status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating employee status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = id;

    const statusHistory = await prisma.employeeStatusHistory.findMany({
      where: { userId },
      orderBy: { effectiveDate: "desc" },
      include: {
        status: true,
        performedByUser: {
          select: {
            id: true,
            username: true,
            employeeProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: statusHistory,
    });
  } catch (error) {
    console.error("Error fetching status history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
