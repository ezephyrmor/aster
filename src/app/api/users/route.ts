import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, generateSalt } from "@/lib/password";
import { generateUsername, generatePassword } from "@/lib/userGenerator";

// GET /api/users - List all users with pagination, search, and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    let sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Validate sortBy to prevent invalid fields
    const validSortFields = [
      "username",
      "role",
      "createdAt",
      "employeeProfile.firstName",
      "employeeProfile.lastName",
      "employeeProfile.status",
    ];
    if (!validSortFields.includes(sortBy)) {
      sortBy = "createdAt";
    }

    // Build where clause for filtering
    const whereClauses: any[] = [];

    // Role filter
    if (role) {
      whereClauses.push({ role });
    }

    // Status filter (through employeeProfile)
    if (status) {
      whereClauses.push({ employeeProfile: { status } });
    }

    // Search filter (employee name only) - case insensitive for SQLite
    if (search) {
      const searchLower = search.toLowerCase();
      whereClauses.push({
        OR: [
          {
            employeeProfile: {
              firstName: { contains: searchLower },
            },
          },
          {
            employeeProfile: {
              lastName: { contains: searchLower },
            },
          },
        ],
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
    const total = await prisma.user.count({ where });

    // Build orderBy - handle nested fields
    const orderBy: any =
      sortBy === "employeeProfile.firstName"
        ? { employeeProfile: { firstName: sortOrder as "asc" | "desc" } }
        : sortBy === "employeeProfile.lastName"
          ? { employeeProfile: { lastName: sortOrder as "asc" | "desc" } }
          : sortBy === "employeeProfile.status"
            ? { employeeProfile: { status: sortOrder as "asc" | "desc" } }
            : { [sortBy]: sortOrder };

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      include: {
        employeeProfile: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      username,
      password,
      role,
      firstName,
      lastName,
      middleName,
      contactNumber,
      personalEmail,
      address,
      dateOfBirth,
      position,
      department,
      hireDate,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 },
      );
    }

    // Auto-generate username if not provided
    let generatedUsername = username;
    if (!generatedUsername) {
      generatedUsername = generateUsername(firstName, lastName);
      // Ensure uniqueness by checking and regenerating if needed
      let attempts = 0;
      while (attempts < 10) {
        const existingUser = await prisma.user.findUnique({
          where: { username: generatedUsername },
        });
        if (!existingUser) break;
        generatedUsername = generateUsername(firstName, lastName);
        attempts++;
      }
    }

    // Auto-generate password if not provided
    let generatedPassword = password;
    const isPasswordGenerated = !generatedPassword;
    if (!generatedPassword) {
      generatedPassword = generatePassword(12);
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: generatedUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists. Please try again." },
        { status: 400 },
      );
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const hashedPassword = await hashPassword(generatedPassword, salt);

    // Create user and employee profile in a transaction
    const user = await prisma.user.create({
      data: {
        username: generatedUsername,
        passwordHash: hashedPassword,
        salt,
        role: role || "employee",
        employeeProfile: {
          create: {
            firstName,
            lastName,
            middleName,
            contactNumber,
            personalEmail,
            address,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            position,
            department,
            hireDate: hireDate ? new Date(hireDate) : null,
            emergencyContactName,
            emergencyContactNumber,
            emergencyContactRelation,
          },
        },
      },
      include: {
        employeeProfile: true,
      },
    });

    // Return generated credentials if they were auto-generated
    const responseData: any = { ...user };
    if (isPasswordGenerated) {
      responseData.generatedPassword = generatedPassword;
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
