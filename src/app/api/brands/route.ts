import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/brands - List all brands with pagination, search, and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const industry = searchParams.get("industry") || "";
    let sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Validate sortBy to prevent invalid fields
    const validSortFields = ["name", "status", "industry", "createdAt"];
    if (!validSortFields.includes(sortBy)) {
      sortBy = "createdAt";
    }

    // Build where clause for filtering
    const whereClauses: any[] = [];

    // Status filter
    if (status) {
      whereClauses.push({ status });
    }

    // Industry filter
    if (industry) {
      whereClauses.push({ industry });
    }

    // Search filter (brand name)
    if (search) {
      whereClauses.push({
        name: { contains: search.toLowerCase() },
      });
    }

    // Combine all where clauses with AND
    const where =
      whereClauses.length > 0
        ? whereClauses.length === 1
          ? whereClauses[0]
          : { AND: whereClauses }
        : {};

    // Get total count for pagination
    const total = await prisma.brand.count({ where });

    // Get brands with pagination
    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { teams: true },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Get unique industries for filter
    const industries = await prisma.brand.findMany({
      select: { industry: true },
      distinct: ["industry"],
      where: { industry: { not: null } },
    });

    return NextResponse.json({
      brands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      industries: industries.map((b) => b.industry).filter(Boolean),
    });
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
