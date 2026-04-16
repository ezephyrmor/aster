import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/next-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemoMode = process.env.DEMO_MODE === "true";

  // Skip auth check for public routes
  const publicPaths = ["/login", "/_next", "/favicon.ico", "/api/auth"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    // Handle demo mode API rewrite for public paths
    if (
      isDemoMode &&
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/demo")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace("/api/", "/api/demo/");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Check for valid session
  const session = await auth();

  // If session is expired or invalid, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Demo mode API rewrite logic
  if (
    isDemoMode &&
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/demo")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/api/", "/api/demo/");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
