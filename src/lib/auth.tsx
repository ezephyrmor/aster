"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface User {
  id: string;
  username: string;
  roleId: string;
  companyId: string;
  companyName?: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    captchaToken?: string,
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
        id: session.user.id,
      } as User)
    : null;

  const login = async (
    username: string,
    password: string,
    captchaToken?: string,
  ) => {
    try {
      const result = await signIn("credentials", {
        username,
        password,
        captchaToken,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth error codes to user friendly messages
        let errorMessage = "Invalid username or password";

        if (result.error === "CredentialsSignin") {
          errorMessage = "Invalid username or password";
        } else if (result.error === "missing_credentials") {
          errorMessage = "Please enter both username and password";
        } else if (result.error) {
          errorMessage = result.error;
        }

        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred while signing in" };
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
