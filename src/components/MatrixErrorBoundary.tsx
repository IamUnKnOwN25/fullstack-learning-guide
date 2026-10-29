"use client";

import React, { ErrorInfo } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, TerminalSquare, Copy, Check } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";

export interface MatrixErrorBoundaryProps {
  children?: React.ReactNode;
  subsystemName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class MatrixErrorBoundary extends React.Component<MatrixErrorBoundaryProps, State> {
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: MatrixErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, copied: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and invoke optional external handler
    console.error("MatrixErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
  }

  handleReset = () => {
    try {
      soundEngine.playSfx("click");
    } catch {
      // safe fallback
    }
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
    this.setState({ hasError: false, error: null, copied: false });
    this.props.onReset?.();
  };

  handleCopyLog = async () => {
    try {
      soundEngine.playSfx("click");
    } catch {
      // safe fallback
    }
    const logDetails = [
      `[DEVQUEST SYSTEM FAILURE REPORT]`,
      `Subsystem: ${this.props.subsystemName || "Subsystem Matrix"}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error: ${this.state.error?.name || "Error"}: ${this.state.error?.message || "Unknown"}`,
      `Stack Trace:`,
      this.state.error?.stack || "(no stack trace available)",
    ].join("\n");

    let copiedSuccessfully = false;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(logDetails);
        copiedSuccessfully = true;
      }
    } catch {
      // Safe fallback if clipboard API is rejected or unpermitted
    }

    if (!copiedSuccessfully && typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = logDetails;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copiedSuccessfully = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {
        // Fallback also failed or not supported in environment
      }
    }

    if (copiedSuccessfully) {
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      this.setState({ copied: true });
      this.copyTimeout = setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error || new Error("Unknown Error"), this.handleReset);
        }
        return this.props.fallback;
      }

      // Cyber-themed fallback UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center bg-matrix-dark bg-cyber-grid p-6"
        >
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/50 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.2)] overflow-hidden">
            <div className="bg-red-500/10 border-b border-red-500/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-mono font-bold text-red-400 tracking-tight">
                    SYSTEM FAILURE DETECTED
                  </h2>
                  {this.props.subsystemName && (
                    <span className="text-xs font-mono text-red-300/80">
                      Subsystem: {this.props.subsystemName}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={this.handleCopyLog}
                title="Copy Crash Diagnostics"
                aria-label={this.state.copied ? "Copied!" : "Copy Error Details"}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>Copy Error Details</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-slate-300 font-mono text-sm">
                  A critical exception has occurred in the current subsystem matrix.
                </p>
                <div
                  role="region"
                  aria-label="Error details"
                  className="bg-black/50 p-4 rounded border border-red-500/20 font-mono text-xs text-red-300 overflow-x-auto max-h-48 whitespace-pre-wrap"
                >
                  {this.state.error?.stack || this.state.error?.toString() || "Unknown Fatal Exception"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded text-red-400 font-mono text-sm font-bold transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  REBOOT SUBSYSTEM
                </button>

                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 font-mono text-sm font-bold transition-all"
                >
                  <TerminalSquare className="w-4 h-4" />
                  RETURN TO MATRIX NEXUS
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
