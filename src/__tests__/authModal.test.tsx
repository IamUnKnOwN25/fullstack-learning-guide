/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { AuthModal } from "../components/AuthModal";
import { useAuthStore } from "../lib/authStore";
import { soundEngine } from "../lib/soundEngine";

describe("AuthModal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useAuthStore.setState({
      currentUser: {
        id: "guest-user",
        username: "guest_cadet",
        displayName: "Guest Cadet",
        avatarId: "neon-hacker",
        customBio: "",
        title: "Matrix Initiate",
        joinedAt: new Date().toISOString(),
        isGuest: true,
        showcaseBadgeId: "welcome_recruit",
      },
      isAuthenticated: false,
      accounts: {},
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders login mode by default with standard dialog accessibility attributes", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Matrix Terminal Access");

    expect(screen.getByText("Matrix Terminal Access")).toBeDefined();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /New Cadet/i })).toBeDefined();
    expect(screen.getByLabelText("Terminal Handle (Username)")).toBeDefined();
    expect(screen.getByLabelText("Security Passphrase")).toBeDefined();
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked directly", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the modal content", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const header = screen.getByText("Matrix Terminal Access");
    fireEvent.click(header);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the close icon button is clicked", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByLabelText("Close authentication modal");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("allows switching to sign up mode and validates input", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const newCadetTab = screen.getByRole("button", { name: /New Cadet/i });
    fireEvent.click(newCadetTab);

    expect(screen.getByText("Select Cybernetic Insignia Avatar:")).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Neo Architect/)).toBeDefined();

    const usernameInput = screen.getByLabelText("Terminal Handle (Username)");
    const passwordInput = screen.getByLabelText("Security Passphrase");

    // Enter short username
    fireEvent.change(usernameInput, { target: { value: "a" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });

    const submitBtn = screen.getByText("Initialize Operator Profile");
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Username must be at least 3/i)).toBeDefined();
  });

  it("successfully signs up a new cadet and closes after delay", async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const newCadetTab = screen.getByRole("button", { name: /New Cadet/i });
    fireEvent.click(newCadetTab);

    const usernameInput = screen.getByLabelText("Terminal Handle (Username)");
    const passwordInput = screen.getByLabelText("Security Passphrase");

    fireEvent.change(usernameInput, { target: { value: "cadet_phoenix" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });

    const submitBtn = screen.getByText("Initialize Operator Profile");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().currentUser?.username).toBe("cadet_phoenix");
    });
  });

  it("allows continuing as guest", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const guestBtn = screen.getByText(/Continue as Guest Recruit/i);
    fireEvent.click(guestBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().currentUser?.isGuest).toBe(true);
  });

  it("renders saved accounts tab and switches account upon selection", () => {
    useAuthStore.setState({
      accounts: {
        cyber_ghost: {
          profile: {
            id: "ghost-1",
            username: "cyber_ghost",
            displayName: "Cyber Ghost",
            avatarId: "ghost-recon",
            customBio: "Infiltrator",
            title: "Matrix Infiltrator",
            joinedAt: new Date().toISOString(),
            isGuest: false,
            showcaseBadgeId: "first_quest",
          },
          passHash: "hash123",
        },
      },
    });

    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const accountsTab = screen.getByRole("button", { name: /Accounts \(1\)/i });
    expect(accountsTab).toBeDefined();

    fireEvent.click(accountsTab);
    expect(screen.getByText("Cyber Ghost")).toBeDefined();
    expect(screen.getByText(/@cyber_ghost/)).toBeDefined();

    const switchBtn = screen.getByRole("button", { name: /Switch/i });
    fireEvent.click(switchBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("victory");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().currentUser?.username).toBe("cyber_ghost");
  });
});
