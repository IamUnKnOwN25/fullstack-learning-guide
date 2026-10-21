import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "../lib/themeStore";

describe("Theme Store", () => {
  beforeEach(() => {
    // Reset the store before each test
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
});
