import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies before importing
vi.mock("next-auth", () => ({
  default: vi.fn((config) => {
    return {
      handlers: {},
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      config,
    };
  }),
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("@/lib/db", () => ({
  default: {},
}));

vi.mock("@/lib/password", () => ({
  comparePassword: vi.fn(),
}));

vi.mock("@/config", () => ({
  generateFingerprint: vi.fn(),
  getClientIp: vi.fn(),
  generateNonce: vi.fn(() => "test-nonce-123"),
  securityConfig: {
    debugSessionSecurity: false,
  },
  SESSION_CONFIG: {
    maxAge: 86400,
    updateAge: 3600,
  },
}));

// Import after mocks are set up
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { comparePassword } from "@/lib/password";
import { generateFingerprint, getClientIp, generateNonce } from "@/config";

// Load the auth config
const module = await import("@/lib/next-auth");
const authConfig = (NextAuth as any).mock.calls[0][0];

describe("NextAuth Authentication System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should be configured with JWT session strategy", () => {
      expect(authConfig.session.strategy).toBe("jwt");
      expect(authConfig.session.maxAge).toBe(86400);
      expect(authConfig.session.updateAge).toBe(3600);
    });

    it("should have credentials provider configured", () => {
      const credentialsProvider = authConfig.providers.find(
        (p: any) => p.type === "credentials",
      );
      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider.name).toBe("Credentials");
    });

    it("should redirect to /login page", () => {
      expect(authConfig.pages.signIn).toBe("/login");
    });
  });

  describe("JWT Callback", () => {
    it("should copy all user properties to token on sign in", async () => {
      const user = {
        id: "1",
        username: "test@example.com",
        roleId: 2,
        companyId: 123,
        companyName: "Test Company",
        role: { id: 2, name: "Admin" },
        ip: "127.0.0.1",
        fingerprint: "hash123",
        userAgent: "Chrome",
        timestamp: 1234567890,
        nonce: "abc123",
      };

      const token = await authConfig.callbacks.jwt({ token: {}, user });

      expect(token.id).toBe(user.id);
      expect(token.username).toBe(user.username);
      expect(token.roleId).toBe(user.roleId);
      expect(token.companyId).toBe(user.companyId);
      expect(token.companyName).toBe(user.companyName);
      expect(token.role).toEqual(user.role);
      expect(token.ip).toBe(user.ip);
      expect(token.fingerprint).toBe(user.fingerprint);
      expect(token.userAgent).toBe(user.userAgent);
      expect(token.timestamp).toBe(user.timestamp);
      expect(token.nonce).toBe(user.nonce);
    });

    it("should add timestamp and nonce if missing from token", async () => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890000);

      const token = await authConfig.callbacks.jwt({ token: {}, user: null });

      expect(token.timestamp).toBe(1234567890);
      expect(token.nonce).toBe("test-nonce-123");
    });
  });

  describe("Session Callback", () => {
    it("should map token properties to session user", async () => {
      const token = {
        id: "1",
        username: "test@example.com",
        roleId: 2,
        companyId: 123,
        companyName: "Test Company",
        role: { id: 2, name: "Admin" },
      };

      const session = await authConfig.callbacks.session({
        session: { user: {} },
        token,
      });

      expect(session.user.id).toBe(token.id);
      expect(session.user.username).toBe(token.username);
      expect(session.user.roleId).toBe(token.roleId);
      expect(session.user.companyId).toBe(token.companyId);
      expect(session.user.companyName).toBe(token.companyName);
      expect(session.user.role).toEqual(token.role);
    });

    it("should not expose security attributes by default", async () => {
      const token = {
        id: "1",
        username: "test@example.com",
        ip: "127.0.0.1",
        fingerprint: "hash123",
        timestamp: 1234567890,
        nonce: "abc123",
      };

      const { securityConfig } = await import("@/config");
      securityConfig.debugSessionSecurity = false;

      const session = await authConfig.callbacks.session({
        session: { user: {} },
        token,
      });

      expect(session.security).toBeUndefined();
    });

    it("should expose security attributes when debug mode is enabled", async () => {
      const token = {
        id: "1",
        username: "test@example.com",
        ip: "127.0.0.1",
        fingerprint: "hash123",
        userAgent: "Chrome",
        timestamp: 1234567890,
        nonce: "abc123",
      };

      const { securityConfig } = await import("@/config");
      securityConfig.debugSessionSecurity = true;

      const session = await authConfig.callbacks.session({
        session: { user: {} },
        token,
      });

      expect(session.security).toBeDefined();
      expect(session.security.ip).toBe(token.ip);
      expect(session.security.fingerprint).toBe(token.fingerprint);
      expect(session.security.userAgent).toBe(token.userAgent);
      expect(session.security.timestamp).toBe(token.timestamp);
      expect(session.security.nonce).toBe(token.nonce);
    });
  });

  describe("Error Handling", () => {
    it("should suppress CredentialsSignin errors", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      authConfig.onError({ name: "CredentialsSignin" });
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      authConfig.onError({ name: "OtherError", message: "Test error" });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Auth error:", {
        name: "OtherError",
        message: "Test error",
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
