/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
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
    vi.useRealTimers();
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

  it("renders skill tree title and available skill points with dialog accessibility", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Cybernetic Skill Tree");

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

  it("calls onClose when Escape key is pressed", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("closes when clicking backdrop but not modal content", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const header = screen.getByText("Cybernetic Skill Tree");
    fireEvent.click(header);
    expect(mockOnClose).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
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
    const frontendTab = screen.getByRole("tab", { name: /Frontend & Reactive/ });
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

  it("prompts guest users to sign in and invokes onOpenAuthModal", () => {
    useAuthStore.setState({
      isAuthenticated: false,
    });

    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    expect(screen.getByText("Cybernetic Passives Restricted")).toBeDefined();
    const signInBtn = screen.getByText("Sign In to Unlock");
    fireEvent.click(signInBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("provides tablist semantics with role='tablist', aria-label='Skill branches', and dynamic aria-selected states", () => {
    render(
      <SkillTreeModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    const tablist = screen.getByRole("tablist", { name: "Skill branches" });
    expect(tablist).toBeDefined();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6);

    const allTab = screen.getByRole("tab", { name: /All Branches/ });
    const foundationsTab = screen.getByRole("tab", { name: /Foundations & Styles/ });
    const frontendTab = screen.getByRole("tab", { name: /Frontend & Reactive/ });

    expect(allTab.getAttribute("aria-selected")).toBe("true");
    expect(foundationsTab.getAttribute("aria-selected")).toBe("false");
    expect(frontendTab.getAttribute("aria-selected")).toBe("false");

    fireEvent.click(foundationsTab);
    expect(foundationsTab.getAttribute("aria-selected")).toBe("true");
    expect(allTab.getAttribute("aria-selected")).toBe("false");
    expect(frontendTab.getAttribute("aria-selected")).toBe("false");

    fireEvent.click(allTab);
    expect(allTab.getAttribute("aria-selected")).toBe("true");
    expect(foundationsTab.getAttribute("aria-selected")).toBe("false");
  });

  it("renders skill purchase feedback toast with role='status' and aria-live='polite' upon unlock", () => {
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

    expect(screen.queryByRole("status")).toBeNull();

    const unlockButtons = screen.getAllByRole("button", { name: /Unlock for/ });
    expect(unlockButtons.length).toBeGreaterThan(0);
    fireEvent.click(unlockButtons[0]);

    const toast = screen.getByRole("status");
    expect(toast).toBeDefined();
    expect(toast.getAttribute("aria-live")).toBe("polite");
    expect(toast.textContent).toContain("Unlocked");
    expect(toast.textContent).toContain("perk!");

    const dismissBtn = screen.getByLabelText("Dismiss feedback notification");
    fireEvent.click(dismissBtn);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("auto-dismisses the skill purchase feedback notification toast after timeout", () => {
    vi.useFakeTimers();

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

    const unlockButtons = screen.getAllByRole("button", { name: /Unlock for/ });
    fireEvent.click(unlockButtons[0]);

    expect(screen.getByRole("status")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole("status")).toBeNull();
  });
});
