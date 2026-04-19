import { NextResponse } from "next/server";
import {
  generateCaptchaText,
  generateSignedToken,
  generateCaptchaSvg,
} from "@/lib/captcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const text = generateCaptchaText();
  const token = generateSignedToken(text);
  const image = generateCaptchaSvg(text);

  return NextResponse.json({
    token,
    image,
  });
}
