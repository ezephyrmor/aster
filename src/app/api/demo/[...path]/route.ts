import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/demo/store";

// GET handler for demo API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");

  try {
    // Route handling based on path
    switch (path) {
      // User routes
      case "users": {
        const users = demoStore.getUsers();
        return NextResponse.json({
          users,
          pagination: {
            total: users.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }
      case "users/me":
        // Return first admin user for demo
        const adminUser = demoStore.getUserById(1);
        return NextResponse.json(adminUser);
      case "users/search":
        return NextResponse.json(demoStore.getUsers());

      // Team routes
      case "teams": {
        const teams = demoStore.getTeams();
        const brands = demoStore.getBrands();
        // Add brand relation and _count to each team for compatibility with TeamColumns
        const teamsWithBrand = teams.map((team, index) => ({
          ...team,
          brand: brands[index % brands.length] || { id: 1, name: "Aster HR" },
          _count: {
            members: Math.floor(Math.random() * 10) + 1, // Random count for demo
          },
        }));
        return NextResponse.json({
          teams: teamsWithBrand,
          pagination: {
            total: teams.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }

      // Brand routes
      case "brands": {
        const brands = demoStore.getBrands();
        // Add _count to each brand for compatibility with BrandColumns
        const brandsWithCount = brands.map((brand) => ({
          ...brand,
          _count: {
            teams: Math.floor(Math.random() * 5), // Random count for demo
          },
        }));
        return NextResponse.json({
          brands: brandsWithCount,
          pagination: {
            total: brands.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }

      // Schedule routes
      case "schedules": {
        const schedules = demoStore.getSchedules();
        return NextResponse.json({
          schedules,
          pagination: {
            total: schedules.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }

      // Attendance routes
      case "attendance/clock":
        // Return mock attendance status
        const userId = request.nextUrl.searchParams.get("userId");
        if (userId) {
          const attendance = demoStore.getAttendanceByUserId(userId);
          const schedule = demoStore.getScheduleByUserId(userId);
          return NextResponse.json({
            attendance: attendance[0] || null,
            schedule: schedule,
            canClockIn: !attendance[0]?.clockIn,
            canClockOut: !!(attendance[0]?.clockIn && !attendance[0].clockOut),
          });
        }
        return NextResponse.json(demoStore.getAttendance());

      // Leave routes
      case "leaves/types":
        return NextResponse.json(demoStore.getLeaveTypes());
      case "leaves/requests": {
        const leaveRequests = demoStore.getLeaveRequests();
        const users = demoStore.getUsers();
        // Add nested relations to each leave request for compatibility with LeaveColumns
        const leaveRequestsWithRelations = leaveRequests.map(
          (request, index) => ({
            ...request,
            user: {
              id: users[index % users.length]?.id || 1,
              username: users[index % users.length]?.email || "demo@demo.com",
              employeeProfile: {
                firstName: users[index % users.length]?.firstName || "Demo",
                lastName: users[index % users.length]?.lastName || "User",
              },
            },
            leaveType: {
              id: request.typeId || 1,
              name: "Vacation Leave",
              color: "blue",
            },
            status: {
              id: 1,
              name:
                request.status === "approved"
                  ? "Approved"
                  : request.status === "rejected"
                    ? "Rejected"
                    : "Pending",
              color:
                request.status === "approved"
                  ? "green"
                  : request.status === "rejected"
                    ? "red"
                    : "yellow",
              isFinal: request.status !== "pending",
            },
            reviewer: null,
            reviewedAt: null,
            reviewComment: null,
          }),
        );
        return NextResponse.json({
          leaveRequests: leaveRequestsWithRelations,
          pagination: {
            total: leaveRequests.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }
      case "leaves/statuses":
        return NextResponse.json([
          { id: 1, name: "Pending" },
          { id: 2, name: "Approved" },
          { id: 3, name: "Rejected" },
        ]);
      case "leaves/credits":
        return NextResponse.json([
          { id: 1, userId: 2, typeId: 1, days: 15, usedDays: 3 },
          { id: 2, userId: 2, typeId: 2, days: 15, usedDays: 2 },
        ]);

      // Infraction routes
      case "infraction-types":
        return NextResponse.json(demoStore.getInfractionTypes());
      case "infractions": {
        const infractions = demoStore.getInfractions();
        return NextResponse.json({
          infractions,
          pagination: {
            total: infractions.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }

      // My infractions routes
      case "my-infractions": {
        const infractions = demoStore.getInfractionsByUserId(2);
        return NextResponse.json({
          infractions,
          pagination: {
            total: infractions.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      }

      case "my-infractions/1":
        // Return specific infraction for demo
        return NextResponse.json(demoStore.getInfractionById(1));

      // Infraction offenses (used by infractions page)
      case "infraction-offenses":
        return NextResponse.json([
          {
            id: 1,
            offenseLevel: 1,
            description: "First offense - Verbal warning",
            suspensionDays: null,
          },
          {
            id: 2,
            offenseLevel: 2,
            description: "Second offense - Written warning",
            suspensionDays: null,
          },
          {
            id: 3,
            offenseLevel: 3,
            description: "Third offense - Suspension (1-3 days)",
            suspensionDays: 2,
          },
          {
            id: 4,
            offenseLevel: 4,
            description: "Fourth offense - Termination",
            suspensionDays: null,
          },
        ]);

      // Calendar routes
      case "calendar/events": {
        const events = demoStore.getCalendarEvents();
        return NextResponse.json({
          events,
          pagination: {
            total: events.length,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        });
      }

      // Analytics routes
      case "analytics":
        return NextResponse.json(demoStore.getAnalytics());

      default:
        // Handle dynamic routes like users/[id], teams/[id], etc.
        const pathParts = path.split("/");

        // Handle single resource requests (e.g., users/1)
        if (pathParts.length === 2) {
          const [resource, id] = pathParts;
          const resourceId = id;

          switch (resource) {
            case "users":
              const user = demoStore.getUserById(resourceId);
              return user
                ? NextResponse.json(user)
                : NextResponse.json(
                    { error: "User not found" },
                    { status: 404 },
                  );
            case "teams":
              const team = demoStore.getTeamById(resourceId);
              return team
                ? NextResponse.json(team)
                : NextResponse.json(
                    { error: "Team not found" },
                    { status: 404 },
                  );
            case "brands":
              const brand = demoStore.getBrandById(resourceId);
              return brand
                ? NextResponse.json(brand)
                : NextResponse.json(
                    { error: "Brand not found" },
                    { status: 404 },
                  );
            case "schedules":
              const schedule = demoStore.getScheduleById(resourceId);
              return schedule
                ? NextResponse.json(schedule)
                : NextResponse.json(
                    { error: "Schedule not found" },
                    { status: 404 },
                  );
            case "infractions": {
              const infraction = demoStore.getInfractionById(resourceId);
              if (infraction) {
                // Add nested relations for compatibility with infractions detail page
                const users = demoStore.getUsers();
                const user =
                  users.find((u) => u.id === infraction.userId) || users[0];
                const infractionTypes = demoStore.getInfractionTypes();
                const type =
                  infractionTypes.find((t) => t.id === infraction.typeId) ||
                  infractionTypes[0];

                // Map severity to color
                const color = type.severity === "minor" ? "yellow" : "orange";
                // Map status to acknowledgedBy
                const acknowledgedBy =
                  infraction.status === "acknowledged" ? 1 : null;

                const normalizedInfraction = {
                  ...infraction,
                  user: {
                    id: user.id,
                    username: user.email,
                    employeeProfile: {
                      firstName: user.firstName,
                      lastName: user.lastName,
                      department: null,
                      position: null,
                    },
                  },
                  type: {
                    id: type.id,
                    name: type.name,
                    color: color,
                    description: null,
                  },
                  offense: {
                    id: 1,
                    name: infraction.description || "Minor offense",
                    severityLevel: 1,
                    description: null,
                    type: {
                      id: type.id,
                      name: type.name,
                      color: color,
                    },
                  },
                  creator: {
                    id: 1,
                    username: "admin@demo.com",
                    employeeProfile: {
                      firstName: "Admin",
                      lastName: "User",
                    },
                  },
                  ackUser: acknowledgedBy
                    ? {
                        id: 1,
                        username: "admin@demo.com",
                        employeeProfile: {
                          firstName: "Admin",
                          lastName: "User",
                        },
                      }
                    : null,
                };
                return NextResponse.json(normalizedInfraction);
              }
              return NextResponse.json(
                { error: "Infraction not found" },
                { status: 404 },
              );
            }
            default:
              return NextResponse.json(
                { error: "Resource not found" },
                { status: 404 },
              );
          }
        }

        return NextResponse.json(
          { error: "Endpoint not found" },
          { status: 404 },
        );
    }
  } catch (error) {
    console.error("Demo API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST handler for demo API (for login, create, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");

  console.log(`[Demo API POST] Path: ${path}`);

  try {
    switch (path) {
      // Auth routes
      case "auth/login": {
        const body = await request.json();
        // Accept both 'email' and 'username' for compatibility with login form
        const email = body.email || body.username;
        const password = body.password;
        const user = demoStore.validateCredentials(email, password);

        if (user) {
          return NextResponse.json({
            success: true,
            user,
            message: "Login successful",
          });
        }
        return NextResponse.json(
          { error: "Invalid credentials. Try admin@demo.com / demo123" },
          { status: 401 },
        );
      }

      case "auth/me":
        // Return the first admin user for demo
        const meUser = demoStore.getUserById(1);
        return NextResponse.json(meUser);

      case "auth/logout":
        return NextResponse.json({
          success: true,
          message: "Logged out successfully",
        });

      // Clock in/out
      case "attendance/clock": {
        const body = await request.json();
        const { userId, type } = body;

        // Simulate clock action
        return NextResponse.json({
          success: true,
          message: `Clocked ${type === "in" ? "in" : "out"} successfully`,
          attendance: {
            id: Date.now(),
            userId,
            date: new Date().toISOString().split("T")[0],
            clockIn: type === "in" ? new Date().toISOString() : undefined,
            clockOut: type === "out" ? new Date().toISOString() : undefined,
            status: "present",
            lateMinutes: 0,
            undertimeMinutes: 0,
          },
        });
      }

      // Leave request creation
      case "leaves/requests": {
        const body = await request.json();
        return NextResponse.json({
          success: true,
          message: "Leave request submitted successfully",
          leaveRequest: {
            id: Date.now(),
            ...body,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        });
      }

      // Leave request actions (approve/reject)
      case "leaves/requests/1": {
        const body = await request.json();
        return NextResponse.json({
          success: true,
          message:
            body.status === "approved" ? "Leave approved" : "Leave rejected",
        });
      }

      // Infraction acknowledgment
      case "infractions/1/acknowledge": {
        return NextResponse.json({
          success: true,
          message: "Infraction acknowledged successfully",
        });
      }

      // My infractions acknowledgment
      case "my-infractions/1/acknowledge": {
        return NextResponse.json({
          success: true,
          message: "Infraction acknowledged successfully",
        });
      }

      // Generic POST handlers for other endpoints (return success)
      default:
        // Handle generic POST to any endpoint
        if (path.includes("/")) {
          return NextResponse.json({
            success: true,
            message: "Operation completed successfully",
          });
        }
        return NextResponse.json(
          { error: "Endpoint not found" },
          { status: 404 },
        );
    }
  } catch (error) {
    console.error("Demo API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
