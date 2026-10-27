import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "matrix-emerald" | "cyber-neon" | "obsidian-high-contrast";

export const THEMES: Theme[] = ["matrix-emerald", "cyber-neon", "obsidian-high-contrast"];
export const DEFAULT_THEME: Theme = "matrix-emerald";

export function isValidTheme(theme: unknown): theme is Theme {
  return typeof theme === "string" && THEMES.includes(theme as Theme);
}

export interface ThemeMeta {
  id: Theme;
  displayName: string;
  primaryColor: string;
  accentColor: string;
  darkBg: string;
}

export const THEME_METADATA: Record<Theme, ThemeMeta> = {
  "matrix-emerald": {
    id: "matrix-emerald",
    displayName: "Matrix Emerald",
    primaryColor: "#00FF66",
    accentColor: "#00F0FF",
    darkBg: "#0f172a",
  },
  "cyber-neon": {
    id: "cyber-neon",
    displayName: "Cyber Neon",
    primaryColor: "#FF007F",
    accentColor: "#7928CA",
    darkBg: "#0a0a0f",
  },
  "obsidian-high-contrast": {
    id: "obsidian-high-contrast",
    displayName: "Obsidian High Contrast",
    primaryColor: "#FFFF00",
    accentColor: "#00E5FF",
    darkBg: "#000000",
  },
};

export function getThemeMeta(theme: Theme): ThemeMeta {
  return THEME_METADATA[theme] || THEME_METADATA[DEFAULT_THEME];
}

export interface ThemeState {
  theme: Theme;
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
}

export type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => {
        const safeTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
        set({ theme: safeTheme });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);
