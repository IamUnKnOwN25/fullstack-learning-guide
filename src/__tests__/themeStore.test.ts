import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  useThemeStore,
  Theme,
  THEMES,
  DEFAULT_THEME,
  isValidTheme,
  sanitizeTheme,
  getContrastRatio,
  isHighContrastTheme,
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

  describe("Theme Sanitizer and Normalization", () => {
    it("returns valid theme unchanged when input is exact match", () => {
      expect(sanitizeTheme("matrix-emerald")).toBe("matrix-emerald");
      expect(sanitizeTheme("cyber-neon")).toBe("cyber-neon");
      expect(sanitizeTheme("obsidian-high-contrast")).toBe("obsidian-high-contrast");
    });

    it("normalizes case and trims whitespace around theme names", () => {
      expect(sanitizeTheme("  CYBER-NEON  ")).toBe("cyber-neon");
      expect(sanitizeTheme("Matrix-Emerald")).toBe("matrix-emerald");
      expect(sanitizeTheme("\t obsidian-high-contrast \n")).toBe("obsidian-high-contrast");
    });

    it("falls back to DEFAULT_THEME on invalid or non-string inputs when no fallback is provided", () => {
      expect(sanitizeTheme("matrix-dark")).toBe(DEFAULT_THEME);
      expect(sanitizeTheme("")).toBe(DEFAULT_THEME);
      expect(sanitizeTheme("   ")).toBe(DEFAULT_THEME);
      expect(sanitizeTheme(null)).toBe(DEFAULT_THEME);
      expect(sanitizeTheme(undefined)).toBe(DEFAULT_THEME);
      expect(sanitizeTheme(123)).toBe(DEFAULT_THEME);
      expect(sanitizeTheme({})).toBe(DEFAULT_THEME);
      expect(sanitizeTheme(["cyber-neon"])).toBe(DEFAULT_THEME);
    });

    it("respects custom fallback when valid, or falls back to DEFAULT_THEME if fallback is invalid", () => {
      expect(sanitizeTheme("matrix-dark", "cyber-neon")).toBe("cyber-neon");
      expect(sanitizeTheme(null, "obsidian-high-contrast")).toBe("obsidian-high-contrast");
      expect(sanitizeTheme("unknown", "invalid-fallback" as any)).toBe(DEFAULT_THEME);
    });

    it("setTheme applies case-normalized and trimmed theme strings", () => {
      useThemeStore.getState().setTheme("  CYBER-NEON  ");
      expect(useThemeStore.getState().theme).toBe("cyber-neon");

      useThemeStore.getState().setTheme("  OBSIDIAN-HIGH-CONTRAST  ");
      expect(useThemeStore.getState().theme).toBe("obsidian-high-contrast");

      useThemeStore.getState().setTheme("  MATRIX-EMERALD  ");
      expect(useThemeStore.getState().theme).toBe("matrix-emerald");
    });
  });

  describe("WCAG 2.1 Contrast Ratio Calculator", () => {
    it("calculates maximum 21:1 contrast ratio between pure black and pure white", () => {
      expect(getContrastRatio("#000000", "#ffffff")).toBe(21);
      expect(getContrastRatio("#ffffff", "#000000")).toBe(21);
      expect(getContrastRatio("#000", "#fff")).toBe(21);
      expect(getContrastRatio("#fff", "#000")).toBe(21);
    });

    it("supports hex strings with or without leading hash and mixed case", () => {
      expect(getContrastRatio("000000", "ffffff")).toBe(21);
      expect(getContrastRatio("#FFF", "#000")).toBe(21);
      expect(getContrastRatio("fff", "000")).toBe(21);
    });

    it("returns 1 for identical colors", () => {
      expect(getContrastRatio("#ffffff", "#ffffff")).toBe(1);
      expect(getContrastRatio("#000000", "#000000")).toBe(1);
      expect(getContrastRatio("#123456", "#123456")).toBe(1);
      expect(getContrastRatio("#abc", "#abc")).toBe(1);
    });

    it("calculates correct contrast ratio for theme palettes meeting WCAG thresholds", () => {
      // obsidian-high-contrast: primary #FFFF00 on darkBg #000000
      const obsidianRatio = getContrastRatio("#FFFF00", "#000000");
      expect(obsidianRatio).toBeGreaterThan(15);

      // matrix-emerald: primary #00FF66 on darkBg #0f172a
      const matrixRatio = getContrastRatio("#00FF66", "#0f172a");
      expect(matrixRatio).toBeGreaterThan(7); // passes WCAG AAA (7:1)

      // cyber-neon: primary #FF007F on darkBg #0a0a0f
      const cyberRatio = getContrastRatio("#FF007F", "#0a0a0f");
      expect(cyberRatio).toBeGreaterThan(4.5); // passes WCAG AA (4.5:1)
    });

    it("returns 1 safely on malformed inputs", () => {
      expect(getContrastRatio("", "#ffffff")).toBe(1);
      expect(getContrastRatio("#ffffff", "")).toBe(1);
      expect(getContrastRatio("invalid", "#ffffff")).toBe(1);
      expect(getContrastRatio("#12", "#ffffff")).toBe(1);
      expect(getContrastRatio("#12345", "#ffffff")).toBe(1);
      expect(getContrastRatio("#gggggg", "#ffffff")).toBe(1);
      expect(getContrastRatio(null as any, "#ffffff")).toBe(1);
      expect(getContrastRatio("#ffffff", undefined as any)).toBe(1);
      expect(getContrastRatio(123 as any, {} as any)).toBe(1);
    });
  });

  describe("High Contrast Theme Detection", () => {
    it("identifies obsidian-high-contrast as high contrast theme", () => {
      expect(isHighContrastTheme("obsidian-high-contrast")).toBe(true);
      expect(isHighContrastTheme("OBSIDIAN-HIGH-CONTRAST")).toBe(true);
      expect(isHighContrastTheme("  obsidian-high-contrast  ")).toBe(true);
    });

    it("identifies theme objects with obsidian-high-contrast id", () => {
      expect(isHighContrastTheme({ id: "obsidian-high-contrast" })).toBe(true);
      expect(isHighContrastTheme({ id: "  OBSIDIAN-HIGH-CONTRAST  " })).toBe(true);
    });

    it("returns false for non-high-contrast themes and invalid values", () => {
      expect(isHighContrastTheme("matrix-emerald")).toBe(false);
      expect(isHighContrastTheme("cyber-neon")).toBe(false);
      expect(isHighContrastTheme("matrix-dark")).toBe(false);
      expect(isHighContrastTheme("")).toBe(false);
      expect(isHighContrastTheme(null)).toBe(false);
      expect(isHighContrastTheme(undefined)).toBe(false);
      expect(isHighContrastTheme(123)).toBe(false);
      expect(isHighContrastTheme({})).toBe(false);
      expect(isHighContrastTheme({ id: "cyber-neon" })).toBe(false);
    });
  });

  describe("Document Synchronization (syncWithDocument)", () => {
    it("synchronizes the current theme custom properties to documentElement", () => {
      useThemeStore.getState().setTheme("obsidian-high-contrast");
      useThemeStore.getState().syncWithDocument();

      const root = document.documentElement;
      expect(root.getAttribute("data-theme")).toBe("obsidian-high-contrast");
      expect(root.style.getPropertyValue("--matrix-primary")).toBe("#FFFF00");
      expect(root.style.getPropertyValue("--matrix-accent")).toBe("#00E5FF");
      expect(root.style.getPropertyValue("--matrix-bg")).toBe("#000000");

      useThemeStore.getState().setTheme("cyber-neon");
      useThemeStore.getState().syncWithDocument();
      expect(root.getAttribute("data-theme")).toBe("cyber-neon");
      expect(root.style.getPropertyValue("--matrix-primary")).toBe("#FF007F");
    });

    it("is SSR safe when document is unavailable", () => {
      const originalDocument = globalThis.document;
      try {
        // @ts-expect-error Simulating SSR environment without document
        delete globalThis.document;
        expect(() => useThemeStore.getState().syncWithDocument()).not.toThrow();
      } finally {
        globalThis.document = originalDocument;
      }
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
