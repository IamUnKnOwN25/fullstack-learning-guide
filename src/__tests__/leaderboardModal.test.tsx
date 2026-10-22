/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LeaderboardModal } from "../components/LeaderboardModal";
import { useAuthStore } from "../lib/authStore";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

describe("LeaderboardModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOpenProfile = vi.fn();
  const mockOpenAuthModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useAuthStore.setState({
      currentUser: {
        id: "current-player",
        username: "cyber_sentinel",
        displayName: "Cyber Sentinel",
        avatarId: "cyber-ninja",
        customBio: "Mastering the matrix.",
        title: "Matrix Infiltrator",
        joinedAt: new Date().toISOString(),
        isGuest: false,
        showcaseBadgeId: "first_quest",
      },
      isAuthenticated: true,
    });

    useGameStore.setState({
      xp: 5000,
      level: 10,
      rankTitle: "DOM Enchanter",
      stars: { "quest-1": 3, "quest-2": 3 },
      completedBosses: ["boss-1", "boss-2"],
      completedCurriculumTasks: ["task-1", "task-2", "task-3"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <LeaderboardModal
        isOpen={false}
        onClose={mockOnClose}
        onOpenProfile={mockOpenProfile}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders leaderboard title, user stats, and operative rankings", () => {
    render(
      <LeaderboardModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenProfile={mockOpenProfile}
        onOpenAuthModal={mockOpenAuthModal}
      />
    );

    expect(screen.getByText("Matrix Global Leaderboards")).toBeDefined();
    expect(screen.getAllByText("Cyber Sentinel").length).toBeGreaterThan(0);
    expect(screen.getByText("Global Power (XP)")).toBeDefined();
    expect(screen.getByText("Quest Stars")).toBeDefined();
    expect(screen.getByText("Boss Rush")).toBeDefined();
    expect(screen.getByText("Curriculum")).toBeDefined();
  });

  it("calls onClose when the close button is clicked", () => {
    render(
      <LeaderboardModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByLabelText("Close leaderboard modal");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("switches tabs between XP, Stars, Boss Rush, and Curriculum", () => {
    render(
      <LeaderboardModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const starsTab = screen.getByText("Quest Stars");
    fireEvent.click(starsTab);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");

    const bossTab = screen.getByText("Boss Rush");
    fireEvent.click(bossTab);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");

    const curriculumTab = screen.getByText("Curriculum");
    fireEvent.click(curriculumTab);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("filters operatives using the search input", () => {
    render(
      <LeaderboardModal
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByLabelText("Search operative");
    fireEvent.change(searchInput, { target: { value: "Cyber Sentinel" } });

    expect(screen.getAllByText("Cyber Sentinel").length).toBeGreaterThan(0);
  });

  it("navigates to user profile when profile button is clicked", () => {
    render(
      <LeaderboardModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenProfile={mockOpenProfile}
      />
    );

    const profileBtn = screen.getByText("View Operator Profile");
    fireEvent.click(profileBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOpenProfile).toHaveBeenCalledTimes(1);
  });
});
