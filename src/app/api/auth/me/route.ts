import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("user")?.value;

    if (!userCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = JSON.parse(userCookie);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
