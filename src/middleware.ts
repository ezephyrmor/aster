import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemoMode = process.env.DEMO_MODE === "true";

  console.log("process.env.DEMO_MODE:", process.env.DEMO_MODE);

  // Debug logging
  console.log(`[Middleware] Path: ${pathname}, DEMO_MODE: ${isDemoMode}`);

  // Only intercept if DEMO_MODE is enabled
  if (!isDemoMode) {
    console.log(`[Middleware] Skipping - DEMO_MODE not enabled`);
    return NextResponse.next();
  }

  // Intercept ALL API routes (not demo routes themselves)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/demo")) {
    const url = request.nextUrl.clone();
    // Rewrite /api/users -> /api/demo/users, /api/auth/login -> /api/demo/auth/login, etc.
    url.pathname = pathname.replace("/api/", "/api/demo/");
    console.log(`[Middleware] Rewriting ${pathname} -> ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  console.log(`[Middleware] No rewrite needed for ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
