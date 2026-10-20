"use client";

import React, { useState } from "react";
import { soundEngine } from "@/lib/audio";
import { useGameStore } from "@/lib/store";
import {
  Sparkles,
  X,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Compass,
  Zap,
} from "lucide-react";

const COMPANION_TIPS = [
  "Tip: In the CSS realm, switch to the Concept Visualizer tab to play with live flex-direction and justify-content!",
  "Tactical Intel: The Any-Demon boss in Realm 04 is weak to Discriminated Unions and unknown type narrowing.",
  "Did you know? JavaScript Promises drain on the Microtask Queue before setTimeout(0) macrotasks fire!",
  "A11y Wisdom: Using semantic HTML tags like <nav> and <main> lets screen-reader users navigate by landmarks.",
  "Pro Tip: Press Ctrl + Enter (or Cmd + Enter) anywhere in the editor to immediately cast your spell & verify!",
  "Docker Magic: Multi-stage builds compile artifacts in a build container, leaving the production image ultralight.",
  "Database Defense: Never concatenate user strings into raw SQL! Parameterized queries ($1, $2) neutralize injection.",
  "Skill Tree Alert: Unlocking 'Lint Barrier' gives you 1 free test failure absorption during any Boss Battle!",
  "System Design: In high-throughput distributed systems, use Token Bucket or Sliding Window algorithms for rate limits.",
];

export function CyberCompanionByte() {
  const { level, rankTitle, completedQuests, completedBosses } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [mood, setMood] = useState<"happy" | "thinking" | "wink" | "cool">("happy");

  const cycleTip = () => {
    soundEngine.playSfx("click");
    setTipIndex((prev) => (prev + 1) % COMPANION_TIPS.length);
    setMood((prev) => (prev === "happy" ? "wink" : prev === "wink" ? "thinking" : "happy"));
  };

  const getEyeExpression = () => {
    switch (mood) {
      case "wink":
        return "(^_-)";
      case "thinking":
        return "(o_O)";
      case "cool":
        return "(⌐■_■)";
      case "happy":
      default:
        return "(◕‿◕)";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-mono select-none">
      {/* Speech Bubble / Mini Dialog Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 p-4 rounded-2xl bg-matrix-card/95 backdrop-blur-md border border-matrix-accent/50 shadow-2xl shadow-black/80 space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-matrix-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-matrix-accent animate-ping" />
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-matrix-neonCyan" />
                BYTE • AI Cybernetic Familiar
              </h5>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dialogue Content */}
          <div className="text-xs text-gray-200 leading-relaxed bg-matrix-dark/80 p-3 rounded-xl border border-matrix-border/60">
            {COMPANION_TIPS[tipIndex]}
          </div>

          {/* Player Cadet Briefing */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span className="text-matrix-neonCyan">
              {rankTitle} (L{level})
            </span>
            <span>
              {completedQuests.length}/24 Quests • {completedBosses.length}/12 Bosses
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={cycleTip}
              className="flex-1 py-1.5 px-3 rounded-lg bg-matrix-accent/10 border border-matrix-accent/40 text-matrix-accent hover:bg-matrix-accent/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Another Intel Tip</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Byte Character Orb */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playSfx(isOpen ? "click" : "skill-unlock");
          setIsOpen(!isOpen);
          if (!isOpen) {
            setMood("cool");
            setTimeout(() => setMood("happy"), 2000);
          }
        }}
        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xl transition-all cursor-pointer ${
          isOpen
            ? "bg-matrix-dark border-matrix-accent text-matrix-accent shadow-matrix-accent/30"
            : "bg-matrix-card/90 hover:bg-matrix-cardHover border-matrix-neonCyan text-white shadow-matrix-neonCyan/20 hover:scale-105"
        }`}
      >
        {/* Animated Cyber Eye Glow */}
        <div className="w-7 h-7 rounded-full bg-matrix-accent/20 border border-matrix-accent flex items-center justify-center text-[10px] font-extrabold text-matrix-accent group-hover:scale-110 transition-transform">
          {getEyeExpression()}
        </div>

        <span className="text-xs font-bold tracking-tight text-white group-hover:text-matrix-neonCyan transition-colors">
          Byte
        </span>

        {!isOpen && (
          <span className="w-2 h-2 rounded-full bg-matrix-neonCyan animate-pulse" />
        )}
      </button>
    </div>
  );
}
