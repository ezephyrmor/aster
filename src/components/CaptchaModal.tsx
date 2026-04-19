"use client";

import React, { useState, useEffect, useCallback } from "react";

interface CaptchaModalProps {
  isOpen: boolean;
  onSuccess: (validToken: string) => void;
  onCancel?: () => void;
}

interface CaptchaData {
  token: string;
  image: string;
}

export default function CaptchaModal({
  isOpen,
  onSuccess,
  onCancel,
}: CaptchaModalProps) {
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnswer("");

    try {
      const response = await fetch("/api/captcha/generate");
      const data = await response.json();
      setCaptcha(data);
    } catch (err) {
      setError("Failed to load CAPTCHA");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCaptcha();
    }
  }, [isOpen, loadCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captcha || !answer.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: captcha.token,
          answer: answer.trim(),
        }),
      });

      const result = await response.json();

      if (result.valid) {
        onSuccess(captcha.token);
      } else {
        setError(result.error || "Incorrect answer");
        loadCaptcha();
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Security Verification
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Please enter the characters shown below to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            {isLoading ? (
              <div className="w-[200px] h-[70px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : captcha ? (
              <div
                className="border-2 border-zinc-200 dark:border-zinc-600 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={loadCaptcha}
                title="Click to refresh"
                dangerouslySetInnerHTML={{ __html: captcha.image }}
              />
            ) : null}

            <button
              type="button"
              onClick={loadCaptcha}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              disabled={isLoading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Generate new code
            </button>
          </div>

          <div>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              placeholder="Enter the characters above"
              autoComplete="off"
              autoFocus
              maxLength={5}
              disabled={isVerifying || isLoading}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || isLoading || !answer.trim()}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
