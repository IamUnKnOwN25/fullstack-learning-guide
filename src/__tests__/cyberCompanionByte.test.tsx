/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { CyberCompanionByte } from "../components/CyberCompanionByte";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

describe("CyberCompanionByte Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      xp: 100,
      level: 5,
      rankTitle: "Markup Apprentice",
      hp: 100,
      maxHp: 100,
      completedQuests: ["html_1", "css_1"],
      completedBosses: ["boss_1"],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders only the floating orb button initially with happy eyes", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    expect(orbBtn).toBeDefined();
    expect(screen.queryByText(/BYTE • AI Cybernetic Familiar/)).toBeNull();
    expect(screen.getByText("(◕‿◕)")).toBeDefined();
  });

  it("opens dialogue drawer when orb is clicked with dialog accessibility attributes", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("skill-unlock");

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-label")).toBe("BYTE Cybernetic Familiar Intel");
    expect(dialog.getAttribute("aria-modal")).toBe("false");

    expect(screen.getByText(/BYTE • AI Cybernetic Familiar/)).toBeDefined();
    expect(screen.getByText("Tactical Intel")).toBeDefined();
    expect(screen.getByText(/Quick Quiz/)).toBeDefined();
  });

  it("closes dialogue drawer when Escape key is pressed", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);
    expect(screen.getByRole("dialog")).toBeDefined();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cycles tips when Next Tip is clicked and rotates eye expression", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const nextTipBtn = screen.getByText("Next Tip");
    fireEvent.click(nextTipBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText("(^_-)")).toBeDefined();
  });

  it("switches to Quick Quiz mode and handles answering questions correctly", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const quizTab = screen.getByText(/Quick Quiz/);
    fireEvent.click(quizTab);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText(/HTML REALM/)).toBeDefined();

    // Select the correct option: '<main>'
    const correctOption = screen.getByText("<main>");
    expect(correctOption).toBeDefined();

    fireEvent.click(correctOption);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("correct");

    // Next flashcard button appears after answering
    const nextCardBtn = screen.getByText("Next Flashcard");
    fireEvent.click(nextCardBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("handles incorrect quiz answers without granting XP and sets thinking mood", () => {
    render(<CyberCompanionByte />);

    const initialXp = useGameStore.getState().xp;

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const quizTab = screen.getByText(/Quick Quiz/);
    fireEvent.click(quizTab);

    // Question 1: HTML Landmark element (0: "<div class='main'>", 1: "<main>", 2: "<section>")
    // Click incorrect option "<section>"
    const wrongOption = screen.getByText("<section>");
    fireEvent.click(wrongOption);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("error");
    // XP should not have increased
    expect(useGameStore.getState().xp).toBe(initialXp);

    // Eye expression should reflect thinking "(o_O)"
    expect(screen.getByText("(o_O)")).toBeDefined();
  });

  it("renders Emergency Heal button only when player HP is below maxHp and triggers cool mood", () => {
    useGameStore.setState({
      hp: 40,
      maxHp: 100,
    });

    const { rerender } = render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const healBtn = screen.getByTitle("Emergency Field Medic Repair");
    expect(healBtn).toBeDefined();

    act(() => {
      fireEvent.click(healBtn);
    });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("heal");
    expect(useGameStore.getState().hp).toBe(65); // heals +25 HP
    expect(screen.getByText("(⌐■_■)")).toBeDefined(); // cool expression

    // Set HP to 100 (full)
    act(() => {
      useGameStore.setState({ hp: 100 });
      rerender(<CyberCompanionByte />);
    });

    expect(screen.queryByTitle("Emergency Field Medic Repair")).toBeNull();
  });

  it("displays player cadet briefing stats in the dialogue footer", () => {
    useGameStore.setState({
      level: 7,
      rankTitle: "Style Weaver",
      completedQuests: ["html_1", "html_2", "css_1"],
      completedBosses: ["boss_1", "boss_2"],
    });

    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    expect(screen.getByText(/Style Weaver \(L7\)/)).toBeDefined();
    expect(screen.getByText(/3\/24 Quests • 2\/12 Bosses/)).toBeDefined();
  });

  it("closes drawer when the close button is clicked", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const closeBtn = screen.getByLabelText("Close Byte dialog");
    fireEvent.click(closeBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.queryByText(/BYTE • AI Cybernetic Familiar/)).toBeNull();
  });
});
