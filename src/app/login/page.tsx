"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (
    username: string,
    password: string,
    captchaToken: string,
  ) => {
    const result = await login(username, password, captchaToken);
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

        <div
          className="mt-6"
          onMouseEnter={() => setShowDemoCredentials(true)}
          onMouseLeave={() => setShowDemoCredentials(false)}
        >
          <div
            className="
              flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer
              transition-all duration-200 border-2
              bg-transparent border-transparent hover:border-zinc-300 dark:hover:border-zinc-600
            "
          >
            <svg
              className="w-5 h-5 text-blue-500 dark:text-blue-400 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Demo Credentials
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 transition-all duration-200">
              ▲ Hover to reveal ▲
            </span>
          </div>
          <div
            className={`
              bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4 text-left
              border-2 border-blue-200 dark:border-blue-800
              shadow-lg transition-all duration-300
              ${
                isMounted && showDemoCredentials
                  ? "opacity-100 max-h-96 mt-2"
                  : "opacity-0 max-h-0 overflow-hidden p-0 mt-0 border-0"
              }
            `}
          >
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-300 dark:border-zinc-600">
                  <th className="text-left py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Role
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Username
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-200 dark:border-zinc-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Admin
                      </span>
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                      admin@demo.com
                    </code>
                  </td>
                  <td className="py-2 px-3">
                    <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                      demo123
                    </code>
                  </td>
                </tr>
                <tr className="border-b border-zinc-200 dark:border-zinc-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Employee
                      </span>
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                      juan@demo.com
                    </code>
                  </td>
                  <td className="py-2 px-3">
                    <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                      demo123
                    </code>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Manager
                      </span>
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                      maria@demo.com
                    </code>
                  </td>
                  <td className="py-2 px-3">
                    <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                      demo123
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
