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
            role: true,
          },
        },
      },
    });

    console.log("Fetched user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return raw objects with ids - frontend handles name mapping
    const formattedUser = {
      ...user,
      employeeProfile: user.employeeProfile,
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

      // Update employee profile
      const updateProfileData: any = {};

      // Update role if provided
      if (roleId !== undefined) {
        updateProfileData.roleId = roleId;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {},
        include: {
          employeeProfile: {
            include: {
              position: true,
              department: true,
              status: true,
              role: true,
            },
          },
        },
      });

      // Update employee profile if it exists
      if (updatedUser.employeeProfile) {
        // Add other profile fields
        updateProfileData.firstName = firstName;
        updateProfileData.lastName = lastName;
        updateProfileData.middleName = middleName;
        updateProfileData.contactNumber = contactNumber;
        updateProfileData.personalEmail = personalEmail;
        updateProfileData.address = address;
        updateProfileData.dateOfBirth = dateOfBirth
          ? new Date(dateOfBirth)
          : null;
        updateProfileData.hireDate = hireDate ? new Date(hireDate) : null;

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
        let statusChanged = false;
        let newStatusId: number | null = null;

        if (status !== undefined) {
          let statusRecord = null;

          // First try exact match
          statusRecord = await prisma.employeeStatusModel.findUnique({
            where: { name: status },
          });

          // Try case insensitive match using manual lower case comparison
          if (!statusRecord) {
            const allStatuses = await prisma.employeeStatusModel.findMany();
            statusRecord =
              allStatuses.find(
                (s) => s.name.toLowerCase() === status.toLowerCase(),
              ) || null;
          }

          // Try by ID
          if (!statusRecord && !isNaN(parseInt(status))) {
            statusRecord = await prisma.employeeStatusModel.findUnique({
              where: { id: parseInt(status) },
            });
          }

          if (statusRecord) {
            // Check if status actually changed
            if (existingUser.employeeProfile?.statusId !== statusRecord.id) {
              statusChanged = true;
              newStatusId = statusRecord.id;
              updateProfileData.statusId = statusRecord.id;
            }
          }
        }

        await prisma.employeeProfile.update({
          where: { userId: userId },
          data: updateProfileData as any,
        });

        // Create status history record if status was changed
        if (statusChanged && newStatusId) {
          // Get IP and user agent for audit log
          const ipAddress =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            request.headers.get("remote-host") ||
            null;

          const userAgent = request.headers.get("user-agent") || null;

          await prisma.employeeStatusHistory.create({
            data: {
              userId,
              statusId: newStatusId,
              effectiveDate: new Date(),
              reason: "Status updated via profile edit",
              notes: "Changed through user profile edit page",
              performedBy: parseInt(auth.user.id),
              ipAddress,
              userAgent,
            },
          });
        }
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
              role: true,
            },
          },
        },
      });

      if (!updatedUserResult) {
        return NextResponse.json(
          { error: "User not found after update" },
          { status: 404 },
        );
      }

      // Return raw objects with ids - frontend handles name mapping
      const formattedUser = {
        ...updatedUserResult,
        employeeProfile: updatedUserResult.employeeProfile,
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
