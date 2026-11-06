"use client";

import React, { useState, useEffect, useRef } from "react";
import { WifiOff, RefreshCw, X, Wifi } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";

export interface NetworkStatusIndicatorProps {
  onStatusChange?: (online: boolean) => void;
  enableManualRetry?: boolean;
  showReconnectedStatus?: boolean;
  reconnectionTimeout?: number;
}

export function NetworkStatusIndicator({
  onStatusChange,
  enableManualRetry = true,
  showReconnectedStatus = true,
  reconnectionTimeout = 3000,
}: NetworkStatusIndicatorProps = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  const wasOfflineRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize state on mount to match client state
    const initialStatus = typeof navigator !== "undefined" ? navigator.onLine : true;
    setIsOnline(initialStatus);
    if (!initialStatus) {
      wasOfflineRef.current = true;
    }
    onStatusChange?.(initialStatus);

    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
      onStatusChange?.(true);

      if (wasOfflineRef.current && showReconnectedStatus) {
        setShowReconnected(true);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setShowReconnected(false);
          timerRef.current = null;
        }, reconnectionTimeout);
      }
      wasOfflineRef.current = false;
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setIsOnline(false);
      setIsDismissed(false);
      setShowReconnected(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onStatusChange?.(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [onStatusChange, showReconnectedStatus, reconnectionTimeout]);

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

  const handleDismissReconnected = () => {
    try {
      soundEngine.playSfx("click");
    } catch {
      // safe fallback
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowReconnected(false);
  };

  if (!isOnline && !isDismissed) {
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

  if (isOnline && showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="network-reconnected-indicator"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-emerald-950/90 text-emerald-200 px-4 py-3 rounded-lg shadow-lg border border-emerald-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="relative flex items-center justify-center">
          <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Connection restored. Back online.</span>
          <span className="text-xs text-emerald-300/80">Real-time sync and operative uplink re-established.</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <button
            type="button"
            onClick={handleDismissReconnected}
            title="Dismiss notification"
            aria-label="Dismiss online notification"
            className="p-1 rounded text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/60 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
