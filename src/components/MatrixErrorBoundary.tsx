import React, { ErrorInfo } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, TerminalSquare } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MatrixErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("MatrixErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Cyber-themed fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-matrix-dark bg-cyber-grid p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/50 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.2)] overflow-hidden">
            <div className="bg-red-500/10 border-b border-red-500/50 p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-mono font-bold text-red-400 tracking-tight">
                SYSTEM FAILURE DETECTED
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-slate-300 font-mono text-sm">
                  A critical exception has occurred in the current subsystem matrix.
                </p>
                <div className="bg-black/50 p-4 rounded border border-red-500/20 font-mono text-xs text-red-300 overflow-x-auto">
                  {this.state.error?.toString() || "Unknown Fatal Exception"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
                <button
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
