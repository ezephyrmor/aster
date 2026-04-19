import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format response to maintain backward compatibility
    const formattedUser = {
      ...user,
      employeeProfile: user.employeeProfile
        ? {
            ...user.employeeProfile,
            position: user.employeeProfile.position?.name || null,
            department: user.employeeProfile.department?.name || null,
            status: user.employeeProfile.status?.name || "active",
          }
        : null,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id] - Update user and employee profile
export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    auth: any,
  ) => {
    try {
      const { id } = await params;
      const userId = parseInt(id);
      const companyId = auth.user.companyId;

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
        include: {
          employeeProfile: true,
        },
      });

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get role ID if role is provided
      let roleId: number | undefined;
      if (role) {
        const roleRecord = await prisma.role.findUnique({
          where: {
            companyId_name: {
              companyId,
              name: role,
            },
          },
        });
        if (roleRecord) {
          roleId = roleRecord.id;
        }
      }

      // Update user (only role can be changed, username is locked)
      interface UpdateUserData {
        roleId?: number;
      }
      const updateUserData: UpdateUserData = {};
      if (roleId !== undefined) {
        updateUserData.roleId = roleId;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateUserData,
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

      // Update employee profile if it exists
      if (updatedUser.employeeProfile) {
        const updateProfileData: any = {
          firstName,
          lastName,
          middleName,
          contactNumber,
          personalEmail,
          address,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          hireDate: hireDate ? new Date(hireDate) : null,
        };

        // Add emergency contact fields only if they exist in schema
        if (emergencyContactName !== undefined)
          updateProfileData.emergencyContactName = emergencyContactName;
        if (emergencyContactNumber !== undefined)
          updateProfileData.emergencyContactNumber = emergencyContactNumber;
        if (emergencyContactRelation !== undefined)
          updateProfileData.emergencyContactRelation = emergencyContactRelation;

        // Handle position (can be name or ID)
        if (position !== undefined) {
          if (position === null || position === "") {
            updateProfileData.positionId = null;
          } else {
            let positionRecord = await prisma.position.findUnique({
              where: {
                companyId_name: {
                  companyId,
                  name: position,
                },
              },
            });
            if (!positionRecord && !isNaN(parseInt(position))) {
              positionRecord = await prisma.position.findUnique({
                where: { id: parseInt(position) },
              });
            }
            updateProfileData.positionId = positionRecord?.id || null;
          }
        }

        // Handle department (can be name or ID)
        if (department !== undefined) {
          if (department === null || department === "") {
            updateProfileData.departmentId = null;
          } else {
            let departmentRecord = await prisma.department.findUnique({
              where: {
                companyId_name: {
                  companyId,
                  name: department,
                },
              },
            });
            if (!departmentRecord && !isNaN(parseInt(department))) {
              departmentRecord = await prisma.department.findUnique({
                where: { id: parseInt(department) },
              });
            }
            updateProfileData.departmentId = departmentRecord?.id || null;
          }
        }

        // Handle status (can be name or ID)
        if (status !== undefined) {
          let statusRecord = await prisma.employeeStatusModel.findUnique({
            where: { name: status },
          });
          if (!statusRecord && !isNaN(parseInt(status))) {
            statusRecord = await prisma.employeeStatusModel.findUnique({
              where: { id: parseInt(status) },
            });
          }
          if (statusRecord) {
            updateProfileData.statusId = statusRecord.id;
          }
        }

        await prisma.employeeProfile.update({
          where: { userId: userId },
          data: updateProfileData as any,
        });
      }

      // Fetch updated user
      const updatedUserResult = await prisma.user.findUnique({
        where: { id: userId },
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

      if (!updatedUserResult) {
        return NextResponse.json(
          { error: "User not found after update" },
          { status: 404 },
        );
      }

      // Format response to maintain backward compatibility
      const formattedUser = {
        ...updatedUserResult,
        employeeProfile: updatedUserResult.employeeProfile
          ? {
              ...updatedUserResult.employeeProfile,
              position:
                updatedUserResult.employeeProfile.position?.name || null,
              department:
                updatedUserResult.employeeProfile.department?.name || null,
              status:
                updatedUserResult.employeeProfile.status?.name || "active",
            }
          : null,
      };

      return NextResponse.json(formattedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }
  },
);

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

    // Get terminated status
    const terminatedStatus = await prisma.employeeStatusModel.findUnique({
      where: { name: "terminated" },
    });

    // Soft delete - set employee status to terminated
    if (existingUser.employeeProfile && terminatedStatus) {
      await prisma.employeeProfile.update({
        where: { userId: userId },
        data: {
          statusId: terminatedStatus.id,
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
