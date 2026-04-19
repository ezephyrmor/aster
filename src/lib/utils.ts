import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats company name display following pattern:
 * First word full, remaining words first letter uppercase with dot
 *
 * Example:
 * "Aster HR System" → "Aster H.S."
 * "Acme Corporation" → "Acme C."
 * "Global Tech Solutions" → "Global T.S."
 */
export function formatCompanyDisplayName(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "";
  if (words.length === 1) return words[0];

  const firstWord = words[0];
  const remainingWords = words.slice(1);

  const abbreviations = remainingWords.map((word) => {
    return `${word.charAt(0).toUpperCase()}.`;
  });

  return `${firstWord} ${abbreviations.join("")}`;
}
