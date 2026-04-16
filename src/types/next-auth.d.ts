import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    roleId: number;
    role: {
      id: number;
      name: string;
      description: string | null;
    };
  }

  interface Session {
    user: User;
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
    roleId: number;
    role: {
      id: number;
      name: string;
      description: string | null;
    };
    // Security attributes
    ip?: string;
    fingerprint?: string;
    userAgent?: string;
    timestamp?: number;
    nonce?: string;
  }
}
