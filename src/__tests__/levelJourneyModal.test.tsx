/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LevelJourneyModal } from "../components/LevelJourneyModal";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

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

  it("renders progression overview and stats when open", () => {
    render(
      <LevelJourneyModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenSkillTree={mockOpenSkillTree}
      />
    );

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
});
