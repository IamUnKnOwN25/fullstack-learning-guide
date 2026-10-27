/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RealmConceptVisualizer } from "../components/RealmConceptVisualizer";
import { soundEngine } from "../lib/soundEngine";

describe("RealmConceptVisualizer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
  });

  it("renders HTML semantic DOM inspector by default and allows inspecting nodes", () => {
    render(<RealmConceptVisualizer realmId="html" />);

    expect(screen.getByText("Interactive Semantic DOM Tree Inspector")).toBeDefined();
    expect(screen.getByText("Inspected Semantic Node")).toBeDefined();

    // Default node is <html>
    const headBtn = screen.getByRole("button", {
      name: /inspect <head> semantic node/i,
    });
    fireEvent.click(headBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(headBtn.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/Container for page title, viewport meta tags/i)).toBeDefined();
  });

  it("switches to CSS Flexbox lab and updates layout properties and computed code", () => {
    render(<RealmConceptVisualizer realmId="html" />);

    const cssLabBtn = screen.getByRole("button", {
      name: /switch concept lab to css/i,
    });
    fireEvent.click(cssLabBtn);

    expect(screen.getByText("Interactive Flexbox & Flow Playground")).toBeDefined();

    // Toggle flex-direction to column
    const colBtn = screen.getByRole("button", { name: "column" });
    fireEvent.click(colBtn);
    expect(colBtn.className).toContain("bg-matrix-accent");
    expect(screen.getByText(/flex-direction: column;/i)).toBeDefined();

    // Change justify-content
    const justifySelect = screen.getByRole("combobox", {
      name: /justify-content/i,
    });
    fireEvent.change(justifySelect, { target: { value: "space-between" } });
    expect((justifySelect as HTMLSelectElement).value).toBe("space-between");

    // Change align-items
    const alignSelect = screen.getByRole("combobox", {
      name: /align-items/i,
    });
    fireEvent.change(alignSelect, { target: { value: "stretch" } });
    expect((alignSelect as HTMLSelectElement).value).toBe("stretch");
  });

  it("switches to JavaScript lab and steps through event loop phases", () => {
    render(<RealmConceptVisualizer realmId="javascript" />);

    expect(
      screen.getByText("JavaScript Event Loop & Microtask Simulator")
    ).toBeDefined();

    const stepBtn = screen.getByRole("button", { name: /step next/i });
    expect(screen.getByText("Step 1: Script Enters Call Stack")).toBeDefined();

    fireEvent.click(stepBtn);
    expect(
      screen.getByText("Step 2: Promise.resolve() Enqueues Microtask")
    ).toBeDefined();
  });

  it("switches to Computer Science lab and animates binary search halving steps", () => {
    render(<RealmConceptVisualizer realmId="cs" />);

    expect(screen.getByText(/Binary Search Step-by-Step Animator/i)).toBeDefined();
    expect(screen.getByText(/in a sorted array of 12 elements/i)).toBeDefined();

    const nextStepBtn = screen.getByRole("button", { name: /next halving step/i });
    expect(nextStepBtn).toBeDefined();

    // Step 1
    fireEvent.click(nextStepBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");

    // Step 2
    fireEvent.click(nextStepBtn);

    // Step 3 (reaches target 42)
    fireEvent.click(nextStepBtn);
    expect(screen.getByText(/Target 42 found at index 6 in only 3 comparisons!/i)).toBeDefined();
  });

  it("switches to TypeScript lab and tests discriminated union type narrowing", () => {
    render(<RealmConceptVisualizer realmId="typescript" />);

    expect(screen.getByText(/Discriminated Union & Type Narrowing Lab/i)).toBeDefined();

    // Toggle to "loading" status
    const loadingBtn = screen.getByRole("button", { name: /"loading"/i });
    fireEvent.click(loadingBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByText(/Narrowed Type: LoadingState/i)).toBeDefined();

    // Toggle to "error" status
    const errorBtn = screen.getByRole("button", { name: /"error"/i });
    fireEvent.click(errorBtn);
    expect(screen.getByText(/Narrowed Type: ErrorState/i)).toBeDefined();

    // Toggle strict mode off (unsafe any mode)
    const strictToggle = screen.getByRole("button", { name: /strictnullchecks: on/i });
    fireEvent.click(strictToggle);
    expect(screen.getByText(/Unsafe 'any' Mode: ON/i)).toBeDefined();
  });

  it("switches to Security lab and toggles XSS sanitizer shield", () => {
    render(<RealmConceptVisualizer realmId="security" />);

    expect(
      screen.getByText("Interactive XSS Injection & Sanitization Lab")
    ).toBeDefined();

    const shieldBtn = screen.getByRole("button", {
      name: /sanitizer shield:/i,
    });
    expect(screen.getByText(/Sanitizer Shield: ACTIVE/i)).toBeDefined();

    // Toggle shield off
    fireEvent.click(shieldBtn);
    expect(screen.getByText(/Sanitizer Shield: DISABLED/i)).toBeDefined();
    expect(screen.getByText(/CRITICAL: Unescaped string injected into DOM/i)).toBeDefined();

    // Toggle shield back on
    fireEvent.click(shieldBtn);
    expect(screen.getByText(/Harmless text rendered on screen/i)).toBeDefined();
  });

  it("switches to React flamegraph lab and triggers parent setState", () => {
    render(<RealmConceptVisualizer realmId="react" />);

    expect(
      screen.getByText("React Render Flamegraph & Memoization Lab")
    ).toBeDefined();

    const triggerBtn = screen.getByRole("button", {
      name: /trigger parent setstate/i,
    });
    fireEvent.click(triggerBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");
    expect(screen.getAllByText("Renders: 2")).toHaveLength(2);
  });

  it("renders generic fallback concept simulator for unknown realm", () => {
    render(<RealmConceptVisualizer realmId="custom-unknown-realm" />);

    expect(
      screen.getByText("CUSTOM-UNKNOWN-REALM Interactive Concept Simulator")
    ).toBeDefined();
    expect(screen.getByText("Interactive Playground Ready")).toBeDefined();
  });
});
