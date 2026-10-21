"use client";

import React from "react";
import { Keyboard, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        <div className="absolute top-0 right-0 w-80 h-80 bg-matrix-neonCyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 flex items-center justify-center text-matrix-neonCyan shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none mb-1">
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">
                Master the terminal hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-matrix-dark/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm relative z-10">
          <div>
            <h3 className="text-matrix-neonCyan font-bold mb-3">
              Global Commands
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-matrix-dark/40 p-2 rounded-lg border border-matrix-border">
                <span className="text-gray-300">Command Palette</span>
                <kbd className="px-2 py-1 bg-matrix-card rounded border border-matrix-border text-gray-400 text-xs">Ctrl+K</kbd>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-matrix-neonCyan font-bold mb-3">
              Matrix IDE / Quest Workspace
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-matrix-dark/40 p-2 rounded-lg border border-matrix-border">
                <span className="text-gray-300">Run & Verify Code</span>
                <kbd className="px-2 py-1 bg-matrix-card rounded border border-matrix-border text-gray-400 text-xs">Ctrl+Enter</kbd>
              </div>
              <div className="flex justify-between items-center bg-matrix-dark/40 p-2 rounded-lg border border-matrix-border">
                <span className="text-gray-300">Toggle Sidebar (IDE only)</span>
                <kbd className="px-2 py-1 bg-matrix-card rounded border border-matrix-border text-gray-400 text-xs">Ctrl+B</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
