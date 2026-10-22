/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

describe("KeyboardShortcutsModal", () => {
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

  it("calls onClose when the close icon button is clicked", () => {
    const handleClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: /close keyboard shortcuts modal/i });
    expect(closeBtn).toBeDefined();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
