/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnlineMatrixIde } from "../components/OnlineMatrixIde";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { IDE_PROJECT_TEMPLATES } from "../lib/ideBundler";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("OnlineMatrixIde Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      completedQuests: [],
      xp: 0,
    });
  });

  it("renders project template tabs and displays active file in the editor", () => {
    render(<OnlineMatrixIde />);

    const defaultTemplate = IDE_PROJECT_TEMPLATES[0];
    const editor = screen.getByRole("textbox", {
      name: /matrix studio code editor/i,
    }) as HTMLTextAreaElement;

    expect(editor).toBeDefined();
    // Default active file is index.html
    expect(editor.value).toBe(defaultTemplate.files[0].content);
  });

  it("switches active tab when clicking another file tab", () => {
    render(<OnlineMatrixIde />);

    const defaultTemplate = IDE_PROJECT_TEMPLATES[0];
    // Find tab for styles.css
    const cssTab = screen.getByRole("tab", { name: /styles\.css/i });
    fireEvent.click(cssTab);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const editor = screen.getByRole("textbox", {
      name: /matrix studio code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toBe(defaultTemplate.files[1].content);
  });

  it("inserts programmer symbols at cursor", () => {
    render(<OnlineMatrixIde />);

    const tabBtn = screen.getByRole("button", { name: "⇥ Tab" });
    fireEvent.click(tabBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const editor = screen.getByRole("textbox", {
      name: /matrix studio code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toContain("  ");
  });

  it("toggles bottom panel and executes terminal help command", () => {
    render(<OnlineMatrixIde />);

    // Open terminal tab at bottom
    const terminalBottomTab = screen.getByRole("button", {
      name: /terminal \(matrix-sh\)/i,
    });
    fireEvent.click(terminalBottomTab);

    const terminalInput = screen.getByRole("textbox", {
      name: /matrix interactive shell terminal input/i,
    });
    expect(terminalInput).toBeDefined();

    // Type 'help' and submit form
    fireEvent.change(terminalInput, { target: { value: "help" } });
    fireEvent.submit(terminalInput);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText(/matrix-sh v2.4/i)).toBeDefined();
  });
});
