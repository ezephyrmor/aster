import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Get counts for main entities
    const [
      totalUsers,
      totalEmployees,
      totalBrands,
      totalTeams,
      activeBrands,
      inactiveBrands,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.employeeProfile.count(),
      prisma.brand.count(),
      prisma.team.count(),
      prisma.brand.count({ where: { status: "active" } }),
      prisma.brand.count({ where: { status: "inactive" } }),
    ]);

    // Get recent activity from team history
    const recentActivity = await prisma.teamHistory.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        team: {
          select: {
            name: true,
          },
        },
        teamMember: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    // Get brands by industry
    const brandsByIndustry = await prisma.industry.findMany({
      include: {
        _count: {
          select: {
            brands: true,
          },
        },
      },
    });

    // Get users by role
    const usersByRole = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Get team members by status
    const activeTeamMembers = await prisma.teamMember.count({
      where: { status: "active" },
    });
    const inactiveTeamMembers = await prisma.teamMember.count({
      where: { status: "inactive" },
    });

    // Get teams per brand
    const teamsPerBrand = await prisma.brand.findMany({
      include: {
        _count: {
          select: {
            teams: true,
          },
        },
      },
      orderBy: {
        teams: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const newBrandsThisMonth = await prisma.brand.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const newTeamsThisMonth = await prisma.team.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Calculate average team size
    const totalTeamMembers = activeTeamMembers + inactiveTeamMembers;
    const averageTeamSize =
      totalTeams > 0 ? (totalTeamMembers / totalTeams).toFixed(1) : "0";

    // Format recent activity for the frontend
    const formattedActivity = recentActivity.map(
      (activity: {
        id: number;
        action: string;
        team?: { name: string } | null;
        teamMember?: {
          user?: { username: string } | null;
        } | null;
        createdAt: Date;
      }) => ({
        id: activity.id,
        action: formatActivityAction(activity.action),
        description: getActivityDescription(activity),
        time: getTimeAgo(activity.createdAt),
        type: getActivityType(activity.action),
      }),
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEmployees,
        totalBrands,
        totalTeams,
        activeBrands,
        inactiveBrands,
        activeTeamMembers,
        inactiveTeamMembers,
        averageTeamSize,
      },
      growth: {
        newUsersThisMonth,
        newBrandsThisMonth,
        newTeamsThisMonth,
      },
      recentActivity: formattedActivity,
      distributions: {
        brandsByIndustry: brandsByIndustry.map(
          (industry: { name: string; _count: { brands: number } }) => ({
            name: industry.name,
            count: industry._count.brands,
          }),
        ),
        usersByRole: usersByRole.map(
          (role: { name: string; _count: { users: number } }) => ({
            name: role.name,
            count: role._count.users,
          }),
        ),
        teamsPerBrand: teamsPerBrand.map(
          (brand: { name: string; _count: { teams: number } }) => ({
            name: brand.name,
            count: brand._count.teams,
          }),
        ),
      },
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}

function formatActivityAction(action: string): string {
  const actions: Record<string, string> = {
    joined: "Joined",
    left: "Left",
    promoted: "Promoted",
    demoted: "Demoted",
    removed: "Removed",
    created: "Created",
    updated: "Updated",
  };
  return actions[action] || action;
}

function getActivityDescription(activity: {
  action: string;
  team?: { name: string } | null;
  teamMember?: {
    user?: { username: string } | null;
  } | null;
}): string {
  const teamName = activity.team?.name || "Unknown Team";

  switch (activity.action) {
    case "joined":
      return `${activity.teamMember?.user?.username || "User"} joined ${teamName}`;
    case "left":
      return `${activity.teamMember?.user?.username || "User"} left ${teamName}`;
    case "promoted":
      return `${activity.teamMember?.user?.username || "User"} was promoted in ${teamName}`;
    case "demoted":
      return `${activity.teamMember?.user?.username || "User"} was demoted in ${teamName}`;
    case "created":
      return `Team "${teamName}" was created`;
    case "updated":
      return `Team "${teamName}" was updated`;
    case "removed":
      return `${activity.teamMember?.user?.username || "User"} was removed from ${teamName}`;
    default:
      return `Activity in ${teamName}`;
  }
}

function getActivityType(action: string): string {
  const types: Record<string, string> = {
    joined: "user",
    left: "user",
    promoted: "user",
    demoted: "user",
    removed: "user",
    created: "team",
    updated: "team",
  };
  return types[action] || "team";
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
}
