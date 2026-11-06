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

    const heading = screen.getByRole("heading", { name: /keyboard shortcuts/i, level: 2 });
    expect(heading).toBeDefined();
    expect(dialog.getAttribute("aria-labelledby")).toBe(heading.getAttribute("id"));
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

  it("renders semantic shortcut lists with category aria-labels and listitems", () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={() => {}} />);

    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(3);

    const globalList = screen.getByRole("list", { name: "Global Commands" });
    const ideList = screen.getByRole("list", { name: "Matrix IDE / Quest Workspace" });
    const combatList = screen.getByRole("list", { name: "Combat & Navigation" });

    expect(globalList).toBeDefined();
    expect(ideList).toBeDefined();
    expect(combatList).toBeDefined();

    const allItems = screen.getAllByRole("listitem");
    expect(allItems).toHaveLength(7);
  });

  it("announces matching shortcut count in a polite live status region on open and when filtering", () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={() => {}} />);

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute("aria-live")).toBe("polite");
    expect(statusRegion.textContent).toBe("7 keyboard shortcuts available");

    const searchInput = screen.getByPlaceholderText(/Search hotkeys/i);

    // Filter to single match
    fireEvent.change(searchInput, { target: { value: "Sidebar" } });
    expect(statusRegion.textContent).toBe("1 keyboard shortcut available");
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    // Filter to multiple matches (Ctrl matches Command Palette, Run & Verify Code, Toggle Sidebar)
    fireEvent.change(searchInput, { target: { value: "Ctrl" } });
    expect(statusRegion.textContent).toBe("3 keyboard shortcuts available");
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);

    // Filter to zero matches
    fireEvent.change(searchInput, { target: { value: "nonexistent_hotkey_query" } });
    expect(statusRegion.textContent).toBe('No keyboard shortcuts match "nonexistent_hotkey_query"');
    expect(screen.queryAllByRole("list")).toHaveLength(0);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);

    // Clear search restores all
    const clearBtn = screen.getByRole("button", { name: /clear shortcut search/i });
    fireEvent.click(clearBtn);
    expect(statusRegion.textContent).toBe("7 keyboard shortcuts available");
    expect(screen.getAllByRole("list")).toHaveLength(3);
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
  });
});
