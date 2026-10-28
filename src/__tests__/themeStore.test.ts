import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  useThemeStore,
  Theme,
  THEMES,
  DEFAULT_THEME,
  isValidTheme,
  getThemeMeta,
  getNextTheme,
  applyThemeToDocument,
  getSystemPreferredTheme,
  resolveTheme,
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
      expect(isValidTheme("matrix-dark")).toBe(false);
      expect(isValidTheme("invalid-theme")).toBe(false);
      expect(isValidTheme("")).toBe(false);
      expect(isValidTheme(null)).toBe(false);
      expect(isValidTheme(undefined)).toBe(false);
      expect(isValidTheme(123)).toBe(false);
      expect(isValidTheme({})).toBe(false);
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

      useThemeStore.getState().setTheme("invalid-custom-theme");
      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);

      // Explicitly verify unrecognized 'matrix-dark' falls back to default
      useThemeStore.getState().setTheme("cyber-neon");
      useThemeStore.getState().setTheme("matrix-dark");
      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);

      // Non-string or nullish fallback
      useThemeStore.getState().setTheme("cyber-neon");
      useThemeStore.getState().setTheme(null as any);
      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);

      useThemeStore.getState().setTheme("cyber-neon");
      useThemeStore.getState().setTheme("" as any);
      expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
    });

    it("cycles themes sequentially with getNextTheme and store cycleTheme action", () => {
      expect(getNextTheme("matrix-emerald")).toBe("cyber-neon");
      expect(getNextTheme("cyber-neon")).toBe("obsidian-high-contrast");
      expect(getNextTheme("obsidian-high-contrast")).toBe("matrix-emerald");
      expect(getNextTheme("invalid" as any)).toBe(DEFAULT_THEME);

      useThemeStore.setState({ theme: "matrix-emerald" });
      const next1 = useThemeStore.getState().cycleTheme();
      expect(next1).toBe("cyber-neon");
      expect(useThemeStore.getState().theme).toBe("cyber-neon");

      const next2 = useThemeStore.getState().cycleTheme();
      expect(next2).toBe("obsidian-high-contrast");
      expect(useThemeStore.getState().theme).toBe("obsidian-high-contrast");

      const next3 = useThemeStore.getState().cycleTheme();
      expect(next3).toBe("matrix-emerald");
      expect(useThemeStore.getState().theme).toBe("matrix-emerald");
    });

    it("applies theme custom properties and data-theme attribute to document element", () => {
      applyThemeToDocument("cyber-neon");
      const root = document.documentElement;
      expect(root.getAttribute("data-theme")).toBe("cyber-neon");
      expect(root.style.getPropertyValue("--matrix-primary")).toBe("#FF007F");
      expect(root.style.getPropertyValue("--matrix-accent")).toBe("#7928CA");
      expect(root.style.getPropertyValue("--matrix-bg")).toBe("#0a0a0f");

      applyThemeToDocument("obsidian-high-contrast");
      expect(root.getAttribute("data-theme")).toBe("obsidian-high-contrast");
      expect(root.style.getPropertyValue("--matrix-primary")).toBe("#FFFF00");
    });
  });

  describe("System Preference Fallback and Theme Resolution", () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it("detects high-contrast preference from prefers-contrast media query", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-contrast: more)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemPreferredTheme()).toBe("obsidian-high-contrast");
    });

    it("detects high-contrast preference from forced-colors media query", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(forced-colors: active)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemPreferredTheme()).toBe("obsidian-high-contrast");
    });

    it("falls back to DEFAULT_THEME on dark mode or unmatched system preference", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemPreferredTheme()).toBe(DEFAULT_THEME);
    });

    it("falls back to DEFAULT_THEME when matchMedia throws or is missing", () => {
      window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error("matchMedia failure");
      });
      expect(getSystemPreferredTheme()).toBe(DEFAULT_THEME);

      // @ts-expect-error testing missing matchMedia runtime safety
      window.matchMedia = undefined;
      expect(getSystemPreferredTheme()).toBe(DEFAULT_THEME);
    });

    it("resolves theme with resolveTheme helper using fallback hierarchy", () => {
      expect(resolveTheme("cyber-neon")).toBe("cyber-neon");
      expect(resolveTheme("invalid-theme", "obsidian-high-contrast")).toBe("obsidian-high-contrast");
      expect(resolveTheme("invalid-theme", "not-a-theme" as any)).toBe(DEFAULT_THEME);
      expect(resolveTheme("matrix-dark")).toBe(DEFAULT_THEME);
      expect(resolveTheme(null)).toBe(DEFAULT_THEME);
    });

    it("applies system preference theme using applySystemTheme action", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-contrast: more)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      useThemeStore.setState({ theme: "matrix-emerald" });
      const applied = useThemeStore.getState().applySystemTheme();
      expect(applied).toBe("obsidian-high-contrast");
      expect(useThemeStore.getState().theme).toBe("obsidian-high-contrast");
    });

    it("sanitizes persisted invalid theme upon store merge/rehydration", () => {
      const persistOptions = (useThemeStore as any).persist;
      const mergeFn = persistOptions.getOptions().merge;

      const mergedInvalid = mergeFn({ theme: "matrix-dark" }, useThemeStore.getState());
      expect(mergedInvalid.theme).toBe(DEFAULT_THEME);

      const mergedValid = mergeFn({ theme: "cyber-neon" }, useThemeStore.getState());
      expect(mergedValid.theme).toBe("cyber-neon");
    });
  });
});
