import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const schoolAdminTheme = {
  light: {
    background: "#f3f7fd",
    foreground: "#0f172a",
    surface: "#ffffff",
    primary: "#2563eb",
    sidebar: "#f8fbff",
  },
  dark: {
    background: "#0b0f1c",
    foreground: "#e6e8ef",
    surface: "#121829",
    primary: "#2563eb",
    sidebar: "#090d1a",
  },
};

export const tiers = {
  Platinum: "#8b5cf6",
  Gold: "#f59e0b",
  Silver: "#94a3b8",
  Bronze: "#f97316",
};
