/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestCodingWorkspace } from "../components/QuestCodingWorkspace";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { QUESTS } from "../data/quests";
import { REALM_WARMUP_DRILLS, QUEST_DEEP_DIVES } from "../data/questPedagogy";

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

  it("resets modified code back to starterCode when Reset Code is clicked", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const editor = screen.getByRole("textbox", {
      name: /quest solution code editor/i,
    }) as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: "broken code to reset" } });
    expect(editor.value).toBe("broken code to reset");

    const resetBtn = screen.getByRole("button", { name: /reset code/i });
    fireEvent.click(resetBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(editor.value).toBe(htmlQuest.starterCode);
  });

  it("reveals tactical hints sequentially", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    expect(screen.queryByText(/Hint 1:/i)).toBeNull();

    const revealBtn = screen.getByRole("button", { name: /reveal hint/i });
    fireEvent.click(revealBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText(/Hint 1:/i)).toBeDefined();
    expect(screen.getByText(htmlQuest.hints[0])).toBeDefined();
  });

  it("verifies warm-up drill solution snippet", () => {
    const drill = REALM_WARMUP_DRILLS["html"];
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    // Switch to Warm-Up tab
    const warmupTab = screen.getByRole("button", { name: /warm-up/i });
    fireEvent.click(warmupTab);

    // Load solution pattern
    const loadSolutionBtn = screen.getByRole("button", { name: /load solution pattern/i });
    fireEvent.click(loadSolutionBtn);

    const warmupEditor = screen.getByRole("textbox", {
      name: /warm-up drill code editor/i,
    }) as HTMLTextAreaElement;
    expect(warmupEditor.value).toBe(drill.solutionSnippet);

    // Verify drill
    const verifyBtn = screen.getAllByRole("button", { name: /verify warm-up drill/i })[0];
    fireEvent.click(verifyBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("correct");
  });

  it("handles Deep Dive concept check quiz and awards XP bonus", () => {
    const deepDive = QUEST_DEEP_DIVES[htmlQuest.id];
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    // Switch to Deep Dive tab
    const deepDiveTab = screen.getByRole("button", { name: /deep dive/i });
    fireEvent.click(deepDiveTab);

    // Click the correct quiz answer option (which submits directly)
    const correctOptionText = deepDive.quiz.options[deepDive.quiz.correctIndex];
    const correctBtn = screen.getByText(correctOptionText);
    fireEvent.click(correctBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("correct");
    expect(screen.getByText(deepDive.quiz.explanation)).toBeDefined();
    expect(useGameStore.getState().xp).toBeGreaterThan(0);
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

  it("toggles mentor architectural guide and reference pattern", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    expect(screen.queryByText(/Mentor Reference Pattern/i)).toBeNull();

    const mentorBtn = screen.getByRole("button", { name: /mentor walkthrough/i });
    fireEvent.click(mentorBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText(/Mentor Reference Pattern/i)).toBeDefined();

    const hideBtn = screen.getByRole("button", { name: /hide walkthrough/i });
    fireEvent.click(hideBtn);
    expect(screen.queryByText(/Mentor Reference Pattern/i)).toBeNull();
  });

  it("toggles maximize workbench layout", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const maximizeBtn = screen.getByRole("button", { name: /maximize/i });
    fireEvent.click(maximizeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByRole("button", { name: /split view/i })).toBeDefined();

    const splitBtn = screen.getByRole("button", { name: /split view/i });
    fireEvent.click(splitBtn);
    expect(screen.getByRole("button", { name: /maximize/i })).toBeDefined();
  });

  it("copies editor code to clipboard with audio and visual feedback", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const copyBtn = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(htmlQuest.starterCode);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText(/Copied!/i)).toBeDefined();
  });

  it("allows toggling task checklist items manually", () => {
    render(<QuestCodingWorkspace realmId="html" questId={htmlQuest.id} />);

    const taskText = htmlQuest.tasks[0];
    const taskButton = screen.getByRole("button", { name: new RegExp(taskText, "i") });

    fireEvent.click(taskButton);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });
});
