"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Initialize state on mount to match client state
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="network-status-indicator"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-red-950/90 text-red-200 px-4 py-3 rounded-lg shadow-lg border border-red-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
    >
      <WifiOff className="w-5 h-5 text-red-400" />
      <span className="text-sm font-medium">Network disconnected. Offline mode active.</span>
    </div>
  );
}
