import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { buildUserNavigation } from "@/lib/navigation-builder";
import {
  generateFingerprint,
  getClientIp,
  generateNonce,
  securityConfig,
  SESSION_CONFIG,
} from "@/config";
import type { NextRequest } from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: SESSION_CONFIG.maxAge,
    updateAge: SESSION_CONFIG.updateAge,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        captchaValidated: { label: "CAPTCHA Validated", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // CAPTCHA validation happens server-side in API route before reaching here
        // No crypto imports in this file to maintain Edge Runtime compatibility

        // Check demo mode first
        if (process.env.DEMO_MODE === "true") {
          const { demoStore } = await import("@/lib/demo/store");
          const demoUser = demoStore.validateCredentials(
            credentials.username as string,
            credentials.password as string,
          );

          if (demoUser) {
            return {
              id: demoUser.id.toString(),
              username: demoUser.email,
              roleId: demoUser.roleId,
              role: demoUser.role,
            } as any;
          }
          return null;
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
          select: {
            id: true,
            username: true,
            passwordHash: true,
            salt: true,
            companyId: true,
            employeeProfile: {
              select: {
                roleId: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            company: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        // Verify password
        const isValidPassword = await comparePassword(
          credentials.password as string,
          user.passwordHash,
          user.salt,
        );

        if (!isValidPassword) {
          return null;
        }

        // Return user data including captured security attributes
        return {
          id: user.id.toString(),
          username: user.username,
          roleId: user.employeeProfile.roleId,
          companyId: user.companyId,
          companyName: user.company?.name,
          role: user.employeeProfile.role,
          ip: getClientIp(req),
          fingerprint: await generateFingerprint(req),
          userAgent: req.headers.get("user-agent") || "",
          timestamp: Math.floor(Date.now() / 1000),
          nonce: generateNonce(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.roleId = user.roleId;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.role = user.role;

        console.log("JWT token generated:", JSON.stringify(token, null, 2));

        // Security attributes captured during signIn callback
        if ((user as any).ip) token.ip = (user as any).ip;
        if ((user as any).fingerprint)
          token.fingerprint = (user as any).fingerprint;
        if ((user as any).userAgent) token.userAgent = (user as any).userAgent;
        if ((user as any).timestamp) token.timestamp = (user as any).timestamp;
        if ((user as any).nonce) token.nonce = (user as any).nonce;
      }

      // Always ensure timestamp and nonce exist
      if (!token.timestamp) {
        token.timestamp = Math.floor(Date.now() / 1000);
        token.nonce = generateNonce();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.roleId = token.roleId as number;
        session.user.companyId = token.companyId as number;
        session.user.companyName = token.companyName as string;
        session.user.role = token.role;
      }

      console.log("Session object built:", JSON.stringify(session, null, 2));

      /**
       * DEBUG_SESSION_SECURITY
       *
       * When set to true, exposes internal security validation attributes on the session object.
       * These attributes include: client IP address, browser fingerprint hash, user agent string,
       * session creation timestamp, and cryptographically secure nonce.
       *
       * ⚠️ SECURITY WARNING: Never enable this in production environments.
       * This is for development debugging purposes only. Exposing these attributes
       * in production can leak sensitive security information to client-side code.
       */
      if (securityConfig.debugSessionSecurity) {
        // @ts-ignore - Add security debug info to session
        session.security = {
          ip: token.ip,
          fingerprint: token.fingerprint,
          userAgent: token.userAgent,
          timestamp: token.timestamp,
          nonce: token.nonce,
        };
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },

  // Suppress CredentialsSignin errors from being logged to console
  onError: (error) => {
    // Ignore expected authentication failure errors
    if (error.name === "CredentialsSignin") {
      return;
    }
    // Log all other actual errors
    console.error("Auth error:", error);
  },
});
