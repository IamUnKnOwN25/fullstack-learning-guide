/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SkillTreeModal } from "../components/SkillTreeModal";
import { useGameStore } from "../lib/gameStore";
import { useAuthStore } from "../lib/authStore";
import { soundEngine } from "../lib/soundEngine";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

import confetti from "canvas-confetti";

describe("SkillTreeModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOpenAuthModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useAuthStore.setState({
      isAuthenticated: true,
    });

    useGameStore.setState({
      level: 10,
      unlockedSkills: ["syntax_sense"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <SkillTreeModal
        isOpen={false}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders skill tree title and available skill points", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    expect(screen.getByText("Cybernetic Skill Tree")).toBeDefined();
    expect(screen.getByText(/Skill Points Available/)).toBeDefined();
    expect(screen.getByText(/All Branches/)).toBeDefined();
  });

  it("calls onClose when the close icon button is clicked", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const closeBtn = screen.getByLabelText("Close skill tree modal");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Done button is clicked", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const doneBtn = screen.getByText("Done");
    fireEvent.click(doneBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("filters skills by branch category tab", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    // Filter by Frontend & Reactive branch
    const frontendTab = screen.getByRole("button", { name: /Frontend & Reactive/ });
    fireEvent.click(frontendTab);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("Reactive Flow")).toBeDefined();
  });

  it("allows unlocking an eligible skill", () => {
    useGameStore.setState({
      level: 15,
      unlockedSkills: ["syntax_sense"],
    });

    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Find unlock button
    const unlockButtons = screen.getAllByRole("button", { name: /Unlock for/ });
    expect(unlockButtons.length).toBeGreaterThan(0);

    fireEvent.click(unlockButtons[0]);
    expect(confetti).toHaveBeenCalled();
  });

  it("shows respec confirmation dialog and resets skills on confirm", () => {
    useGameStore.setState({
      level: 10,
      unlockedSkills: ["syntax_sense", "dom_manipulation"],
    });

    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const respecBtn = screen.getByText("Reset / Respec Talents");
    fireEvent.click(respecBtn);

    // Confirmation options should appear
    expect(screen.getByText("Cancel")).toBeDefined();
    const confirmBtn = screen.getByText(/Confirm Reset/);
    fireEvent.click(confirmBtn);

    expect(useGameStore.getState().unlockedSkills.length).toBe(0);
  });
});
