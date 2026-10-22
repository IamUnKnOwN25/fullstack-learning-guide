/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NavigationHud } from "../components/NavigationHud";
import { useGameStore } from "../lib/gameStore";
import { useAuthStore } from "../lib/authStore";
import { soundEngine } from "../lib/soundEngine";

describe("NavigationHud Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
    vi.spyOn(soundEngine, "toggleBgm").mockImplementation((play) => play ?? true);

    useAuthStore.setState({
      currentUser: {
        id: "hero",
        username: "matrix_hero",
        displayName: "Matrix Hero",
        avatarId: "cyber-ninja",
        customBio: "Operator.",
        title: "Matrix Infiltrator",
        joinedAt: new Date().toISOString(),
        isGuest: false,
        showcaseBadgeId: "first_quest",
      },
      isAuthenticated: true,
    });

    useGameStore.setState({
      xp: 1500,
      level: 4,
      hp: 100,
      maxHp: 120,
      streak: 5,
      rankTitle: "Script Adept",
      audioMuted: false,
      bgmActive: false,
      badges: ["first_quest"],
      unlockedSkills: ["syntax_sense"],
      completedQuests: ["html_1"],
      completedBosses: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders branding, nav links, and current player status", () => {
    render(<NavigationHud />);

    expect(screen.getByText("DevQuest")).toBeDefined();
    expect(screen.getByText("The Web Matrix")).toBeDefined();
    expect(screen.getByText("World Map")).toBeDefined();
    expect(screen.getByText("Curriculum Vault")).toBeDefined();
    expect(screen.getByText("Matrix IDE")).toBeDefined();

    // Stats
    expect(screen.getByText(/Script Adept/)).toBeDefined();
    expect(screen.getByText("100/120")).toBeDefined();
    expect(screen.getByText("5d")).toBeDefined();
  });

  it("opens Quick Jump search palette when Jump button is clicked", () => {
    render(<NavigationHud />);

    const jumpBtn = screen.getByTitle("Quick Jump & Search (Ctrl+K)");
    fireEvent.click(jumpBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByPlaceholderText(/Search 12 realms/i)).toBeDefined();
  });

  it("toggles audio mute setting in game store", () => {
    render(<NavigationHud />);

    const audioBtn = screen.getByLabelText("Mute Audio");
    fireEvent.click(audioBtn);

    expect(useGameStore.getState().audioMuted).toBe(true);
  });

  it("toggles 8-bit BGM music in game store", () => {
    render(<NavigationHud />);

    const bgmBtn = screen.getByLabelText("Play 8-bit Chiptune Music");
    fireEvent.click(bgmBtn);

    expect(soundEngine.toggleBgm).toHaveBeenCalledWith(true);
    expect(useGameStore.getState().bgmActive).toBe(true);
  });

  it("opens Skill Tree modal when skill tree icon button is clicked", () => {
    render(<NavigationHud />);

    const skillTreeBtn = screen.getByLabelText("Skill Tree");
    fireEvent.click(skillTreeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("Cybernetic Skill Tree")).toBeDefined();
  });

  it("opens Trophies modal when trophy icon button is clicked", () => {
    render(<NavigationHud />);

    const trophyBtn = screen.getByLabelText("Trophies & Badges");
    fireEvent.click(trophyBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("Trophy Room & Achievements")).toBeDefined();
  });

  it("opens Keyboard Shortcuts modal when shortcuts icon button is clicked", () => {
    render(<NavigationHud />);

    const shortcutsBtn = screen.getByLabelText("Keyboard Shortcuts");
    fireEvent.click(shortcutsBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("Keyboard Shortcuts")).toBeDefined();
  });

  it("opens Leaderboard modal when leaderboard icon button is clicked", () => {
    render(<NavigationHud />);

    const lbBtn = screen.getByLabelText("Global Matrix Leaderboards");
    fireEvent.click(lbBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("Matrix Global Leaderboards")).toBeDefined();
  });
});
