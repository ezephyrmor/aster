import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/users/[id] - Get single user with profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employeeProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id] - Update user and employee profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
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
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user (only role can be changed, username is locked)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || existingUser.role,
      },
      include: {
        employeeProfile: true,
      },
    });

    // Update employee profile if it exists
    if (updatedUser.employeeProfile) {
      await prisma.employeeProfile.update({
        where: { userId: userId },
        data: {
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
          status: status || updatedUser.employeeProfile.status,
        },
      });
    }

    // Fetch updated user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employeeProfile: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id] - Soft delete (set status to terminated)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employeeProfile: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete - set employee status to terminated
    if (existingUser.employeeProfile) {
      await prisma.employeeProfile.update({
        where: { userId: userId },
        data: {
          status: "terminated",
        },
      });
    }

    return NextResponse.json({
      message: "User terminated successfully",
      userId: userId,
    });
  } catch (error) {
    console.error("Error terminating user:", error);
    return NextResponse.json(
      { error: "Failed to terminate user" },
      { status: 500 },
    );
  }
}
