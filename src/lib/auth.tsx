"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface Role {
  id: number;
  name: string;
  description: string | null;
}

interface User {
  id: number;
  username: string;
  roleId: number;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const user = session?.user
    ? ({
        ...session.user,
        id: parseInt(session.user.id, 10),
      } as User)
    : null;

  const login = async (username: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
