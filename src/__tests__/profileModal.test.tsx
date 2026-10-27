/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { ProfileModal } from "../components/ProfileModal";
import { useAuthStore } from "../lib/authStore";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { serializeSaveData } from "../lib/saveManager";

describe("ProfileModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnOpenAuthModal = vi.fn();
  const mockOnOpenLeaderboard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    // Reset store states
    useAuthStore.setState({
      currentUser: {
        id: "test-user-id",
        username: "matrix_runner",
        displayName: "Matrix Runner",
        avatarId: "cyber-ninja",
        customBio: "Exploring the grid.",
        title: "Matrix Infiltrator",
        joinedAt: "2026-01-01T00:00:00.000Z",
        isGuest: false,
        showcaseBadgeId: "welcome_initiate",
      },
      isAuthenticated: true,
      accounts: {},
    });

    useGameStore.setState({
      xp: 1250,
      level: 4,
      rankTitle: "Script Adept",
      maxHp: 100,
      maxMana: 50,
      streak: 5,
      completedQuests: ["html-basics", "css-selectors"],
      completedBosses: ["dom-destroyer"],
      stars: { "html-basics": 3, "css-selectors": 2 },
      badges: ["welcome_initiate", "first_blood_boss"],
      completedCurriculumTasks: ["task-1"],
      completedChapters: ["ch-1"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ProfileModal
        isOpen={false}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders user information and stats when open with dialog accessibility", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
        onOpenLeaderboard={mockOnOpenLeaderboard}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Agent Profile Dossier");

    expect(screen.getByText("Matrix Runner")).toBeDefined();
    expect(screen.getByText(/Exploring the grid/)).toBeDefined();
    expect(screen.getByText("Script Adept")).toBeDefined();
    expect(screen.getByText(/1,250 XP/)).toBeDefined();
    expect(screen.getByText("Level 4")).toBeDefined();
    expect(screen.getByText("Matrix Initiate")).toBeDefined();
  });

  it("calls onClose when the close button is clicked", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    const closeBtn = screen.getByLabelText("Close profile modal");
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("calls onClose when Escape key is pressed", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("closes when clicking backdrop but not inside modal content", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    const title = screen.getByText("Matrix Runner");
    fireEvent.click(title);
    expect(mockOnClose).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("calls onOpenLeaderboard and onClose when leaderboard button is clicked", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
        onOpenLeaderboard={mockOnOpenLeaderboard}
      />
    );

    const lbBtn = screen.getByText("View Matrix Leaderboards");
    fireEvent.click(lbBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnOpenLeaderboard).toHaveBeenCalledTimes(1);
  });

  it("allows updating bio, avatar, and showcased badge", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    // Click edit bio
    const editBtn = screen.getByTitle("Edit Profile");
    fireEvent.click(editBtn);

    // Find textarea via aria-label and enter new bio
    const bioInput = screen.getByLabelText("Cadet Bio / Motto");
    fireEvent.change(bioInput, { target: { value: "A new legendary bio." } });

    // Pick Code Enchanter avatar (🧙‍♂️)
    const codeMageAvatar = screen.getByText("🧙‍♂️");
    fireEvent.click(codeMageAvatar);

    // Select Semantic Warden badge to showcase
    const semanticWardenBtn = screen.getByText("Semantic Warden");
    fireEvent.click(semanticWardenBtn);

    // Click Save
    const saveBtn = screen.getByText("Save Bio");
    fireEvent.click(saveBtn);

    const currentUser = useAuthStore.getState().currentUser;
    expect(currentUser.customBio).toBe("A new legendary bio.");
    expect(currentUser.avatarId).toBe("code-mage");
    expect(currentUser.showcaseBadgeId).toBe("first_blood_boss");
  });

  it("handles Save JSON download to file", () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:http://localhost/save");
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    const downloadBtn = screen.getByTitle("Download Save File JSON");
    expect(downloadBtn).toBeDefined();

    fireEvent.click(downloadBtn);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("handles Save JSON file upload import", async () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    const fileInput = screen.getByTestId("profile-file-input") as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const validSave = serializeSaveData({
      xp: 9999,
      level: 10,
      rankTitle: "Matrix Architect",
      completedQuests: ["html-basics", "quest-1"],
      completedBosses: ["dom-destroyer"],
      stars: { "html-basics": 3 },
      badges: ["welcome_initiate"],
      streak: 12,
    });

    const file = new File([validSave], "devquest-save-matrix_runner.json", {
      type: "application/json",
    });

    class MockFileReader {
      onload: ((e: { target: { result: string } }) => void) | null = null;
      readAsText() {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: validSave } });
          }
        }, 10);
      }
    }
    const origWindowFR = window.FileReader;
    const origGlobalFR = globalThis.FileReader;
    window.FileReader = MockFileReader as unknown as typeof FileReader;
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    try {
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("Save file loaded successfully!")).toBeDefined();
      });
      expect(useGameStore.getState().xp).toBe(9999);
    } finally {
      window.FileReader = origWindowFR;
      globalThis.FileReader = origGlobalFR;
    }
  });

  it("handles paste JSON import", async () => {
    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    const pasteBtn = screen.getByTitle("Paste Save JSON");
    fireEvent.click(pasteBtn);

    const validSave = serializeSaveData({
      xp: 5432,
      level: 7,
      rankTitle: "Grid Infiltrator",
      completedQuests: ["html-basics"],
      completedBosses: [],
      stars: {},
      badges: [],
      streak: 3,
    });

    const textarea = screen.getByPlaceholderText(/{"xp": 500/);
    fireEvent.change(textarea, { target: { value: validSave } });

    const applyBtn = screen.getByText("Apply Backup");
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(screen.getByText("Save file loaded successfully!")).toBeDefined();
    });
    expect(useGameStore.getState().xp).toBe(5432);
  });

  it("displays guest notice when not authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: false,
      currentUser: {
        id: "guest-cadet",
        username: "cadet_guest",
        displayName: "Cadet Recruit",
        avatarId: "neon-hacker",
        customBio: "Operator plugged into DevQuest.",
        title: "Matrix Initiate",
        joinedAt: new Date().toISOString(),
        isGuest: true,
        showcaseBadgeId: "welcome_initiate",
      },
    });

    render(
      <ProfileModal
        isOpen={true}
        onClose={mockOnClose}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    expect(screen.getByText("Guest Mode")).toBeDefined();
    expect(screen.getByText("Cloud save backup requires login")).toBeDefined();
    expect(screen.queryByTitle("Download Save File JSON")).toBeNull();
  });
});
