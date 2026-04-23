import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const industries = await db.industry.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(industries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch industries" },
      { status: 500 },
    );
  }
}
