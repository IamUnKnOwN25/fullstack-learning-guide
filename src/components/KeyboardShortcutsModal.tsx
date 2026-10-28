"use client";

import React, { useState, useEffect } from "react";
import { Keyboard, X, Search } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export interface ShortcutItem {
  category: "Global Commands" | "Matrix IDE / Quest Workspace" | "Combat & Navigation";
  label: string;
  keys: string;
}

export const SHORTCUT_CATALOG: ShortcutItem[] = [
  { category: "Global Commands", label: "Command Palette", keys: "Ctrl+K" },
  { category: "Global Commands", label: "Close Active Modal", keys: "Esc" },
  { category: "Matrix IDE / Quest Workspace", label: "Run & Verify Code", keys: "Ctrl+Enter" },
  { category: "Matrix IDE / Quest Workspace", label: "Toggle Sidebar (IDE only)", keys: "Ctrl+B" },
  { category: "Matrix IDE / Quest Workspace", label: "Insert Programmer Indent", keys: "Tab" },
  { category: "Combat & Navigation", label: "Execute Spell Strike", keys: "Shift+Enter" },
  { category: "Combat & Navigation", label: "Advance Familiar Intel", keys: "Space" },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        soundEngine.playSfx("click");
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredShortcuts = SHORTCUT_CATALOG.filter(
    (item) =>
      !normalizedQuery ||
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.keys.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery)
  );

  const categories = Array.from(new Set(filteredShortcuts.map((item) => item.category)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.playSfx("click");
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        <div className="absolute top-0 right-0 w-80 h-80 bg-matrix-neonCyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 flex items-center justify-center text-matrix-neonCyan shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="keyboard-shortcuts-title" className="text-lg font-bold text-white leading-none mb-1">
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">
                Master the terminal hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            aria-label="Close keyboard shortcuts modal"
            className="p-2 rounded-xl bg-matrix-dark/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="px-4 py-2.5 sm:px-6 border-b border-matrix-border/60 bg-matrix-dark/50 relative z-10">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-matrix-neonCyan absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hotkeys (e.g. Ctrl, Run, Modal)..."
              aria-label="Search keyboard shortcuts"
              className="w-full bg-matrix-card/80 border border-matrix-border rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-matrix-neonCyan"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSearchQuery("");
                }}
                aria-label="Clear shortcut search"
                className="absolute right-2.5 p-1 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm relative z-10">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-mono text-xs">
              No keyboard shortcuts match your search &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            categories.map((category) => (
              <div key={category}>
                <h3 className="text-matrix-neonCyan font-bold mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {filteredShortcuts
                    .filter((item) => item.category === category)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-matrix-dark/40 p-2.5 rounded-lg border border-matrix-border"
                      >
                        <span className="text-gray-300">{item.label}</span>
                        <kbd className="px-2 py-1 bg-matrix-card rounded border border-matrix-border text-gray-400 text-xs">
                          {item.keys}
                        </kbd>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-6 border-t border-matrix-border bg-matrix-dark/90 flex items-center justify-end relative z-10">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-xs font-mono font-bold text-gray-200 transition-colors cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
