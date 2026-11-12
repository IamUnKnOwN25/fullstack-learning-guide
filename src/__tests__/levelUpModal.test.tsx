/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { LevelUpModal, getLevelUpAnnouncement } from "../components/LevelUpModal";
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
    expect(dialog.getAttribute("aria-labelledby")).toBe("levelup-modal-title");
    expect(screen.getByRole("heading", { name: "Level Up!" }).id).toBe("levelup-modal-title");
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute("aria-live")).toBe("polite");
    expect(statusRegion.textContent).toBe("Ascended to Level 4! Rank: Script Adept");
    const rewardsList = screen.getByRole("list", { name: "Unlocked level rewards" });
    expect(rewardsList).toBeDefined();
    expect(within(rewardsList).getAllByRole("listitem")).toHaveLength(4);

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

  it("provides dialog aria-labelledby, reward listitem semantics, and status live region for screen readers", () => {
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
      streak: 1,
    });

    render(<LevelUpModal />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBe("levelup-modal-title");
    const heading = screen.getByRole("heading", { name: "Level Up!" });
    expect(heading.id).toBe("levelup-modal-title");

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute("aria-live")).toBe("polite");
    expect(statusRegion.textContent).toBe("Ascended to Level 2! Rank: Novice Byte");

    const rewardsList = screen.getByRole("list", { name: "Unlocked level rewards" });
    expect(rewardsList).toBeDefined();
    const items = within(rewardsList).getAllByRole("listitem");
    expect(items.length).toBe(3);
  });

  describe("getLevelUpAnnouncement helper", () => {
    it("generates concise screen reader announcement for valid level and title", () => {
      expect(getLevelUpAnnouncement(4, "Script Adept")).toBe(
        "Ascended to Level 4! Rank: Script Adept"
      );
    });

    it("appends singular perk information when unlockedPerksCount is 1", () => {
      expect(getLevelUpAnnouncement(4, "Script Adept", 1)).toBe(
        "Ascended to Level 4! Rank: Script Adept (1 perk unlocked)"
      );
    });

    it("appends plural perk information when unlockedPerksCount is greater than 1", () => {
      expect(getLevelUpAnnouncement(5, "Logic Crafter", 3)).toBe(
        "Ascended to Level 5! Rank: Logic Crafter (3 perks unlocked)"
      );
    });

    it("omits perk suffix when unlockedPerksCount is zero, negative, or non-finite", () => {
      expect(getLevelUpAnnouncement(4, "Script Adept", 0)).toBe(
        "Ascended to Level 4! Rank: Script Adept"
      );
      expect(getLevelUpAnnouncement(4, "Script Adept", -1)).toBe(
        "Ascended to Level 4! Rank: Script Adept"
      );
      expect(getLevelUpAnnouncement(4, "Script Adept", NaN)).toBe(
        "Ascended to Level 4! Rank: Script Adept"
      );
    });

    it("falls back to level 1 for non-finite, zero, or negative level numbers", () => {
      expect(getLevelUpAnnouncement(NaN, "Novice Byte")).toBe(
        "Ascended to Level 1! Rank: Novice Byte"
      );
      expect(getLevelUpAnnouncement(Infinity, "Novice Byte")).toBe(
        "Ascended to Level 1! Rank: Novice Byte"
      );
      expect(getLevelUpAnnouncement(-5, "Novice Byte")).toBe(
        "Ascended to Level 1! Rank: Novice Byte"
      );
      expect(getLevelUpAnnouncement(0, "Novice Byte")).toBe(
        "Ascended to Level 1! Rank: Novice Byte"
      );
    });

    it("floors floating-point level numbers and perks counts", () => {
      expect(getLevelUpAnnouncement(3.9, "Novice Byte", 2.8)).toBe(
        "Ascended to Level 3! Rank: Novice Byte (2 perks unlocked)"
      );
    });

    it("falls back to 'Novice Byte' for empty, whitespace, or invalid titles", () => {
      expect(getLevelUpAnnouncement(2, "")).toBe(
        "Ascended to Level 2! Rank: Novice Byte"
      );
      expect(getLevelUpAnnouncement(2, "   ")).toBe(
        "Ascended to Level 2! Rank: Novice Byte"
      );
      // @ts-expect-error testing runtime fallback for null/undefined title
      expect(getLevelUpAnnouncement(2, null)).toBe(
        "Ascended to Level 2! Rank: Novice Byte"
      );
    });

    it("trims whitespace from title strings", () => {
      expect(getLevelUpAnnouncement(7, "  DOM Weaver  ")).toBe(
        "Ascended to Level 7! Rank: DOM Weaver"
      );
    });
  });

  it("marks all decorative Lucide icons with aria-hidden='true' to keep accessible tree clean", () => {
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
    const icons = dialog.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((icon) => {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });
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
