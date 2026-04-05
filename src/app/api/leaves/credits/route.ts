import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/leaves/credits - Get user's leave credits
// Query params: userId (optional, for managers viewing team member credits)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get all leave credits for the user
    const credits = await prisma.leaveCredit.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { earnedDate: "desc" },
      include: {
        leaveUsage: {
          include: {
            leaveRequest: {
              include: {
                leaveType: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Calculate available credits (unused)
    const availableCredits = credits.filter((c) => !c.usedDate).length;
    const usedCredits = credits.filter((c) => c.usedDate).length;

    // Group credits by month/year for display
    const creditsByMonth = credits.reduce(
      (acc, credit) => {
        const key = `${credit.earnedDate.getFullYear()}-${String(credit.earnedDate.getMonth() + 1).padStart(2, "0")}`;
        if (!acc[key]) {
          acc[key] = {
            total: 0,
            used: 0,
            available: 0,
            earnedDate: credit.earnedDate,
          };
        }
        acc[key].total++;
        if (credit.usedDate) {
          acc[key].used++;
        } else {
          acc[key].available++;
        }
        return acc;
      },
      {} as Record<
        string,
        { total: number; used: number; available: number; earnedDate: Date }
      >,
    );

    return NextResponse.json({
      userId: parseInt(userId),
      totalCredits: credits.length,
      availableCredits,
      usedCredits,
      credits,
      creditsByMonth: Object.entries(creditsByMonth)
        .map(([key, value]) => ({
          period: key,
          ...value,
        }))
        .sort((a, b) => b.period.localeCompare(a.period)),
    });
  } catch (error) {
    console.error("Error fetching leave credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave credits" },
      { status: 500 },
    );
  }
}
