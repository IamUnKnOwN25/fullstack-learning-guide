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

  it("renders trophy room header, progress bar, and categories with dialog accessibility", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Trophy Room & Achievements");

    expect(screen.getByText("Trophy Room & Achievements")).toBeDefined();
    expect(screen.getByText(/Cleared/)).toBeDefined();
    expect(screen.getByText("Odyssey Completion:")).toBeDefined();

    const progressBar = screen.getByRole("progressbar", { name: "Odyssey Completion Progress" });
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute("aria-valuenow")).toBeDefined();
    expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("100");

    expect(screen.getByText(/All \(\d+\)/)).toBeDefined();
  });

  it("calls onClose and plays SFX when Escape key is pressed", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked directly", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", () => {
    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const header = screen.getByText("Trophy Room & Achievements");
    fireEvent.click(header);

    expect(mockOnClose).not.toHaveBeenCalled();
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

  it("shows guest alert banner when unauthenticated and triggers onOpenAuthModal on click", () => {
    useAuthStore.setState({ isAuthenticated: false });

    render(
      <AchievementsModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const signInBtn = screen.getByRole("button", { name: /^Sign In to Claim$/i });
    expect(signInBtn).toBeDefined();

    fireEvent.click(signInBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
  });
});
