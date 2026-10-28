import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "matrix-emerald" | "cyber-neon" | "obsidian-high-contrast";

export const THEMES: Theme[] = ["matrix-emerald", "cyber-neon", "obsidian-high-contrast"];
export const DEFAULT_THEME: Theme = "matrix-emerald";

/**
 * Validates theme identifier against known supported themes.
 */
export function isValidTheme(theme: unknown): theme is Theme {
  return typeof theme === "string" && THEMES.includes(theme as Theme);
}

/**
 * Detects system color scheme preference and returns the matching Theme.
 * Falls back to DEFAULT_THEME ('matrix-emerald') if window is undefined,
 * matchMedia is unsupported, or no preference is matched.
 */
export function getSystemPreferredTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return DEFAULT_THEME;
  }

  try {
    if (
      window.matchMedia("(prefers-contrast: more)").matches ||
      window.matchMedia("(forced-colors: active)").matches
    ) {
      return "obsidian-high-contrast";
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return DEFAULT_THEME;
    }

    return DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Resolves an unknown theme value to a validated Theme.
 * Falls back to explicit fallback (if valid) or system preferred theme.
 */
export function resolveTheme(theme: unknown, fallbackTheme?: Theme): Theme {
  if (isValidTheme(theme)) {
    return theme;
  }
  if (fallbackTheme && isValidTheme(fallbackTheme)) {
    return fallbackTheme;
  }
  return getSystemPreferredTheme();
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

export function getNextTheme(currentTheme: Theme): Theme {
  const currentIndex = THEMES.indexOf(currentTheme);
  if (currentIndex === -1) return DEFAULT_THEME;
  return THEMES[(currentIndex + 1) % THEMES.length];
}

export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === "undefined" || !document.documentElement) return;
  const meta = getThemeMeta(theme);
  const root = document.documentElement;
  root.style.setProperty("--matrix-primary", meta.primaryColor);
  root.style.setProperty("--matrix-accent", meta.accentColor);
  root.style.setProperty("--matrix-bg", meta.darkBg);
  root.setAttribute("data-theme", meta.id);
}

export interface ThemeState {
  theme: Theme;
}

export interface ThemeActions {
  setTheme: (theme: Theme | string) => void;
  cycleTheme: () => Theme;
  applySystemTheme: () => Theme;
}

export type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => {
        const safeTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
        set({ theme: safeTheme });
      },
      cycleTheme: () => {
        const nextTheme = getNextTheme(get().theme);
        set({ theme: nextTheme });
        return nextTheme;
      },
      applySystemTheme: () => {
        const preferred = getSystemPreferredTheme();
        set({ theme: preferred });
        return preferred;
      },
    }),
    {
      name: "theme-storage",
      merge: (persistedState: unknown, currentState: ThemeStore) => {
        const state = persistedState as Partial<ThemeState> | undefined;
        const validTheme = isValidTheme(state?.theme) ? state.theme : DEFAULT_THEME;
        return {
          ...currentState,
          ...(state || {}),
          theme: validTheme,
        };
      },
    }
  )
);
