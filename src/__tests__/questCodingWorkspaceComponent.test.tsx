/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestCodingWorkspace } from "../components/QuestCodingWorkspace";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { QUESTS } from "../data/quests";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("QuestCodingWorkspace Component", () => {
  const htmlQuest = QUESTS["html"][0];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      completedQuests: [],
      stars: {},
      unlockedSkills: [],
      xp: 0,
    });
  });

  it("renders quest title, concept summary, and starter code", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    expect(screen.getByText(htmlQuest.title)).toBeDefined();
    expect(screen.getByText(htmlQuest.conceptSummary)).toBeDefined();

    const editor = screen.getByRole("textbox", {
      name: /quest solution code editor/i,
    });
    expect(editor).toBeDefined();
    expect((editor as HTMLTextAreaElement).value).toBe(htmlQuest.starterCode);
  });

  it("switches between directive tabs (Directive, Warm-Up, Deep Dive)", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const directiveTab = screen.getByRole("button", { name: "Directive" });
    const warmupTab = screen.getByRole("button", { name: /warm-up/i });
    const deepDiveTab = screen.getByRole("button", { name: /deep dive/i });

    expect(directiveTab.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(warmupTab);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(warmupTab.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("textbox", { name: /warm-up drill code editor/i })).toBeDefined();

    fireEvent.click(deepDiveTab);
    expect(deepDiveTab.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Why This Works in Production")).toBeDefined();
  });

  it("switches workspace tabs (Code Editor, Live Preview, Terminal, Visualizer)", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const editorTab = screen.getByRole("button", { name: /code editor/i });
    const previewTab = screen.getByRole("button", { name: /live preview/i });
    const terminalTab = screen.getByRole("button", { name: /terminal/i });
    const visualizerTab = screen.getByRole("button", { name: /visualizer/i });

    expect(editorTab.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(previewTab);
    expect(previewTab.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(terminalTab);
    expect(terminalTab.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/TERMINAL TEST RUNNER OUTPUT/i)).toBeDefined();

    fireEvent.click(visualizerTab);
    expect(visualizerTab.getAttribute("aria-pressed")).toBe("true");
  });

  it("inserts programmer symbols at cursor", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const tabBtn = screen.getByRole("button", { name: "⇥ Tab" });
    fireEvent.click(tabBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const editor = screen.getByRole("textbox", {
      name: /quest solution code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toContain("  ");
  });

  it("handles running valid solution and completing the quest", () => {
    const validHtmlSolution = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevQuest Node</title>
  </head>
  <body>
    <h1>Matrix Awakened</h1>
    <p>The matrix skeleton is restored and online.</p>
  </body>
</html>`;

    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const editor = screen.getByRole("textbox", {
      name: /quest solution code editor/i,
    });
    // Set valid solution code for html_1_skeleton
    fireEvent.change(editor, { target: { value: validHtmlSolution } });

    const runBtn = screen.getByRole("button", { name: /cast spell & verify/i });
    fireEvent.click(runBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("correct");
    expect(useGameStore.getState().completedQuests).toContain(htmlQuest.id);
  });

  it("handles running invalid solution and displays failure diagnostics in terminal", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const editor = screen.getByRole("textbox", {
      name: /quest solution code editor/i,
    });
    fireEvent.change(editor, { target: { value: "<div>no header</div>" } });

    const runBtn = screen.getByRole("button", { name: /cast spell & verify/i });
    fireEvent.click(runBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("error");
    // Automatically switches to terminal tab
    expect(screen.getByText(/TEST FAILED/i)).toBeDefined();
  });
});
