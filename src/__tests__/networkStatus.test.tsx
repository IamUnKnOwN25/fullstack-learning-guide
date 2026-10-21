/**
 * @vitest-environment jsdom
 */

import { render, screen, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NetworkStatusIndicator } from "../components/NetworkStatusIndicator";
import React from "react";

describe("NetworkStatusIndicator", () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    // Save original value to restore later
    originalOnLine = window.navigator.onLine;
  });

  afterEach(() => {
    // Restore original value
    Object.defineProperty(window.navigator, "onLine", {
      value: originalOnLine,
      configurable: true,
    });
    vi.restoreAllMocks();
    cleanup();
  });

  it("should not render anything when online", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it("should render offline message when initialized offline", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByText("Network disconnected. Offline mode active.")).toBeDefined();
  });

  it("should update indicator when network goes offline and comes back online", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator />);
    expect(container.firstChild).toBeNull();

    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText("Network disconnected. Offline mode active.")).toBeDefined();

    // Trigger online event
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(container.firstChild).toBeNull();
  });
});
