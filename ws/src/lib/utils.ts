import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPct(value: number, digits = 2) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatPnl(value: number, currency = "USD") {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  })}`;
}

export function uid() {
  return crypto.randomUUID();
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
