import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "matrix-emerald" | "cyber-neon" | "obsidian-high-contrast";

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
      theme: "matrix-emerald",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
    }
  )
);
