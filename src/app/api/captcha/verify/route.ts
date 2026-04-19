import { NextResponse } from "next/server";
import { verifyCaptchaToken } from "@/lib/captcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { token, answer } = await request.json();

    if (!token || !answer) {
      return NextResponse.json(
        { valid: false, error: "Token and answer are required" },
        { status: 400 },
      );
    }

    const result = verifyCaptchaToken(token, answer);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
