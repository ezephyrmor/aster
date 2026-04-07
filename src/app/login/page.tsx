"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    const result = await login(username, password);
    if (result.success) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
    return result;
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm">
          <LoginForm onSubmit={handleLogin} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Demo credentials
          </p>
          <div className="mt-2 bg-zinc-50 dark:bg-zinc-700 rounded-lg p-3 text-left">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-2">
              Admin:
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Username:{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                admin@demo.com
              </span>
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Password:{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                demo123
              </span>
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mt-3 mb-2">
              Employee:
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Username:{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                juan@demo.com
              </span>
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Password:{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                demo123
              </span>
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mt-3 mb-2">
              Manager:
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Username:{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                maria@demo.com
              </span>
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Password:{" "}
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                demo123
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
