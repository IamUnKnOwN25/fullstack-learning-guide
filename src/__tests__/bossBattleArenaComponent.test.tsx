/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("handles successful refactor strike against the boss", () => {
    const htmlBoss = BOSSES["html"];
    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    });
    // Set code that satisfies phase 1 testCondition
    fireEvent.change(editor, { target: { value: htmlBoss.phases[0].hint } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");
    expect(soundEngine.playSfx).toHaveBeenCalledWith("boss-hit");
    expect(screen.getByText(/Combat Log/i)).toBeDefined();
  });

  it("handles syntax counter-attack when testCondition fails", () => {
    render(<BossBattleArena realmId="html" />);

    const editor = screen.getByRole("textbox", {
      name: /combat code editor/i,
    });
    // Completely invalid code
    fireEvent.change(editor, { target: { value: "<div>bad syntax" } });

    const strikeBtn = screen.getByRole("button", {
      name: /cast refactor strike/i,
    });
    fireEvent.click(strikeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("error");
    // Player HP should have decreased
    expect(useGameStore.getState().hp).toBeLessThan(100);
  });

  it("renders victory screen and senior post-mortem when realm boss is already defeated", () => {
    useGameStore.setState({
      completedBosses: ["html"],
    });

    render(<BossBattleArena realmId="html" />);

    expect(screen.getByText("VICTORY ACHIEVED!")).toBeDefined();
    expect(screen.getByText(/SENIOR INCIDENT RETROSPECTIVE/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /rematch boss/i })).toBeDefined();
  });
});
