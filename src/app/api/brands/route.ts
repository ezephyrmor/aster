import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withValidation, CreateBrandSchema } from "@/lib/validations";

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

    // Industry filter (by industry name)
    if (industry) {
      whereClauses.push({ industry: { name: industry } });
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

    // Build orderBy
    let orderBy: any;
    if (sortBy === "industry") {
      orderBy = { industry: { name: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Get brands with pagination
    const brands = await prisma.brand.findMany({
      where,
      include: {
        industry: true,
        manager: {
          include: {
            employeeProfile: true,
          },
        },
        _count: {
          select: { teams: true },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    // Get unique industries for filter
    const industries = await prisma.industry.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // Format brands to maintain backward compatibility
    const formattedBrands = brands.map((brand) => ({
      ...brand,
      industry: brand.industry?.name || null,
    }));

    return NextResponse.json({
      brands: formattedBrands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      industries: industries.map((i) => i.name),
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
export const POST = withValidation(CreateBrandSchema, async (data) => {
  try {
    const { name, description, logo, website, industryId, managerId } = data;

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
        industryId,
        managerId,
        createdBy: 1, // TODO: Get from authenticated user
      },
      include: {
        industry: true,
        manager: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    // Format response to maintain backward compatibility
    const formattedBrand = {
      ...brand,
      industry: brand.industry?.name || null,
    };

    return NextResponse.json(formattedBrand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 },
    );
  }
});
