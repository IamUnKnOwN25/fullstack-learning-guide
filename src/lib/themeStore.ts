import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "matrix-emerald" | "cyber-neon" | "obsidian-high-contrast";
export type ThemeId = Theme;

export const THEMES: Theme[] = ["matrix-emerald", "cyber-neon", "obsidian-high-contrast"];
export const DEFAULT_THEME: Theme = "matrix-emerald";

/**
 * Validates theme identifier against known supported themes.
 */
export function isValidTheme(theme: unknown): theme is Theme {
  return typeof theme === "string" && THEMES.includes(theme as Theme);
}

/**
 * Sanitizes input into a supported theme, trimming and normalizing case.
 * Falls back to explicit fallback (if valid) or DEFAULT_THEME.
 */
export function sanitizeTheme(val: unknown, fallback: Theme = DEFAULT_THEME): Theme {
  const safeFallback = isValidTheme(fallback) ? fallback : DEFAULT_THEME;
  if (typeof val === "string") {
    const normalized = val.trim().toLowerCase();
    if (isValidTheme(normalized)) {
      return normalized;
    }
  }
  return safeFallback;
}

/**
 * Parses a 3-character or 6-character hex color into [r, g, b] integer tuple.
 * Accepts optional leading '#'. Returns null if invalid.
 */
export function parseHexColor(hex: string): [number, number, number] | null {
  if (typeof hex !== "string") return null;
  const cleaned = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return [r, g, b];
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

/**
 * Calculates WCAG 2.1 relative luminance for an [r, g, b] color tuple (0-255).
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const c = val / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates WCAG 2.1 relative luminance contrast ratio (L1 + 0.05) / (L2 + 0.05).
 * Supports #RGB and #RRGGBB hex strings (with or without #).
 * Returns 1 safely on malformed inputs or identical colors.
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = parseHexColor(fgHex);
  const bgRgb = parseHexColor(bgHex);
  if (!fgRgb || !bgRgb) {
    return 1;
  }

  const lum1 = getRelativeLuminance(fgRgb);
  const lum2 = getRelativeLuminance(bgRgb);

  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);

  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Checks whether a theme identifier or theme object represents the high contrast theme.
 */
export function isHighContrastTheme(theme: unknown): boolean {
  if (typeof theme === "string") {
    return theme.trim().toLowerCase() === "obsidian-high-contrast";
  }
  if (typeof theme === "object" && theme !== null && "id" in theme) {
    const id = (theme as { id: unknown }).id;
    return typeof id === "string" && id.trim().toLowerCase() === "obsidian-high-contrast";
  }
  return false;
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
  syncWithDocument: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => {
        const safeTheme = sanitizeTheme(theme);
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
      syncWithDocument: () => {
        applyThemeToDocument(get().theme);
      },
    }),
    {
      name: "theme-storage",
      merge: (persistedState: unknown, currentState: ThemeStore) => {
        const state = persistedState as Partial<ThemeState> | undefined;
        const validTheme = sanitizeTheme(state?.theme);
        return {
          ...currentState,
          ...(state || {}),
          theme: validTheme,
        };
      },
    }
  )
);
