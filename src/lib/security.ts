import type { NextRequest } from "next/server";

/**
 * Generates SHA-256 hash using Web Crypto API (Edge Runtime compatible)
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a browser fingerprint from request headers
 */
export async function generateFingerprint(
  request: NextRequest,
): Promise<string> {
  const userAgent = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const acceptEncoding = request.headers.get("accept-encoding") || "";

  const fingerprintSource = `${userAgent}|${accept}|${acceptLanguage}|${acceptEncoding}`;

  return sha256(fingerprintSource);
}

/**
 * Extracts client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return (request as any).ip || "127.0.0.1";
}

/**
 * Verifies if timestamp is within allowed window for anti-replay
 */
export function isTimestampValid(
  timestamp: number,
  maxAgeSeconds: number = 300,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  return age >= 0 && age <= maxAgeSeconds;
}

/**
 * Generates cryptographically secure nonce using Web Crypto API
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Security configuration
 * All security feature toggles and settings are managed here
 */
export const securityConfig = {
  /** Bind session to client IP address */
  ipLockEnabled: true,

  /** Bind session to browser fingerprint */
  fingerprintEnabled: true,

  /** Validate User-Agent header matches */
  userAgentValidationEnabled: true,

  /** Anti-replay protection using timestamps */
  antiReplayEnabled: true,

  /** Maximum allowed token age for anti-replay (seconds) */
  maxTokenAge: 300,
} as const;

/**
 * Validates all security attributes against current request
 */
export async function validateSessionSecurity(
  token: {
    ip?: string;
    fingerprint?: string;
    userAgent?: string;
    timestamp?: number;
    nonce?: string;
  },
  request: NextRequest,
): Promise<{ valid: boolean; reason?: string }> {
  // IP Address Locking
  if (securityConfig.ipLockEnabled && token.ip) {
    const currentIp = getClientIp(request);
    if (currentIp !== token.ip) {
      return { valid: false, reason: "IP address mismatch" };
    }
  }

  // Fingerprint Validation
  if (securityConfig.fingerprintEnabled && token.fingerprint) {
    const currentFingerprint = await generateFingerprint(request);
    if (currentFingerprint !== token.fingerprint) {
      return { valid: false, reason: "Browser fingerprint mismatch" };
    }
  }

  // User Agent Validation
  if (securityConfig.userAgentValidationEnabled && token.userAgent) {
    const currentUserAgent = request.headers.get("user-agent") || "";
    if (currentUserAgent !== token.userAgent) {
      return { valid: false, reason: "User agent mismatch" };
    }
  }

  // Anti-Replay Protection
  if (securityConfig.antiReplayEnabled && token.timestamp) {
    if (!isTimestampValid(token.timestamp, securityConfig.maxTokenAge)) {
      return { valid: false, reason: "Token expired or invalid timestamp" };
    }
  }

  return { valid: true };
}
