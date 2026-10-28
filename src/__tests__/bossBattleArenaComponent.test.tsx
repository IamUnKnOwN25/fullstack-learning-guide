/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { BossBattleArena } from "../components/BossBattleArena";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { BOSSES } from "../data/bosses";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("BossBattleArena Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      hp: 100,
      maxHp: 100,
      completedBosses: [],
      completedQuests: [],
      unlockedSkills: [],
    });
  });

  it("renders boss encounter not found when given an invalid realm", () => {
    render(<BossBattleArena realmId="non-existent-realm" />);

    expect(screen.getByText("Boss Encounter Not Found")).toBeDefined();
    expect(screen.getByText("Retreat to World Map")).toBeDefined();
  });

  it("renders boss title, combat arena, health bars, and code editor", () => {
    const htmlBoss = BOSSES["html"];
    render(<BossBattleArena realmId="html" />);

    expect(screen.getAllByText(htmlBoss.name).length).toBeGreaterThan(0);
    expect(screen.getByText(htmlBoss.title)).toBeDefined();
    expect(screen.getByText(/Player Vitality/i)).toBeDefined();

    const editor = screen.getByRole("textbox", { name: /combat code editor/i });
    expect(editor).toBeDefined();
    expect((editor as HTMLTextAreaElement).value).toBe(htmlBoss.phases[0].initialCode);
  });

  it("toggles the tactical weakness scanner with aria-expanded", () => {
    render(<BossBattleArena realmId="html" />);

    const scannerToggle = screen.getByRole("button", {
      name: /tactical weakness scanner/i,
    });
    expect(scannerToggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(scannerToggle);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(scannerToggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Target Vulnerability Signature:")).toBeDefined();

    // Clicking again collapses it
    fireEvent.click(scannerToggle);
    expect(scannerToggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Target Vulnerability Signature:")).toBeNull();
  });

  it("loads tactical patch from scanner into editor", () => {
    const htmlBoss = BOSSES["html"];
    render(<BossBattleArena realmId="html" />);

    // Open scanner
    const scannerToggle = screen.getByRole("button", {
      name: /tactical weakness scanner/i,
    });
    fireEvent.click(scannerToggle);

    // Click Load Tactical Patch
    const loadPatchBtn = screen.getByRole("button", { name: /load tactical patch/i });
    fireEvent.click(loadPatchBtn);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toBe(htmlBoss.phases[0].hint);
  });

  it("inserts programmer symbols from mobile accessory bar into code", () => {
    render(<BossBattleArena realmId="html" />);

    const tabBtn = screen.getByRole("button", { name: "⇥ Tab" });
    fireEvent.click(tabBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    }) as HTMLTextAreaElement;
    expect(editor.value).toContain("  ");
  });

  it("resets modified code back to phase initialCode upon clicking Reset Code", () => {
    const htmlBoss = BOSSES["html"];
    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    }) as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "corrupted modified code" } });
    expect(editor.value).toBe("corrupted modified code");

    const resetBtn = screen.getByRole("button", { name: /reset code/i });
    fireEvent.click(resetBtn);

    expect(editor.value).toBe(htmlBoss.phases[0].initialCode);
  });

  it("supports Tab key indentation in combat editor", () => {
    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    }) as HTMLTextAreaElement;

    editor.selectionStart = 0;
    editor.selectionEnd = 0;
    fireEvent.keyDown(editor, { key: "Tab" });

    expect(editor.value.startsWith("  ")).toBe(true);
  });

  it("supports Ctrl+Enter keyboard shortcut to strike the boss", () => {
    const htmlBoss = BOSSES["html"];
    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    }) as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: htmlBoss.phases[0].hint } });

    fireEvent.keyDown(editor, { key: "Enter", ctrlKey: true });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");
    expect(soundEngine.playSfx).toHaveBeenCalledWith("boss-hit");
  });

  it("advances to Phase 2 after successfully completing Phase 1", () => {
    const htmlBoss = BOSSES["html"];
    render(<BossBattleArena realmId="html" />);

    expect(screen.getByText(/BATTLE STAGE 1 OF 2/i)).toBeDefined();

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    }) as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: htmlBoss.phases[0].hint } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    // Should now be on Stage 2
    expect(screen.getByText(/BATTLE STAGE 2 OF 2/i)).toBeDefined();
    expect(editor.value).toBe(htmlBoss.phases[1].initialCode);
  });

  it("absorbs syntax counter with Lint Barrier when unlocked and discharges it", () => {
    useGameStore.setState({
      unlockedSkills: ["lint_shield"],
      hp: 100,
    });

    render(<BossBattleArena realmId="html" />);

    expect(screen.getByText(/Lint Barrier: Charged/i)).toBeDefined();

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    });
    fireEvent.change(editor, { target: { value: "invalid code" } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    // Deflected without damage
    expect(soundEngine.playSfx).toHaveBeenCalledWith("skill-unlock");
    expect(useGameStore.getState().hp).toBe(100);
    expect(screen.getByText(/Lint Barrier: Discharged/i)).toBeDefined();

    // A second failure should now deal damage
    fireEvent.click(strikeBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("error");
    expect(useGameStore.getState().hp).toBeLessThan(100);
  });

  it("handles syntax counter-attack when testCondition fails and player has no shield", () => {
    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    });
    fireEvent.change(editor, { target: { value: "<div>bad syntax" } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("error");
    expect(useGameStore.getState().hp).toBeLessThan(100);
  });

  it("renders CODE COLLAPSE screen when player HP drops to 0 and allows retry", () => {
    useGameStore.setState({ hp: 10 }); // 1 hit will drop HP to 0

    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    });
    fireEvent.change(editor, { target: { value: "invalid syntax causing counter" } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    expect(screen.getByText("CODE COLLAPSE")).toBeDefined();
    expect(screen.getByText(/Your HP reached 0/i)).toBeDefined();

    // Click retry
    const retryBtn = screen.getByRole("button", { name: /re-energize hp & retry boss/i });
    fireEvent.click(retryBtn);

    // Should return to normal combat arena
    expect(screen.queryByText("CODE COLLAPSE")).toBeNull();
    expect(useGameStore.getState().hp).toBe(100);
  });

  it("renders victory screen, post-mortem toggle, and handles rematch", () => {
    useGameStore.setState({
      completedBosses: ["html"],
    });

    render(<BossBattleArena realmId="html" />);

    expect(screen.getByText("VICTORY ACHIEVED!")).toBeDefined();
    expect(screen.getByText(/SENIOR INCIDENT RETROSPECTIVE/i)).toBeDefined();

    // Toggle post-mortem
    const collapseBtn = screen.getByRole("button", { name: /collapse report/i });
    expect(collapseBtn).toBeDefined();
    fireEvent.click(collapseBtn);
    expect(screen.getByRole("button", { name: /expand report/i })).toBeDefined();

    // Click Rematch Boss
    const rematchBtn = screen.getByRole("button", { name: /rematch boss/i });
    fireEvent.click(rematchBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.queryByText("VICTORY ACHIEVED!")).toBeNull();
    expect(screen.getByRole("button", { name: /cast refactor strike/i })).toBeDefined();
  });

  it("renders accessible combat activity log with live region on counter-attack", () => {
    render(<BossBattleArena realmId="html" />);

    expect(screen.queryByRole("log")).toBeNull();

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    });
    fireEvent.change(editor, { target: { value: "invalid code" } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    const log = screen.getByRole("log", { name: "Combat Activity Log" });
    expect(log).toBeDefined();
    expect(log.getAttribute("aria-live")).toBe("polite");
    expect(within(log).getByText(/\[SYNTAX COUNTER\]/i)).toBeDefined();
  });
});
