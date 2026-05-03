import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pad a number with leading zeros */
export function padZero(n: number, digits = 2): string {
  return String(n).padStart(digits, "0");
}

/** Format a number as a stat label (e.g. 120 → "120+") */
export function formatStat(n: number, suffix = "+"): string {
  return `${n}${suffix}`;
}
