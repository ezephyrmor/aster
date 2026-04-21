"use client";

import { useFormContext } from "./FormContext";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  children: React.ReactNode;
}

export function SubmitButton({
  children,
  variant = "blue",
  size,
  className,
  ...props
}: SubmitButtonProps) {
  const { isSubmitting } = useFormContext();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Saving...
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
