import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/brands/[id] - Get single brand by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const brandId = id;

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
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

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}

// PUT /api/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const brandId = id;
    const body = await request.json();

    const { name, description, logo, website, industryId, managerId, status } =
      body;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== existingBrand.name) {
      const nameExists = await prisma.brand.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Brand name already exists" },
          { status: 400 },
        );
      }
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name,
        description,
        logo,
        website,
        industryId,
        managerId,
        status,
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 },
    );
  }
}

// DELETE /api/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const brandId = id;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: { teams: true },
        },
      },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if brand has teams
    if (existingBrand._count.teams > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete brand with existing teams. Please remove or reassign teams first.",
        },
        { status: 400 },
      );
    }

    await prisma.brand.delete({
      where: { id: brandId },
    });

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 },
    );
  }
}
