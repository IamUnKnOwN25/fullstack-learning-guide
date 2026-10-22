/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { XpGainFloatie } from "../components/XpGainFloatie";
import { useGameStore } from "../lib/gameStore";

describe("XpGainFloatie Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      recentXpGain: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders nothing when recentXpGain is null", () => {
    const { container } = render(<XpGainFloatie />);
    expect(container.firstChild).toBeNull();
  });

  it("renders XP gain amount with accessibility attributes", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 250,
        streakBonus: 0,
        source: "",
        timestamp: Date.now(),
      },
    });

    render(<XpGainFloatie />);

    const floatie = screen.getByTestId("xp-gain-floatie");
    expect(floatie).toBeDefined();
    expect(floatie.getAttribute("role")).toBe("status");
    expect(floatie.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByText("+250 XP")).toBeDefined();
    expect(screen.queryByText(/Streak/)).toBeNull();
  });

  it("renders streak bonus badge when streakBonus is greater than 0", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 100,
        streakBonus: 25,
        source: "",
        timestamp: Date.now(),
      },
    });

    render(<XpGainFloatie />);

    expect(screen.getByText("+100 XP")).toBeDefined();
    expect(screen.getByText("+25 Streak")).toBeDefined();
  });

  it("renders quest or achievement source when provided", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 300,
        streakBonus: 0,
        source: "CSS Flexbox Mastery",
        timestamp: Date.now(),
      },
    });

    render(<XpGainFloatie />);

    expect(screen.getByText("(CSS Flexbox Mastery)")).toBeDefined();
  });

  it("automatically dismisses and cleans up after 2400ms timer", () => {
    vi.useFakeTimers();

    useGameStore.setState({
      recentXpGain: {
        amount: 50,
        streakBonus: 0,
        source: "",
        timestamp: Date.now(),
      },
    });

    render(<XpGainFloatie />);
    expect(screen.getByText("+50 XP")).toBeDefined();

    // Advance timer past 2400ms
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();
    expect(useGameStore.getState().recentXpGain).toBeNull();
  });

  it("resets timer if a new XP gain occurs before expiration", () => {
    vi.useFakeTimers();

    useGameStore.setState({
      recentXpGain: {
        amount: 75,
        streakBonus: 0,
        source: "",
        timestamp: Date.now(),
      },
    });

    const { rerender } = render(<XpGainFloatie />);
    expect(screen.getByText("+75 XP")).toBeDefined();

    // Advance partially
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // New gain occurs
    act(() => {
      useGameStore.setState({
        recentXpGain: {
          amount: 200,
          streakBonus: 50,
          source: "Bonus Challenge",
          timestamp: Date.now(),
        },
      });
    });

    rerender(<XpGainFloatie />);

    expect(screen.getByText("+200 XP")).toBeDefined();
    expect(screen.getByText("+50 Streak")).toBeDefined();

    // Advance 1500ms (total 3000ms from start, but only 1500ms since reset)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Still visible because 2400ms has not passed since the new gain
    expect(screen.getByTestId("xp-gain-floatie")).toBeDefined();

    // Advance past remaining 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();
  });
});
