/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { soundEngine } from "../lib/soundEngine";

describe("KeyboardShortcutsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it("renders when isOpen is true with appropriate dialog accessibility attributes", () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("keyboard-shortcuts-title");

    expect(screen.getByRole("heading", { name: /keyboard shortcuts/i, level: 2 })).toBeDefined();
    expect(screen.getByText("Master the terminal hotkeys")).toBeDefined();
    expect(screen.getByText("Global Commands")).toBeDefined();
    expect(screen.getByText("Matrix IDE / Quest Workspace")).toBeDefined();

    expect(screen.getByText("Ctrl+K")).toBeDefined();
    expect(screen.getByText("Ctrl+Enter")).toBeDefined();
    expect(screen.getByText("Ctrl+B")).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    render(<KeyboardShortcutsModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("Keyboard Shortcuts")).toBeNull();
  });

  it("calls onClose and plays SFX when the close icon button is clicked", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: /close keyboard shortcuts modal/i });
    expect(closeBtn).toBeDefined();

    fireEvent.click(closeBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when footer Close button is clicked", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    const footerCloseBtn = screen.getByRole("button", { name: /close \(esc\)/i });
    fireEvent.click(footerCloseBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    const heading = screen.getByRole("heading", { name: /keyboard shortcuts/i, level: 2 });
    fireEvent.click(heading);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it("filters keyboard shortcuts dynamically via search input", () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByPlaceholderText(/Search hotkeys/i);
    fireEvent.change(searchInput, { target: { value: "Sidebar" } });

    expect(screen.getByText("Toggle Sidebar (IDE only)")).toBeDefined();
    expect(screen.queryByText("Command Palette")).toBeNull();
  });

  it("displays empty state when search finds no matching shortcuts and allows clearing search", () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByPlaceholderText(/Search hotkeys/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent_shortcut_xyz" } });

    expect(screen.getByText(/No keyboard shortcuts match your search/i)).toBeDefined();

    const clearBtn = screen.getByRole("button", { name: /clear shortcut search/i });
    fireEvent.click(clearBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect((searchInput as HTMLInputElement).value).toBe("");
    expect(screen.getByText("Command Palette")).toBeDefined();
  });

  it("renders Combat & Navigation category items", () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Combat & Navigation")).toBeDefined();
    expect(screen.getByText("Execute Spell Strike")).toBeDefined();
    expect(screen.getByText("Advance Familiar Intel")).toBeDefined();
  });
});
