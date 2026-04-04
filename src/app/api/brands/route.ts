import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/brands - List all brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { teams: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 },
    );
  }
}

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, logo, website, industry, createdBy } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 },
      );
    }

    // Check if brand name already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Brand name already exists" },
        { status: 400 },
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        logo,
        website,
        industry,
        createdBy: createdBy || 1, // Default to admin if not provided
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 },
    );
  }
}
