import NextAuth from "next-auth";
import type { UserNavigation } from "./navigation";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    roleId: string;
    companyId: string;
    companyName?: string;
    role: {
      id: string;
      name: string;
      description: string | null;
    };
  }

  interface Session {
    user: User;
    navigation?: UserNavigation;
    // Debug security attributes (only available in development mode)
    security?: {
      ip?: string;
      fingerprint?: string;
      userAgent?: string;
      timestamp?: number;
      nonce?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    roleId: string;
    companyId: string;
    companyName?: string;
    role: {
      id: string;
      name: string;
      description: string | null;
    };
    navigation?: UserNavigation;
    // Security attributes
    ip?: string;
    fingerprint?: string;
    userAgent?: string;
    timestamp?: number;
    nonce?: string;
  }
}
