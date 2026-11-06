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
    expect(floatie.getAttribute("aria-atomic")).toBe("true");
    expect(floatie.getAttribute("aria-label")).toBe("Awarded 250 XP");
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

    const floatie = screen.getByTestId("xp-gain-floatie");
    expect(floatie.getAttribute("aria-label")).toBe("Awarded 100 XP, plus 25 streak bonus");
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

    const floatie = screen.getByTestId("xp-gain-floatie");
    expect(floatie.getAttribute("aria-label")).toBe("Awarded 300 XP from CSS Flexbox Mastery");
    expect(screen.getByText("(CSS Flexbox Mastery)")).toBeDefined();
  });

  it("renders spoken aria-label combining both streak bonus and source", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 450,
        streakBonus: 50,
        source: "Boss Battle",
        timestamp: Date.now(),
      },
    });

    render(<XpGainFloatie />);

    const floatie = screen.getByTestId("xp-gain-floatie");
    expect(floatie.getAttribute("aria-label")).toBe(
      "Awarded 450 XP, plus 50 streak bonus from Boss Battle"
    );
    expect(screen.getByText("+450 XP")).toBeDefined();
    expect(screen.getByText("+50 Streak")).toBeDefined();
    expect(screen.getByText("(Boss Battle)")).toBeDefined();
  });

  it("marks decorative Sparkles and Flame icons with aria-hidden='true'", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 150,
        streakBonus: 30,
        source: "Trial Execution",
        timestamp: Date.now(),
      },
    });

    const { container } = render(<XpGainFloatie />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(2);
    icons.forEach((icon) => {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("marks decorative Sparkles icon with aria-hidden='true' when no streak bonus", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 150,
        streakBonus: 0,
        source: "",
        timestamp: Date.now(),
      },
    });

    const { container } = render(<XpGainFloatie />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(1);
    expect(icons[0].getAttribute("aria-hidden")).toBe("true");
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

  it("cleans up active timers when component unmounts prematurely", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    useGameStore.setState({
      recentXpGain: {
        amount: 150,
        streakBonus: 10,
        source: "Unmount Test",
        timestamp: Date.now(),
      },
    });

    const { unmount } = render(<XpGainFloatie />);
    expect(screen.getByText("+150 XP")).toBeDefined();

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("hides immediately when recentXpGain is dismissed to null", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 80,
        streakBonus: 0,
        source: "",
        timestamp: Date.now(),
      },
    });

    const { rerender } = render(<XpGainFloatie />);
    expect(screen.getByText("+80 XP")).toBeDefined();

    act(() => {
      useGameStore.setState({ recentXpGain: null });
    });

    rerender(<XpGainFloatie />);
    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();
  });

  it("suppresses floatie rendering when XP amount is zero, negative, or non-finite", () => {
    useGameStore.setState({
      recentXpGain: {
        amount: 0,
        streakBonus: 0,
        source: "Zero XP Event",
        timestamp: Date.now(),
      },
    });

    const { container, rerender } = render(<XpGainFloatie />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();

    act(() => {
      useGameStore.setState({
        recentXpGain: {
          amount: -50,
          streakBonus: 0,
          source: "Negative XP Event",
          timestamp: Date.now(),
        },
      });
    });
    rerender(<XpGainFloatie />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();

    act(() => {
      useGameStore.setState({
        recentXpGain: {
          amount: NaN,
          streakBonus: 0,
          source: "NaN XP Event",
          timestamp: Date.now(),
        },
      });
    });
    rerender(<XpGainFloatie />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();

    act(() => {
      useGameStore.setState({
        recentXpGain: {
          amount: Infinity,
          streakBonus: 0,
          source: "Infinity XP Event",
          timestamp: Date.now(),
        },
      });
    });
    rerender(<XpGainFloatie />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("xp-gain-floatie")).toBeNull();
  });
});
