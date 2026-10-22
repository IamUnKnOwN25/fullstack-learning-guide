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

  it("renders login mode by default", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText("Matrix Terminal Access")).toBeDefined();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /New Cadet/i })).toBeDefined();
    expect(screen.getByLabelText("Terminal Handle (Username)")).toBeDefined();
    expect(screen.getByLabelText("Security Passphrase")).toBeDefined();
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
      expect(useAuthStore.getState().currentUser.username).toBe("cadet_phoenix");
    });
  });

  it("allows continuing as guest", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const guestBtn = screen.getByText(/Continue as Guest Recruit/i);
    fireEvent.click(guestBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().currentUser.isGuest).toBe(true);
  });
});
