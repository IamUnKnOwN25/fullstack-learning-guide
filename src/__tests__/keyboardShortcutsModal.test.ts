import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";
import { render, screen, cleanup } from "@testing-library/react";

describe("KeyboardShortcutsModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders when isOpen is true", () => {
    const { getByText } = render(React.createElement(KeyboardShortcutsModal, { isOpen: true, onClose: () => {} }));
    expect(getByText("Keyboard Shortcuts")).toBeDefined();
    expect(getByText("Ctrl+K")).toBeDefined();
    expect(getByText("Ctrl+Enter")).toBeDefined();
    expect(getByText("Ctrl+B")).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    const { queryByText } = render(React.createElement(KeyboardShortcutsModal, { isOpen: false, onClose: () => {} }));
    expect(queryByText("Keyboard Shortcuts")).toBeNull();
  });
});
