import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/next-auth";
import { validateSessionSecurity } from "@/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemoMode = process.env.DEMO_MODE === "true";

  // Skip auth check for public routes
  const publicPaths = [
    "/login",
    "/_next",
    "/favicon.ico",
    "/api/auth",
    "/api/captcha",
  ];
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

  // Extract token from auth (we need to access the raw JWT token)
  // @ts-ignore - token is available on session in NextAuth v5
  const token = session?.token;

  // Validate session security attributes
  if (token) {
    const securityCheck = await validateSessionSecurity(token, request);
    if (!securityCheck.valid) {
      console.log(`Session invalid: ${securityCheck.reason}`);

      // Clear session and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      loginUrl.searchParams.set("reason", securityCheck.reason || "");

      const response = NextResponse.redirect(loginUrl);
      // Clear auth cookies
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("next-auth.csrf-token");

      return response;
    }
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
