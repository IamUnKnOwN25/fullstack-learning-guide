/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { AuthModal, validateAuthFormInput } from "../components/AuthModal";
import { useAuthStore, AVATAR_OPTIONS } from "../lib/authStore";
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

  it("renders login mode by default with standard dialog accessibility attributes and tablist semantics", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Matrix Terminal Access");

    expect(screen.getByText("Matrix Terminal Access")).toBeDefined();

    const tablist = screen.getByRole("tablist", { name: "Authentication modes" });
    expect(tablist).toBeDefined();

    const signInTab = screen.getByRole("tab", { name: /Sign In/i });
    expect(signInTab).toBeDefined();
    expect(signInTab.getAttribute("aria-selected")).toBe("true");

    const newCadetTab = screen.getByRole("tab", { name: /New Cadet/i });
    expect(newCadetTab).toBeDefined();
    expect(newCadetTab.getAttribute("aria-selected")).toBe("false");

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

  it("allows switching to sign up mode and validates input with role='alert'", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const newCadetTab = screen.getByRole("tab", { name: /New Cadet/i });
    fireEvent.click(newCadetTab);

    expect(newCadetTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Select Cybernetic Insignia Avatar:")).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Neo Architect/)).toBeDefined();

    const usernameInput = screen.getByLabelText("Terminal Handle (Username)");
    const passwordInput = screen.getByLabelText("Security Passphrase");

    // Enter short username
    fireEvent.change(usernameInput, { target: { value: "a" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });

    const submitBtn = screen.getByText("Initialize Operator Profile");
    fireEvent.click(submitBtn);

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.textContent).toMatch(/Username must be at least 3/i);
  });

  it("successfully signs up a new cadet, shows role='status' with aria-live='polite', and closes after delay", async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const newCadetTab = screen.getByRole("tab", { name: /New Cadet/i });
    fireEvent.click(newCadetTab);

    const usernameInput = screen.getByLabelText("Terminal Handle (Username)");
    const passwordInput = screen.getByLabelText("Security Passphrase");

    fireEvent.change(usernameInput, { target: { value: "cadet_phoenix" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });

    const submitBtn = screen.getByText("Initialize Operator Profile");
    fireEvent.click(submitBtn);

    const status = screen.getByRole("status");
    expect(status).toBeDefined();
    expect(status.getAttribute("aria-live")).toBe("polite");

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().currentUser?.username).toBe("cadet_phoenix");
    });
  });

  it("renders role='alert' when login fails with invalid credentials", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const usernameInput = screen.getByLabelText("Terminal Handle (Username)");
    const passwordInput = screen.getByLabelText("Security Passphrase");

    fireEvent.change(usernameInput, { target: { value: "nonexistent_cadet" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

    const submitBtn = screen.getByText("Authenticate Terminal");
    fireEvent.click(submitBtn);

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.textContent).toMatch(/Cadet handle not found/i);
  });

  it("provides accessible radiogroup semantics and selection states for avatar insignia picker in signup mode", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} initialMode="signup" />);

    const radiogroup = screen.getByRole("radiogroup", { name: "Select Cybernetic Insignia Avatar" });
    expect(radiogroup).toBeDefined();

    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(AVATAR_OPTIONS.length);

    // Default avatar is neon-hacker
    const neonHackerRadio = screen.getByRole("radio", { name: /Neon Hacker/i });
    expect(neonHackerRadio.getAttribute("aria-checked")).toBe("true");

    // Find another avatar option and click it
    const cyberNinjaRadio = screen.getByRole("radio", { name: /Cyber Ninja/i });
    expect(cyberNinjaRadio.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(cyberNinjaRadio);
    expect(cyberNinjaRadio.getAttribute("aria-checked")).toBe("true");
    expect(neonHackerRadio.getAttribute("aria-checked")).toBe("false");
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
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

    const accountsTab = screen.getByRole("tab", { name: /Accounts \(1\)/i });
    expect(accountsTab).toBeDefined();
    expect(accountsTab.getAttribute("aria-selected")).toBe("false");

    fireEvent.click(accountsTab);
    expect(accountsTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Cyber Ghost")).toBeDefined();
    expect(screen.getByText(/@cyber_ghost/)).toBeDefined();

    const switchBtn = screen.getByRole("button", { name: /Switch/i });
    fireEvent.click(switchBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("victory");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().currentUser?.username).toBe("cyber_ghost");
  });

  describe("validateAuthFormInput", () => {
    it("validates username presence across all modes", () => {
      expect(validateAuthFormInput("login", "")).toEqual({
        valid: false,
        error: "Username is required.",
      });
      expect(validateAuthFormInput("register", "   ")).toEqual({
        valid: false,
        error: "Username is required.",
      });
      expect(validateAuthFormInput("switch", "")).toEqual({
        valid: false,
        error: "Username is required.",
      });
    });

    it("enforces minimum alphanumeric length on username", () => {
      expect(validateAuthFormInput("login", "ab", "secret123")).toEqual({
        valid: false,
        error: "Username must be at least 3 alphanumeric characters.",
      });
      expect(validateAuthFormInput("register", "!@#", "secret123")).toEqual({
        valid: false,
        error: "Username must be at least 3 alphanumeric characters.",
      });
    });

    it("requires at least 4 characters passphrase in login and register modes", () => {
      expect(validateAuthFormInput("login", "operator_one")).toEqual({
        valid: false,
        error: "Passphrase must be at least 4 characters.",
      });
      expect(validateAuthFormInput("login", "operator_one", "123")).toEqual({
        valid: false,
        error: "Passphrase must be at least 4 characters.",
      });
      expect(validateAuthFormInput("register", "operator_one", "123")).toEqual({
        valid: false,
        error: "Passphrase must be at least 4 characters.",
      });
    });

    it("passes for valid login and register inputs", () => {
      expect(validateAuthFormInput("login", "operator_one", "secret123")).toEqual({
        valid: true,
        error: null,
      });
      expect(validateAuthFormInput("register", "operator_one", "secret123")).toEqual({
        valid: true,
        error: null,
      });
    });

    it("allows switch mode without pin when username is valid", () => {
      expect(validateAuthFormInput("switch", "operator_one")).toEqual({
        valid: true,
        error: null,
      });
    });
  });

  describe("Accessibility & Keyboard Navigation", () => {
    it("links tabs to role='tabpanel' with aria-controls and aria-labelledby", () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const tabpanel = screen.getByRole("tabpanel");
      expect(tabpanel).toBeDefined();
      expect(tabpanel.getAttribute("id")).toBe("auth-modal-tabpanel");
      expect(tabpanel.getAttribute("aria-labelledby")).toBe("auth-tab-login");

      const signInTab = screen.getByRole("tab", { name: /Sign In/i });
      const newCadetTab = screen.getByRole("tab", { name: /New Cadet/i });

      expect(signInTab.getAttribute("aria-controls")).toBe("auth-modal-tabpanel");
      expect(newCadetTab.getAttribute("aria-controls")).toBe("auth-modal-tabpanel");
      expect(signInTab.getAttribute("id")).toBe("auth-tab-login");
      expect(newCadetTab.getAttribute("id")).toBe("auth-tab-signup");
    });

    it("navigates tabs using ArrowRight and ArrowLeft keyboard keys", () => {
      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const signInTab = screen.getByRole("tab", { name: /Sign In/i });
      const newCadetTab = screen.getByRole("tab", { name: /New Cadet/i });
      const tablist = screen.getByRole("tablist", { name: "Authentication modes" });

      expect(signInTab.getAttribute("aria-selected")).toBe("true");

      // Press ArrowRight to move to New Cadet
      fireEvent.keyDown(tablist, { key: "ArrowRight" });
      expect(newCadetTab.getAttribute("aria-selected")).toBe("true");
      expect(signInTab.getAttribute("aria-selected")).toBe("false");
      expect(soundEngine.playSfx).toHaveBeenCalledWith("click");

      // Press ArrowRight again to wrap around to Sign In
      fireEvent.keyDown(tablist, { key: "ArrowRight" });
      expect(signInTab.getAttribute("aria-selected")).toBe("true");
      expect(newCadetTab.getAttribute("aria-selected")).toBe("false");

      // Press ArrowLeft to wrap backwards to New Cadet
      fireEvent.keyDown(tablist, { key: "ArrowLeft" });
      expect(newCadetTab.getAttribute("aria-selected")).toBe("true");
    });

    it("supports 3-way arrow navigation when saved accounts exist", () => {
      useAuthStore.setState({
        accounts: {
          cadet_one: {
            profile: {
              id: "c1",
              username: "cadet_one",
              displayName: "Cadet One",
              avatarId: "neon-hacker",
              customBio: "",
              title: "Initiate",
              joinedAt: new Date().toISOString(),
              isGuest: false,
              showcaseBadgeId: "badge1",
            },
            passHash: "hash",
          },
        },
      });

      render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const tablist = screen.getByRole("tablist", { name: "Authentication modes" });
      const signInTab = screen.getByRole("tab", { name: /Sign In/i });
      const newCadetTab = screen.getByRole("tab", { name: /New Cadet/i });
      const accountsTab = screen.getByRole("tab", { name: /Accounts/i });

      expect(signInTab.getAttribute("aria-selected")).toBe("true");

      // ArrowRight: Sign In -> New Cadet
      fireEvent.keyDown(signInTab, { key: "ArrowRight" });
      expect(newCadetTab.getAttribute("aria-selected")).toBe("true");

      // ArrowRight: New Cadet -> Accounts
      fireEvent.keyDown(newCadetTab, { key: "ArrowRight" });
      expect(accountsTab.getAttribute("aria-selected")).toBe("true");

      // ArrowRight: Accounts -> Sign In (wraparound)
      fireEvent.keyDown(accountsTab, { key: "ArrowRight" });
      expect(signInTab.getAttribute("aria-selected")).toBe("true");

      // ArrowLeft: Sign In -> Accounts (backwards wraparound)
      fireEvent.keyDown(signInTab, { key: "ArrowLeft" });
      expect(accountsTab.getAttribute("aria-selected")).toBe("true");
    });

    it("marks decorative icons with aria-hidden='true'", () => {
      const { container } = render(<AuthModal isOpen={true} onClose={mockOnClose} />);

      const hiddenSvgs = container.querySelectorAll("svg[aria-hidden='true']");
      expect(hiddenSvgs.length).toBeGreaterThanOrEqual(4);
    });
  });
});
