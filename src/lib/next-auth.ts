import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";
import { comparePassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

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
            roleId: true,
            companyId: true,
            role: {
              select: {
                id: true,
                name: true,
                description: true,
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

        // Return user data (excluding password)
        return {
          id: user.id.toString(),
          username: user.username,
          roleId: user.roleId,
          companyId: user.companyId,
          companyName: user.company?.name,
          role: user.role,
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
