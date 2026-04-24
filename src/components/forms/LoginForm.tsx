"use client";

import React, { useState } from "react";
import { Form } from "@/components/form/Form";
import { TextField } from "@/components/form/TextField";
import CaptchaModal from "../modals/CaptchaModal";
import { LoginSchema, type LoginData } from "@/lib/validations/user.schema";

interface LoginFormProps {
  onSubmit: (
    username: string,
    password: string,
    captchaToken: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onError?: (error: string) => void;
}

export default function LoginForm({ onSubmit, onError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const handleFormSubmit = async (values: LoginData) => {
    setError(null);

    // Store credentials and show CAPTCHA first
    setPendingCredentials(values);
    setShowCaptcha(true);
  };

  const handleCaptchaSuccess = async (captchaToken: string) => {
    setShowCaptcha(false);

    if (!pendingCredentials) return;

    setIsLoading(true);

    try {
      const result = await onSubmit(
        pendingCredentials.username,
        pendingCredentials.password,
        captchaToken,
      );

      if (!result.success && result.error) {
        setError(result.error);
        if (onError) onError(result.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
      setPendingCredentials(null);
    }
  };

  return (
    <>
      <CaptchaModal isOpen={showCaptcha} onSuccess={handleCaptchaSuccess} />

      <Form
        schema={LoginSchema}
        onSubmit={handleFormSubmit}
        disabled={isLoading}
        resetOnSubmit={false}
      >
        <div className="space-y-4">
          <TextField
            name="username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            required
          />

          <TextField
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </>
          )}
        </button>
      </Form>
    </>
  );
}
