import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    roleId: number;
    companyId: number;
    companyName?: string;
    role: {
      id: number;
      name: string;
      description: string | null;
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    roleId: number;
    companyId: number;
    companyName?: string;
    role: {
      id: number;
      name: string;
      description: string | null;
    };
  }
}
