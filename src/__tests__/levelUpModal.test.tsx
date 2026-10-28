/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LevelUpModal } from "../components/LevelUpModal";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

import confetti from "canvas-confetti";

describe("LevelUpModal Component", () => {
  const mockOpenSkillTree = vi.fn();
  const mockOpenLevelJourney = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
    useGameStore.setState({
      pendingLevelUp: null,
      streak: 1,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when pendingLevelUp is null", () => {
    const { container } = render(
      <LevelUpModal
        onOpenSkillTree={mockOpenSkillTree}
        onOpenLevelJourney={mockOpenLevelJourney}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders level ascension details and plays celebratory effects", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 3,
        newLevel: 4,
        newRankTitle: "Script Adept",
        isNewRank: true,
        unlockedSkillPoints: 1,
        maxHp: 130,
        maxMana: 65,
      },
      streak: 4,
    });

    render(
      <LevelUpModal
        onOpenSkillTree={mockOpenSkillTree}
        onOpenLevelJourney={mockOpenLevelJourney}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Level Up Ascension");

    expect(soundEngine.playSfx).toHaveBeenCalledWith("level-up");
    expect(confetti).toHaveBeenCalled();

    expect(screen.getByText("Level Up!")).toBeDefined();
    expect(screen.getByText("Level 3")).toBeDefined();
    expect(screen.getByText("Level 4")).toBeDefined();
    expect(screen.getByText("Rank Promotion Unlocked")).toBeDefined();
    expect(screen.getByText("Script Adept")).toBeDefined();
    expect(screen.getByText("+1 Point")).toBeDefined();
    expect(screen.getByText("130 HP (+10)")).toBeDefined();
    expect(screen.getByText("65 MP (+5)")).toBeDefined();
    expect(screen.getByText("4-Day Study Streak Active")).toBeDefined();
  });

  it("does not display rank promotion banner if isNewRank is false", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 4,
        newLevel: 5,
        newRankTitle: "Script Adept",
        isNewRank: false,
        unlockedSkillPoints: 1,
        maxHp: 140,
        maxMana: 70,
      },
      streak: 1,
    });

    render(<LevelUpModal />);

    expect(screen.queryByText("Rank Promotion Unlocked")).toBeNull();
    expect(screen.queryByText(/Study Streak Active/)).toBeNull();
  });

  it("dismisses modal when close button is clicked", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 1,
        newLevel: 2,
        newRankTitle: "Novice Byte",
        isNewRank: false,
        unlockedSkillPoints: 1,
        maxHp: 110,
        maxMana: 55,
      },
    });

    render(<LevelUpModal />);

    const closeBtn = screen.getByLabelText("Dismiss level up modal");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("dismisses modal when Continue Journey button is clicked", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 1,
        newLevel: 2,
        newRankTitle: "Novice Byte",
        isNewRank: false,
        unlockedSkillPoints: 1,
        maxHp: 110,
        maxMana: 55,
      },
    });

    render(<LevelUpModal />);

    const continueBtn = screen.getByText("Continue Journey");
    fireEvent.click(continueBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("handles Unlock Skill Perks button click with plural points", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 2,
        newLevel: 3,
        newRankTitle: "Markup Apprentice",
        isNewRank: true,
        unlockedSkillPoints: 2,
        maxHp: 120,
        maxMana: 60,
      },
    });

    render(
      <LevelUpModal
        onOpenSkillTree={mockOpenSkillTree}
        onOpenLevelJourney={mockOpenLevelJourney}
      />
    );

    expect(screen.getByText("+2 Points")).toBeDefined();

    const unlockBtn = screen.getByText("Unlock Skill Perks");
    fireEvent.click(unlockBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOpenSkillTree).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("dismisses modal when Escape key is pressed", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 5,
        newLevel: 6,
        newRankTitle: "Logic Crafter",
        isNewRank: false,
        unlockedSkillPoints: 1,
        maxHp: 150,
        maxMana: 75,
      },
    });

    render(<LevelUpModal />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("dismisses modal when clicking backdrop but not modal content", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 5,
        newLevel: 6,
        newRankTitle: "Logic Crafter",
        isNewRank: false,
        unlockedSkillPoints: 1,
        maxHp: 150,
        maxMana: 75,
      },
    });

    render(<LevelUpModal />);

    const modalTitle = screen.getByText("Level Up!");
    fireEvent.click(modalTitle);
    expect(useGameStore.getState().pendingLevelUp).not.toBeNull();

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("navigates to level roadmap when clicking View Rank Ladder", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 9,
        newLevel: 10,
        newRankTitle: "DOM Weaver",
        isNewRank: true,
        unlockedSkillPoints: 1,
        maxHp: 190,
        maxMana: 95,
      },
    });

    render(
      <LevelUpModal
        onOpenSkillTree={mockOpenSkillTree}
        onOpenLevelJourney={mockOpenLevelJourney}
      />
    );

    const ladderBtn = screen.getByText("View Rank Ladder & Level Roadmap");
    fireEvent.click(ladderBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOpenLevelJourney).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("caps streak bonus display at +30% Bonus XP for ultra-long streaks", () => {
    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 19,
        newLevel: 20,
        newRankTitle: "React Architect",
        isNewRank: true,
        unlockedSkillPoints: 1,
        maxHp: 290,
        maxMana: 145,
      },
      streak: 30, // 30-day streak
    });

    render(<LevelUpModal />);

    expect(screen.getByText("30-Day Study Streak Active")).toBeDefined();
    expect(screen.getByText("+30% Bonus XP")).toBeDefined();
  });

  it("gracefully catches and tolerates confetti throwing an exception", () => {
    vi.mocked(confetti).mockImplementationOnce(() => {
      throw new Error("Canvas context unavailable in headless environment");
    });

    useGameStore.setState({
      pendingLevelUp: {
        previousLevel: 1,
        newLevel: 2,
        newRankTitle: "Novice Byte",
        isNewRank: false,
        unlockedSkillPoints: 1,
        maxHp: 110,
        maxMana: 55,
      },
    });

    expect(() => render(<LevelUpModal />)).not.toThrow();
    expect(screen.getByText("Level Up!")).toBeDefined();
  });
});
