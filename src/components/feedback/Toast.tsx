"use client";

import { useState, useEffect } from "react";
import { useToast, Toast, ToastType } from "@/lib/toast";

const toastStyles = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/30",
    border: "border-green-500",
    text: "text-green-700 dark:text-green-400",
    icon: (
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/30",
    border: "border-red-500",
    text: "text-red-700 dark:text-red-400",
    icon: (
      <svg
        className="w-5 h-5 text-red-500"
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
    ),
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/30",
    border: "border-yellow-500",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: (
      <svg
        className="w-5 h-5 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    icon: (
      <svg
        className="w-5 h-5 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsRemoving(true);
        setTimeout(onRemove, 500); // Wait for slow fade-out animation
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 500); // Wait for slow fade-out animation
  };

  const style = toastStyles[toast.type as ToastType];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 ${style.bg} ${style.border} min-w-[300px] max-w-md transition-all duration-500 ease-in-out ${
        isRemoving
          ? "opacity-0 transform -translate-y-2 duration-500 ease-in"
          : "animate-in slide-in-from-top-4 fade-in duration-500 ease-out"
      }`}
    >
      {style.icon}
      <p className={`text-sm font-medium ${style.text} flex-1`}>
        {toast.message}
      </p>
      <button
        onClick={handleRemove}
        className={`p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${style.text}`}
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-50 pt-4">
      <div className="flex flex-col items-center gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
