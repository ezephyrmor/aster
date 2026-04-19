import { z } from "zod";
import { validate, formatZodErrors } from "./validation.utils";
import { NextResponse } from "next/server";

/**
 * Validate API request body against a Zod schema
 * Returns validated data or 400 error response
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<{ data?: z.infer<T>; error?: NextResponse }> {
  try {
    const body = await request.json();
    const result = await validate(body, schema);

    if (!result.success) {
      return {
        error: NextResponse.json(
          {
            error: "Validation failed",
            errors: result.errors,
          },
          { status: 400 },
        ),
      };
    }

    return { data: result.data };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Higher order function to wrap API route handlers with validation
 */
export function withValidation<T extends z.ZodTypeAny>(
  schema: T,
  handler: (
    data: z.infer<T>,
    request: Request,
    ...args: any[]
  ) => Promise<NextResponse>,
) {
  return async (request: Request, ...args: any[]) => {
    const { data, error } = await validateRequestBody(request, schema);

    if (error) {
      return error;
    }

    return handler(data, request, ...args);
  };
}
