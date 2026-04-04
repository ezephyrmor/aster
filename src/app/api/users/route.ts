import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, generateSalt } from "@/lib/password";

// GET /api/users - List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        employeeProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
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
    } = body;

    // Validate required fields
    if (!username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Username, password, first name, and last name are required" },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    // Create user and employee profile in a transaction
    const user = await prisma.user.create({
      data: {
        username,
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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
