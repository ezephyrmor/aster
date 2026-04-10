import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, generateSalt } from "@/lib/password";
import { generateUsername, generatePassword } from "@/lib/userGenerator";
import { withValidation, CreateUserSchema } from "@/lib/validations";

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

    // Role filter (by role name)
    if (role) {
      whereClauses.push({ role: { name: role } });
    }

    // Status filter (through employeeProfile, by status name)
    if (status) {
      whereClauses.push({ employeeProfile: { status: { name: status } } });
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

    // Build orderBy - handle nested fields and relations
    const orderBy: any =
      sortBy === "employeeProfile.firstName"
        ? { employeeProfile: { firstName: sortOrder as "asc" | "desc" } }
        : sortBy === "employeeProfile.lastName"
          ? { employeeProfile: { lastName: sortOrder as "asc" | "desc" } }
          : sortBy === "employeeProfile.status"
            ? {
                employeeProfile: {
                  status: { name: sortOrder as "asc" | "desc" },
                },
              }
            : sortBy === "role"
              ? { role: { name: sortOrder as "asc" | "desc" } }
              : { [sortBy]: sortOrder };

    // Get users with pagination, including related data
    const users = await prisma.user.findMany({
      where,
      include: {
        employeeProfile: {
          include: {
            position: true,
            department: true,
            status: true,
          },
        },
        role: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    // Format response to maintain backward compatibility
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role.name,
      employeeProfile: user.employeeProfile
        ? {
            firstName: user.employeeProfile.firstName,
            lastName: user.employeeProfile.lastName,
            middleName: user.employeeProfile.middleName,
            dateOfBirth: user.employeeProfile.dateOfBirth,
            contactNumber: user.employeeProfile.contactNumber,
            personalEmail: user.employeeProfile.personalEmail,
            address: user.employeeProfile.address,
            hireDate: user.employeeProfile.hireDate,
            position: user.employeeProfile.position?.name || null,
            department: user.employeeProfile.department?.name || null,
            status: user.employeeProfile.status?.name || "active",
          }
        : null,
    }));

    return NextResponse.json({
      users: formattedUsers,
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
export const POST = withValidation(CreateUserSchema, async (data) => {
  try {
    const {
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
      status,
    } = data;

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

    // Get role ID
    const roleRecord = await prisma.role.findUnique({
      where: { name: role || "employee" },
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 },
      );
    }

    // Get position ID if provided
    let positionId: number | null = null;
    if (position) {
      // Try to find by name first
      let positionRecord = await prisma.position.findUnique({
        where: { name: position },
      });

      // If not found and position is a number, try by ID
      if (!positionRecord && !isNaN(parseInt(position))) {
        positionRecord = await prisma.position.findUnique({
          where: { id: parseInt(position) },
        });
      }

      positionId = positionRecord?.id || null;
    }

    // Get department ID if provided
    let departmentId: number | null = null;
    if (department) {
      // Try to find by name first
      let departmentRecord = await prisma.department.findUnique({
        where: { name: department },
      });

      // If not found and department is a number, try by ID
      if (!departmentRecord && !isNaN(parseInt(department))) {
        departmentRecord = await prisma.department.findUnique({
          where: { id: parseInt(department) },
        });
      }

      departmentId = departmentRecord?.id || null;
    }

    // Get status ID if provided
    let statusId: number | null = null;
    if (status) {
      // Try to find by name first
      let statusRecord = await prisma.employeeStatusModel.findUnique({
        where: { name: status },
      });

      // If not found and status is a number, try by ID
      if (!statusRecord && !isNaN(parseInt(status))) {
        statusRecord = await prisma.employeeStatusModel.findUnique({
          where: { id: parseInt(status) },
        });
      }

      statusId = statusRecord?.id || null;
    }

    // Create user and employee profile in a transaction
    const user = await prisma.user.create({
      data: {
        username: generatedUsername,
        passwordHash: hashedPassword,
        salt,
        roleId: roleRecord.id,
        employeeProfile: {
          create: {
            firstName,
            lastName,
            middleName,
            contactNumber,
            personalEmail,
            address,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            positionId,
            departmentId,
            hireDate: hireDate ? new Date(hireDate) : null,
            statusId: statusId || 1, // Default to "active" status
          },
        },
      },
      include: {
        employeeProfile: {
          include: {
            position: true,
            department: true,
            status: true,
          },
        },
        role: true,
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
});
