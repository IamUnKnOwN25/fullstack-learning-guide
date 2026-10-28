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
    localStorage.clear();
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

  it("switches project templates when selecting a different template from the dropdown", () => {
    render(<OnlineMatrixIde />);

    const templateSelect = screen.getByRole("combobox", {
      name: /select project template/i,
    });
    expect(templateSelect).toBeDefined();

    // Select the second template
    const secondTemplate = IDE_PROJECT_TEMPLATES[1];
    fireEvent.change(templateSelect, { target: { value: secondTemplate.id } });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const editor = screen.getByRole("textbox", {
      name: /matrix studio code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toBe(secondTemplate.files[0].content);
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

  it("creates a new file in explorer and opens it in editor", () => {
    render(<OnlineMatrixIde />);

    // Click "+" (New File) button in file explorer
    const newFileBtn = screen.getByTitle("New File");
    fireEvent.click(newFileBtn);

    const input = screen.getByPlaceholderText(/e\.g\. helper\.js/i);
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: "mathUtils.js" } });
    fireEvent.submit(input);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const newTab = screen.getByRole("tab", { name: /mathUtils\.js/i });
    expect(newTab).toBeDefined();

    const editor = screen.getByRole("textbox", {
      name: /matrix studio code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toContain("mathUtils.js");
  });

  it("closes a file tab when clicking close icon", () => {
    render(<OnlineMatrixIde />);

    // styles.css tab should be open initially
    const cssTab = screen.getByRole("tab", { name: /styles\.css/i });
    expect(cssTab).toBeDefined();

    // Find close button inside styles.css tab
    const closeBtn = cssTab.querySelector("button");
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn!);

    // styles.css tab should no longer be present
    expect(screen.queryByRole("tab", { name: /styles\.css/i })).toBeNull();
  });

  it("toggles bottom panel and executes terminal help, ls, and pwd commands", () => {
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

    // Type 'help' and submit
    fireEvent.change(terminalInput, { target: { value: "help" } });
    fireEvent.submit(terminalInput);
    expect(screen.getByText(/matrix-sh v2.4/i)).toBeDefined();

    // Type 'ls' and submit
    fireEvent.change(terminalInput, { target: { value: "ls" } });
    fireEvent.submit(terminalInput);

    // Type 'pwd' and submit
    fireEvent.change(terminalInput, { target: { value: "pwd" } });
    fireEvent.submit(terminalInput);
    expect(screen.getByText(/\/workspace/i)).toBeDefined();
  });

  it("triggers run project upon clicking the Run button", () => {
    render(<OnlineMatrixIde />);

    const runBtn = screen.getByRole("button", { name: /^Run$/i });
    expect(runBtn).toBeDefined();

    fireEvent.click(runBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");
  });

  it("switches responsive preview viewport across tablet and mobile", () => {
    render(<OnlineMatrixIde />);

    const tabletBtn = screen.getByTitle("Tablet Viewport (768px)");
    expect(tabletBtn).toBeDefined();
    fireEvent.click(tabletBtn);

    const mobileBtn = screen.getByTitle("Mobile Viewport (375px)");
    expect(mobileBtn).toBeDefined();
    fireEvent.click(mobileBtn);

    const desktopBtn = screen.getByTitle("Desktop Viewport (100%)");
    expect(desktopBtn).toBeDefined();
    fireEvent.click(desktopBtn);
  });

  it("resets modified files when clicking Reset Project Code", () => {
    render(<OnlineMatrixIde />);

    const defaultTemplate = IDE_PROJECT_TEMPLATES[0];
    const editor = screen.getByRole("textbox", {
      name: /matrix studio code editor/i,
    }) as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: "<div>Modified content</div>" } });
    expect(editor.value).toBe("<div>Modified content</div>");

    const resetBtn = screen.getByTitle("Reset Project Code");
    fireEvent.click(resetBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(editor.value).toBe(defaultTemplate.files[0].content);
  });
});
