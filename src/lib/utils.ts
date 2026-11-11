import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "0";
  }
  const rounded = Math.round(value);
  const safeInt = Object.is(rounded, -0) ? 0 : rounded;
  return safeInt.toLocaleString("en-US");
}

export function formatDurationSeconds(seconds: number | null | undefined): string {
  if (
    seconds === null ||
    seconds === undefined ||
    typeof seconds !== "number" ||
    Number.isNaN(seconds) ||
    seconds <= 0 ||
    !Number.isFinite(seconds)
  ) {
    return "00:00";
  }
  const totalSeconds = Math.floor(seconds);
  if (totalSeconds < 3600) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const remainder = totalSeconds % 3600;
  const mins = Math.floor(remainder / 60);
  const secs = remainder % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function clampNumber(value: number, min: number, max: number): number {
  let lower = Number.isNaN(min) || typeof min !== "number" ? 0 : min;
  let upper = Number.isNaN(max) || typeof max !== "number" ? lower : max;
  if (lower > upper) {
    const temp = lower;
    lower = upper;
    upper = temp;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return lower;
  }
  if (value < lower) return lower;
  if (value > upper) return upper;
  return value;
}

export function truncateText(
  text: string | null | undefined,
  maxLength: number,
  suffix = "..."
): string {
  if (text == null || typeof text !== "string") {
    return "";
  }
  if (typeof maxLength !== "number" || Number.isNaN(maxLength) || maxLength <= 0) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  const safeSuffix = typeof suffix === "string" ? suffix : "...";
  if (maxLength <= safeSuffix.length) {
    return text.slice(0, maxLength);
  }
  return text.slice(0, maxLength - safeSuffix.length) + safeSuffix;
}

export function slugifyText(text: string | null | undefined): string {
  if (text == null || typeof text !== "string") {
    return "";
  }
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
