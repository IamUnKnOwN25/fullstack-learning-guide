import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useThemeStore,
  Theme,
  THEMES,
  DEFAULT_THEME,
  isValidTheme,
  getThemeMeta,
} from "../lib/themeStore";

describe("Theme Store", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "matrix-emerald" });
  });

  it("should have the default theme as matrix-emerald", () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe("matrix-emerald");
  });

  it("should change theme to cyber-neon", () => {
    useThemeStore.getState().setTheme("cyber-neon");
    const { theme } = useThemeStore.getState();
    expect(theme).toBe("cyber-neon");
  });

  it("should change theme to obsidian-high-contrast", () => {
    useThemeStore.getState().setTheme("obsidian-high-contrast");
    const { theme } = useThemeStore.getState();
    expect(theme).toBe("obsidian-high-contrast");
  });

  it("should cycle through all themes idempotently", () => {
    const themes: Theme[] = ["matrix-emerald", "cyber-neon", "obsidian-high-contrast"];

    themes.forEach((targetTheme) => {
      useThemeStore.getState().setTheme(targetTheme);
      expect(useThemeStore.getState().theme).toBe(targetTheme);

      // Re-applying same theme is idempotent
      useThemeStore.getState().setTheme(targetTheme);
      expect(useThemeStore.getState().theme).toBe(targetTheme);
    });
  });

  it("should notify subscribers when theme changes", () => {
    const subscriber = vi.fn();
    const unsubscribe = useThemeStore.subscribe(subscriber);

    useThemeStore.getState().setTheme("cyber-neon");
    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "cyber-neon" }),
      expect.anything()
    );

    useThemeStore.getState().setTheme("obsidian-high-contrast");
    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "obsidian-high-contrast" }),
      expect.anything()
    );

    unsubscribe();
  });

  it("persists theme changes to localStorage under key theme-storage", () => {
    useThemeStore.getState().setTheme("obsidian-high-contrast");

    const rawStorage = localStorage.getItem("theme-storage");
    expect(rawStorage).not.toBeNull();

    if (rawStorage) {
      const parsed = JSON.parse(rawStorage);
      expect(parsed.state.theme).toBe("obsidian-high-contrast");
    }
  });

  describe("Theme Validators and Metadata", () => {
    it("validates theme identifiers with isValidTheme", () => {
      expect(isValidTheme("matrix-emerald")).toBe(true);
      expect(isValidTheme("cyber-neon")).toBe(true);
      expect(isValidTheme("obsidian-high-contrast")).toBe(true);
      expect(isValidTheme("invalid-theme")).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
    });

    it("retrieves theme metadata for each theme", () => {
      THEMES.forEach((t) => {
        const meta = getThemeMeta(t);
        expect(meta.id).toBe(t);
        expect(meta.primaryColor).toBeDefined();
        expect(meta.accentColor).toBeDefined();
        expect(meta.darkBg).toBeDefined();
      });

      const fallback = getThemeMeta("unknown" as any);
      expect(fallback.id).toBe(DEFAULT_THEME);
    });

    it("falls back to DEFAULT_THEME when setting an invalid theme", () => {
      useThemeStore.getState().setTheme("cyber-neon");
      expect(useThemeStore.getState().theme).toBe("cyber-neon");

      useThemeStore.getState().setTheme("invalid-custom-theme" as any);
      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
    });
  });
});
