/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { LevelJourneyModal, calculateLevelJourneyMetrics } from "../components/LevelJourneyModal";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { RANKS } from "../lib/levelSystem";

describe("LevelJourneyModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOpenSkillTree = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      xp: 2500,
      level: 5,
      rankTitle: "Markup Apprentice",
      streak: 3,
      unlockedSkills: ["skill_1"],
      completedQuests: ["html_1"],
      completedBosses: ["boss_1"],
      completedChapters: ["ch_1"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <LevelJourneyModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders progression overview and stats when open with dialog accessibility", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenSkillTree={mockOpenSkillTree}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("level-journey-title");

    expect(screen.getByText("Level & Rank Progression")).toBeDefined();
    expect(screen.getAllByText("Markup Apprentice").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2,500 XP/).length).toBeGreaterThan(0);
    // 5 level - 1 unlocked = 4 available
    expect(screen.getByText(/4 Available/)).toBeDefined();
    expect(screen.getByText("Spend Skill Points")).toBeDefined();
  });

  it("calls onClose when the header close icon is clicked", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByLabelText("Close level journey modal");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the footer Close button is clicked", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeFooterBtn = screen.getByText("Close");
    fireEvent.click(closeFooterBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("handles Spend Skill Points button navigation", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenSkillTree={mockOpenSkillTree}
      />
    );

    const spendBtn = screen.getByText("Spend Skill Points");
    fireEvent.click(spendBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOpenSkillTree).toHaveBeenCalledTimes(1);
  });

  it("renders all rank ladder tiers showing ACTIVE badge on current rank", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("ACTIVE")).toBeDefined();

    // Verify all ranks exist in the ladder
    RANKS.forEach((rank) => {
      expect(screen.getAllByText(rank.title).length).toBeGreaterThan(0);
    });
  });

  it("displays Grandmaster badge when player level is 50+", () => {
    useGameStore.setState({
      xp: 62500,
      level: 50,
      rankTitle: "Full-Stack Grandmaster",
      streak: 7,
      unlockedSkills: [],
    });

    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getAllByText("Full-Stack Grandmaster").length).toBeGreaterThan(0);
    expect(screen.getByText("50")).toBeDefined();
  });

  it("renders Max HP, Max MP, and Streak XP bonus indicators", () => {
    useGameStore.setState({
      level: 6,
      streak: 4,
    });

    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Max HP/i)).toBeDefined();
    expect(screen.getByText(/Max MP/i)).toBeDefined();
    expect(screen.getByText(/4d Streak/i)).toBeDefined();
    expect(screen.getByText(/XP remaining/i)).toBeDefined();
  });

  it("renders How to Earn XP guide cards for all game modes", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Quest Trials")).toBeDefined();
    expect(screen.getByText("Boss Guardians")).toBeDefined();
    expect(screen.getByText("Curriculum Checkpoints")).toBeDefined();
    expect(screen.getByText("Matrix IDE & Drills")).toBeDefined();
  });

  it("renders XP progressbar with accessible role and clamped 0-100 attributes", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute("aria-label")).toBe("XP to next rank progress");
    expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("100");

    const valueNow = Number(progressBar.getAttribute("aria-valuenow"));
    expect(Number.isFinite(valueNow)).toBe(true);
    expect(valueNow).toBeGreaterThanOrEqual(0);
    expect(valueNow).toBeLessThanOrEqual(100);
  });

  it("clamps progressbar aria-valuenow between 0 and 100 for edge cases", () => {
    useGameStore.setState({ xp: 0, level: 1 });
    const { unmount } = render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const zeroBar = screen.getByRole("progressbar");
    expect(zeroBar.getAttribute("aria-valuenow")).toBe("0");
    expect(zeroBar.getAttribute("aria-valuemin")).toBe("0");
    expect(zeroBar.getAttribute("aria-valuemax")).toBe("100");

    unmount();

    useGameStore.setState({ xp: 150000, level: 50 });
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const maxBar = screen.getByRole("progressbar");
    const maxValueNow = Number(maxBar.getAttribute("aria-valuenow"));
    expect(maxValueNow).toBeGreaterThanOrEqual(0);
    expect(maxValueNow).toBeLessThanOrEqual(100);
  });

  it("renders Career Rank Ladder with list and listitem semantic roles", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const rankList = screen.getByRole("list", { name: "Career Rank Ladder" });
    expect(rankList).toBeDefined();

    const rankItems = within(rankList).getAllByRole("listitem");
    expect(rankItems.length).toBe(RANKS.length);
  });

  it("renders How to Earn EXP guide with list and listitem semantic roles", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const guideList = screen.getByRole("list", { name: "How to earn EXP guide" });
    expect(guideList).toBeDefined();

    const guideItems = within(guideList).getAllByRole("listitem");
    expect(guideItems.length).toBe(4);
  });

  describe("calculateLevelJourneyMetrics helper", () => {
    it("returns correct progression metrics for base level 1 player", () => {
      const metrics = calculateLevelJourneyMetrics(0, 1);
      expect(metrics.currentLevel).toBe(1);
      expect(metrics.nextLevel).toBe(2);
      expect(metrics.currentLevelBaseXp).toBe(0);
      expect(metrics.nextLevelTargetXp).toBe(25);
      expect(metrics.xpIntoCurrentLevel).toBe(0);
      expect(metrics.xpNeededForNextLevel).toBe(25);
      expect(metrics.progressPercent).toBe(0);
    });

    it("calculates mid-level progress percentage accurately", () => {
      // Level 2 spans 25 to 100 XP (span = 75). At 50 XP, 25 XP into level -> 33.333%
      const metrics = calculateLevelJourneyMetrics(50, 2);
      expect(metrics.currentLevel).toBe(2);
      expect(metrics.nextLevel).toBe(3);
      expect(metrics.currentLevelBaseXp).toBe(25);
      expect(metrics.nextLevelTargetXp).toBe(100);
      expect(metrics.xpIntoCurrentLevel).toBe(25);
      expect(metrics.xpNeededForNextLevel).toBe(50);
      expect(metrics.progressPercent).toBeCloseTo(33.33, 1);
    });

    it("clamps progress percentage to 100 when XP reaches or exceeds target", () => {
      const atTarget = calculateLevelJourneyMetrics(100, 2);
      expect(atTarget.progressPercent).toBe(100);
      expect(atTarget.xpNeededForNextLevel).toBe(0);

      const beyondTarget = calculateLevelJourneyMetrics(9999, 2);
      expect(beyondTarget.progressPercent).toBe(100);
      expect(beyondTarget.xpNeededForNextLevel).toBe(0);
    });

    it("guards against negative, NaN, and non-finite XP values", () => {
      const negativeXp = calculateLevelJourneyMetrics(-200, 1);
      expect(negativeXp.xpIntoCurrentLevel).toBe(0);
      expect(negativeXp.progressPercent).toBe(0);
      expect(negativeXp.xpNeededForNextLevel).toBe(25);

      const nanXp = calculateLevelJourneyMetrics(NaN, 1);
      expect(nanXp.xpIntoCurrentLevel).toBe(0);
      expect(nanXp.progressPercent).toBe(0);
      expect(nanXp.xpNeededForNextLevel).toBe(25);

      const infXp = calculateLevelJourneyMetrics(Infinity, 1);
      expect(infXp.xpIntoCurrentLevel).toBe(0);
      expect(infXp.progressPercent).toBe(0);
    });

    it("guards against negative, zero, and NaN level inputs with safe fallback", () => {
      const negativeLevel = calculateLevelJourneyMetrics(0, -3);
      expect(negativeLevel.currentLevel).toBe(1);
      expect(negativeLevel.nextLevel).toBe(2);

      const zeroLevel = calculateLevelJourneyMetrics(0, 0);
      expect(zeroLevel.currentLevel).toBe(1);

      const nanLevel = calculateLevelJourneyMetrics(100, NaN);
      // calculateLevel(100) -> 3
      expect(nanLevel.currentLevel).toBe(3);
      expect(nanLevel.nextLevel).toBe(4);
    });

    it("defaults or calculates safe level when level argument is omitted", () => {
      const defaultMetrics = calculateLevelJourneyMetrics(225);
      // calculateLevel(225) -> 4
      expect(defaultMetrics.currentLevel).toBe(4);
      expect(defaultMetrics.nextLevel).toBe(5);
    });
  });

  describe("Progress bar clamping & icon accessibility", () => {
    it("clamps inline progress bar width style between 0% and 100%", () => {
      useGameStore.setState({ xp: 0, level: 1 });
      const { unmount } = render(
        <LevelJourneyModal isOpen={true} onClose={mockOnClose} />
      );

      const progressBar = screen.getByRole("progressbar");
      const innerBar = progressBar.firstElementChild as HTMLElement;
      expect(innerBar).not.toBeNull();
      expect(innerBar.style.width).toBe("0%");

      unmount();

      useGameStore.setState({ xp: 999999, level: 50 });
      render(
        <LevelJourneyModal isOpen={true} onClose={mockOnClose} />
      );

      const maxProgressBar = screen.getByRole("progressbar");
      const maxInnerBar = maxProgressBar.firstElementChild as HTMLElement;
      expect(maxInnerBar).not.toBeNull();
      expect(maxInnerBar.style.width).toBe("100%");
    });

    it("marks decorative Lucide icons with aria-hidden='true'", () => {
      const { container } = render(
        <LevelJourneyModal isOpen={true} onClose={mockOnClose} />
      );

      const svgIcons = container.querySelectorAll("svg");
      expect(svgIcons.length).toBeGreaterThan(0);
      svgIcons.forEach((svg) => {
        expect(svg.getAttribute("aria-hidden")).toBe("true");
      });
    });
  });
});
