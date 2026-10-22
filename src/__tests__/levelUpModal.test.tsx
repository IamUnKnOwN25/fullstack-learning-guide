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

  it("handles Unlock Skill Perks button click", () => {
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

    const unlockBtn = screen.getByText("Unlock Skill Perks");
    fireEvent.click(unlockBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOpenSkillTree).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });
});
