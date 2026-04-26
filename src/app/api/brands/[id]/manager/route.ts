import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

// PUT /api/brands/[id]/manager - Assign a manager to a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const brandId = id;
    const body = await request.json();
    const { ipAddress, userAgent } = getClientInfo(request);

    const { managerId, reason, performedBy } = body;

    if (managerId === undefined || managerId === null) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 },
      );
    }

    if (!performedBy) {
      return NextResponse.json(
        { error: "performedBy user ID is required" },
        { status: 400 },
      );
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if performedBy user exists
    const performer = await prisma.user.findUnique({
      where: { id: performedBy },
    });

    if (!performer) {
      return NextResponse.json(
        { error: "Performer user not found" },
        { status: 404 },
      );
    }

    // Get the previous manager ID for audit trail
    const previousManagerId = brand.managerId;

    // Update the brand's manager and create history record in a transaction
    const updatedBrand = await prisma.$transaction(async (tx) => {
      const updated = await tx.brand.update({
        where: { id: brandId },
        data: { managerId },
        include: {
          industry: true,
          teams: {
            include: {
              _count: {
                select: { members: true },
              },
            },
          },
          manager: {
            include: {
              employeeProfile: true,
            },
          },
          _count: {
            select: { teams: true },
          },
        },
      });

      // Create audit history record
      await tx.brandManagerHistory.create({
        data: {
          brandId,
          userId: managerId,
          action: "ASSIGNED",
          performedBy,
          previousManagerId,
          reason: reason || null,
          ipAddress,
          userAgent,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error assigning brand manager:", error);
    return NextResponse.json(
      { error: "Failed to assign brand manager" },
      { status: 500 },
    );
  }
}

// DELETE /api/brands/[id]/manager - Remove manager from a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const brandId = id;
    const body = await request.json().catch(() => ({}));
    const { ipAddress, userAgent } = getClientInfo(request);

    const { reason, performedBy } = body;

    if (!performedBy) {
      return NextResponse.json(
        { error: "performedBy user ID is required" },
        { status: 400 },
      );
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if performedBy user exists
    const performer = await prisma.user.findUnique({
      where: { id: performedBy },
    });

    if (!performer) {
      return NextResponse.json(
        { error: "Performer user not found" },
        { status: 404 },
      );
    }

    // If no current manager, nothing to remove
    if (!brand.managerId) {
      return NextResponse.json(
        { error: "Brand has no manager to remove" },
        { status: 400 },
      );
    }

    // Get the previous manager ID for audit trail
    const previousManagerId = brand.managerId;

    // Remove the manager and create history record in a transaction
    const updatedBrand = await prisma.$transaction(async (tx) => {
      const updated = await tx.brand.update({
        where: { id: brandId },
        data: { managerId: null },
        include: {
          industry: true,
          teams: {
            include: {
              _count: {
                select: { members: true },
              },
            },
          },
          manager: {
            include: {
              employeeProfile: true,
            },
          },
          _count: {
            select: { teams: true },
          },
        },
      });

      // Create audit history record
      await tx.brandManagerHistory.create({
        data: {
          brandId,
          userId: previousManagerId,
          action: "REMOVED",
          performedBy,
          previousManagerId,
          reason: reason || null,
          ipAddress,
          userAgent,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error removing brand manager:", error);
    return NextResponse.json(
      { error: "Failed to remove brand manager" },
      { status: 500 },
    );
  }
}
