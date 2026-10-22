/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CyberCompanionByte } from "../components/CyberCompanionByte";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

describe("CyberCompanionByte Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
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

  it("renders only the floating orb button initially", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    expect(orbBtn).toBeDefined();
    expect(screen.queryByText(/BYTE • AI Cybernetic Familiar/)).toBeNull();
  });

  it("opens dialogue drawer when orb is clicked", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("skill-unlock");
    expect(screen.getByText(/BYTE • AI Cybernetic Familiar/)).toBeDefined();
    expect(screen.getByText("Tactical Intel")).toBeDefined();
    expect(screen.getByText(/Quick Quiz/)).toBeDefined();
  });

  it("cycles tips when Next Tip is clicked", () => {
    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const nextTipBtn = screen.getByText("Next Tip");
    fireEvent.click(nextTipBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("switches to Quick Quiz mode and handles answering questions", () => {
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

  it("renders Emergency Heal button when player HP is below maxHp", () => {
    useGameStore.setState({
      hp: 40,
      maxHp: 100,
    });

    render(<CyberCompanionByte />);

    const orbBtn = screen.getByLabelText("Toggle Byte cybernetic familiar");
    fireEvent.click(orbBtn);

    const healBtn = screen.getByTitle("Emergency Field Medic Repair");
    expect(healBtn).toBeDefined();

    fireEvent.click(healBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("heal");
    expect(useGameStore.getState().hp).toBe(65); // heals +25 HP
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
