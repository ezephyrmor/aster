import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { buildUserNavigation } from "@/lib/navigation-builder";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const navigation = await buildUserNavigation({
      roleId: session.user.roleId,
      companyId: session.user.companyId,
    });

    return NextResponse.json(navigation);
  } catch (error) {
    console.error("Navigation API error:", error);
    return NextResponse.json({ items: [] });
  }
}
