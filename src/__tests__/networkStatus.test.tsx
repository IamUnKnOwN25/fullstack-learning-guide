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
    originalOnLine = window.navigator.onLine;
  });

  afterEach(() => {
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

  it("renders with role=alert, aria-live=assertive, and data-testid attributes", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);
    const alertEl = screen.getByRole("alert");
    expect(alertEl).toBeDefined();
    expect(alertEl.getAttribute("aria-live")).toBe("assertive");
    expect(alertEl.getAttribute("data-testid")).toBe("network-status-indicator");
    expect(alertEl.className).toContain("fixed bottom-4 right-4 z-50");
    expect(alertEl.className).toContain("bg-red-950/90");
    expect(alertEl.className).toContain("border-red-800/50");
  });

  it("cleans up event listeners upon component unmount", () => {
    const addListenerSpy = vi.spyOn(window, "addEventListener");
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<NetworkStatusIndicator />);

    expect(addListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(addListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
  });

  it("handles rapid alternating offline/online events without memory leaks or race conditions", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator />);
    expect(container.firstChild).toBeNull();

    for (let i = 0; i < 5; i++) {
      act(() => {
        window.dispatchEvent(new Event("offline"));
      });
      expect(screen.getByTestId("network-status-indicator")).toBeDefined();

      act(() => {
        window.dispatchEvent(new Event("online"));
      });
      expect(container.firstChild).toBeNull();
    }
  });

  it("notifies onStatusChange callback on mount, offline event, and online event", () => {
    const onStatusChangeMock = vi.fn();
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    render(<NetworkStatusIndicator onStatusChange={onStatusChangeMock} />);
    expect(onStatusChangeMock).toHaveBeenCalledWith(true);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(onStatusChangeMock).toHaveBeenCalledWith(false);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(onStatusChangeMock).toHaveBeenCalledWith(true);
  });

  it("allows dismissing offline alert and resets dismissal upon subsequent offline events", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);
    expect(screen.getByTestId("network-status-indicator")).toBeDefined();

    const dismissBtn = screen.getByLabelText("Dismiss offline notification");
    act(() => {
      dismissBtn.click();
    });

    expect(screen.queryByTestId("network-status-indicator")).toBeNull();

    // Triggering offline event again resets dismissal state
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByTestId("network-status-indicator")).toBeDefined();
  });

  it("handles manual retry click to refresh connection status", () => {
    const onStatusChangeMock = vi.fn();
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator onStatusChange={onStatusChangeMock} />);
    expect(screen.getByTestId("network-status-indicator")).toBeDefined();

    // Simulate link restored before clicking retry
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const retryBtn = screen.getByLabelText("Check connection");
    act(() => {
      retryBtn.click();
    });

    // Connection now re-evaluated as online
    expect(screen.queryByTestId("network-status-indicator")).toBeNull();
    expect(onStatusChangeMock).toHaveBeenCalledWith(true);
  });

  it("hides manual retry button when enableManualRetry is false", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator enableManualRetry={false} />);
    expect(screen.getByTestId("network-status-indicator")).toBeDefined();
    expect(screen.queryByLabelText("Check connection")).toBeNull();
  });
});
