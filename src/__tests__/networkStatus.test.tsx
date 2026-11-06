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
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
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

    // Polite reconnection banner is shown
    expect(screen.getByText("Connection restored. Back online.")).toBeDefined();
    expect(screen.getByRole("status")).toBeDefined();

    // Auto-dismisses after 3000ms timeout
    act(() => {
      vi.advanceTimersByTime(3000);
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
        vi.advanceTimersByTime(3000);
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

  it("displays transient polite reconnection banner with role='status' and aria-live='polite' after offline to online transition", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);

    // Go offline first
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.queryByRole("status")).toBeNull();

    // Come back online
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    // Assertive alert is gone; polite status announcement is visible
    expect(screen.queryByRole("alert")).toBeNull();
    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeDefined();
    expect(statusEl.getAttribute("aria-live")).toBe("polite");
    expect(statusEl.getAttribute("data-testid")).toBe("network-reconnected-indicator");
    expect(statusEl.textContent).toContain("Connection restored. Back online.");
    expect(statusEl.className).toContain("bg-emerald-950/90");
    expect(statusEl.className).toContain("border-emerald-800/50");
  });

  it("auto-dismisses the polite reconnection status banner after 3000ms timeout", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByRole("status")).toBeDefined();

    // Advance 2999ms -> still displayed
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.getByRole("status")).toBeDefined();

    // Advance remaining 1ms (total 3000ms) -> auto-dismissed
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it("cleans up reconnection banner and pending timer when offline event fires before timeout", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByRole("status")).toBeDefined();

    // Offline event fires again before 3000ms timeout
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    // Reconnection banner should immediately disappear, replaced by offline alert
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Network disconnected. Offline mode active.")).toBeDefined();

    // Advancing timers should not dismiss the offline alert
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("cleans up reconnection timer upon component unmount", () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { unmount } = render(<NetworkStatusIndicator />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByRole("status")).toBeDefined();

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("allows manually dismissing reconnection banner before timeout", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByRole("status")).toBeDefined();

    const dismissBtn = screen.getByLabelText("Dismiss online notification");
    act(() => {
      dismissBtn.click();
    });

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("does not display reconnection banner on initial online mount", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("supports custom reconnectionTimeout prop", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator reconnectionTimeout={1500} />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByRole("status")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(screen.getByRole("status")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.firstChild).toBeNull();
  });

  it("respects showReconnectedStatus=false to disable polite reconnection announcement", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator showReconnectedStatus={false} />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("alert")).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    // Should immediately return null without showing status banner
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
