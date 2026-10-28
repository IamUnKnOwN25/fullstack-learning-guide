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
    expect(screen.getAllByText("World Map")[0]).toBeDefined();
    expect(screen.getAllByText("Curriculum Vault")[0]).toBeDefined();
    expect(screen.getAllByText("Matrix IDE")[0]).toBeDefined();

    // Stats
    expect(screen.getByText(/Script Adept/)).toBeDefined();
    expect(screen.getByText("100/120")).toBeDefined();
    expect(screen.getByText("5d")).toBeDefined();
  });

  it("renders level progress bar with accessibility attributes", () => {
    render(<NavigationHud />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute("aria-label")).toBe("Level XP Progress");
    expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("100");
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

  it("toggles audio mute and BGM via mobile quick toggle controls", () => {
    render(<NavigationHud />);

    const mobileAudioBtn = screen.getByLabelText("Mute Audio Mobile");
    fireEvent.click(mobileAudioBtn);
    expect(useGameStore.getState().audioMuted).toBe(true);

    const mobileBgmBtn = screen.getByLabelText("Play 8-bit Chiptune Music Mobile");
    fireEvent.click(mobileBgmBtn);
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

  it("opens Keyboard Shortcuts modal from mobile bottom navigation bar", () => {
    render(<NavigationHud />);

    const mobileKeysBtn = screen.getByLabelText("Mobile Keyboard Shortcuts");
    fireEvent.click(mobileKeysBtn);

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

  it("opens Profile modal when Operative Profile button is clicked", () => {
    render(<NavigationHud />);

    const profileBtn = screen.getByLabelText("Open Operative Profile Dossier");
    fireEvent.click(profileBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const profileDialog = screen.getByLabelText("Agent Profile Dossier");
    expect(profileDialog).toBeDefined();
  });

  it("opens Level Journey modal when Rank & Level button is clicked", () => {
    render(<NavigationHud />);

    const levelBtn = screen.getByLabelText("View Level & Rank Progression Journey");
    fireEvent.click(levelBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("Level & Rank Progression")).toBeDefined();
  });

  it("displays Full-Stack Archmage and crown when Grandmaster skill is unlocked", () => {
    useGameStore.setState({
      unlockedSkills: ["syntax_sense", "matrix_grandmaster"],
    });

    render(<NavigationHud />);

    expect(screen.getByText("Full-Stack Archmage")).toBeDefined();
  });

  it("handles window Ctrl+K keyboard shortcut to open Quick Jump search and Escape to dismiss", () => {
    render(<NavigationHud />);

    expect(screen.queryByPlaceholderText(/Search 12 realms/i)).toBeNull();

    // Trigger Ctrl+K
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByPlaceholderText(/Search 12 realms/i)).toBeDefined();

    // Trigger Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByPlaceholderText(/Search 12 realms/i)).toBeNull();
  });

  it("filters search results in Quick Jump palette based on query input", () => {
    render(<NavigationHud />);

    // Open palette
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const searchInput = screen.getByPlaceholderText(/Search 12 realms/i);

    fireEvent.change(searchInput, { target: { value: "CSS" } });
    expect(screen.getByText(/CSS, Flexbox & Grid/i)).toBeDefined();
    // JavaScript should not match
    expect(screen.queryByText(/Modern JavaScript/i)).toBeNull();
  });

  it("displays SIGN IN state when user is not authenticated", () => {
    useAuthStore.setState({
      currentUser: undefined,
      isAuthenticated: false,
    });

    render(<NavigationHud />);

    expect(screen.getByText("SIGN IN")).toBeDefined();
    expect(screen.getByText("Cadet")).toBeDefined();
  });

  it("renders Quick Jump command palette with dialog ARIA accessibility attributes", () => {
    render(<NavigationHud />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    const dialog = screen.getByRole("dialog", { name: "Quick Jump Command Palette" });
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Quick Jump Command Palette");
  });

  it("dismisses Quick Jump command palette when backdrop is clicked, but not when inner content is clicked", () => {
    render(<NavigationHud />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const dialog = screen.getByRole("dialog", { name: "Quick Jump Command Palette" });
    expect(dialog).toBeDefined();

    // Clicking inside the inner modal content should not dismiss
    const searchInput = screen.getByPlaceholderText(/Search 12 realms/i);
    fireEvent.click(searchInput);
    expect(screen.getByRole("dialog", { name: "Quick Jump Command Palette" })).toBeDefined();

    // Clicking the backdrop dismisses the dialog
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog", { name: "Quick Jump Command Palette" })).toBeNull();
  });

  it("displays explicit empty search feedback message when query yields no matches", () => {
    render(<NavigationHud />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const searchInput = screen.getByPlaceholderText(/Search 12 realms/i);

    fireEvent.change(searchInput, { target: { value: "quantum_nonexistent_realm" } });

    expect(screen.getByText(/No matching realms or quests found/i)).toBeDefined();
    expect(screen.getByText(/quantum_nonexistent_realm/i)).toBeDefined();
  });
});
