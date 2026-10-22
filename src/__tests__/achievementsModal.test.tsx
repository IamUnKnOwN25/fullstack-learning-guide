/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AchievementsModal } from "../components/AchievementsModal";
import { useGameStore } from "../lib/gameStore";
import { useAuthStore } from "../lib/authStore";
import { soundEngine } from "../lib/soundEngine";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

import confetti from "canvas-confetti";

describe("AchievementsModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOpenAuthModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useAuthStore.setState({
      isAuthenticated: true,
    });

    useGameStore.setState({
      completedQuests: ["html_basics", "css_selectors"],
      completedBosses: ["dom_destroyer"],
      stars: { html_basics: 3, css_selectors: 3 },
      streak: 5,
      claimedAchievements: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AchievementsModal
        isOpen={false}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders trophy room header, progress bar, and categories", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    expect(screen.getByText("Trophy Room & Achievements")).toBeDefined();
    expect(screen.getByText(/Cleared/)).toBeDefined();
    expect(screen.getByText("Odyssey Completion:")).toBeDefined();
    expect(screen.getByText(/All \(\d+\)/)).toBeDefined();
  });

  it("calls onClose when the close icon button is clicked", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByLabelText("Close achievements modal");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the footer Close button is clicked", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /^Close$/i });
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("allows switching categories", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const bossTab = screen.getByRole("button", { name: /Boss Guardians/i });
    fireEvent.click(bossTab);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("claims bonus XP for an unlocked achievement", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const claimButtons = screen.getAllByRole("button", { name: /Claim \+\d+ Bonus XP/i });
    if (claimButtons.length > 0) {
      fireEvent.click(claimButtons[0]);
      expect(confetti).toHaveBeenCalled();
    }
  });
});
