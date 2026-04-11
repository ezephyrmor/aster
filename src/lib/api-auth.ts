import { auth } from "./next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * API Route Authentication Guard
 * Validates NextAuth session and JWT token
 * Returns 401 Unauthorized if session is invalid
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized - Valid session required" },
      { status: 401 },
    );
  }

  return {
    session,
    user: session.user,
    userId: session.user.id,
  };
}

/**
 * Higher order function to wrap API route handlers with authentication
 */
export function withAuth(
  handler: (request: NextRequest, context: any, auth: any) => Promise<Response>,
) {
  return async function authenticatedHandler(
    request: NextRequest,
    context: any,
  ) {
    const authResult = await requireAuth(request);

    // If authResult is a Response, it means authentication failed
    if (authResult instanceof Response) {
      return authResult;
    }

    // Pass authenticated user to handler
    return handler(request, context, authResult);
  };
}
