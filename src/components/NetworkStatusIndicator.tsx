"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, X } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";

export interface NetworkStatusIndicatorProps {
  onStatusChange?: (online: boolean) => void;
  enableManualRetry?: boolean;
}

export function NetworkStatusIndicator({
  onStatusChange,
  enableManualRetry = true,
}: NetworkStatusIndicatorProps = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Initialize state on mount to match client state
    const initialStatus = typeof navigator !== "undefined" ? navigator.onLine : true;
    setIsOnline(initialStatus);
    onStatusChange?.(initialStatus);

    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
      onStatusChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false);
      onStatusChange?.(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onStatusChange]);

  const handleRetry = () => {
    setIsChecking(true);
    try {
      soundEngine.playSfx("click");
    } catch {
      // safe fallback in environments without audio support
    }
    const currentStatus = typeof navigator !== "undefined" ? navigator.onLine : true;
    setIsOnline(currentStatus);
    setIsChecking(false);
    onStatusChange?.(currentStatus);
  };

  const handleDismiss = () => {
    try {
      soundEngine.playSfx("click");
    } catch {
      // safe fallback
    }
    setIsDismissed(true);
  };

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="network-status-indicator"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-red-950/90 text-red-200 px-4 py-3 rounded-lg shadow-lg border border-red-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Network disconnected. Offline mode active.</span>
        <span className="text-xs text-red-300/80">Local progress is cached and will sync once reconnected.</span>
      </div>
      <div className="flex items-center gap-1.5 ml-2">
        {enableManualRetry && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isChecking}
            title="Check Network Connection"
            aria-label="Check connection"
            className="p-1 rounded text-red-300 hover:text-red-100 hover:bg-red-900/60 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss notification"
          aria-label="Dismiss offline notification"
          className="p-1 rounded text-red-300 hover:text-red-100 hover:bg-red-900/60 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
