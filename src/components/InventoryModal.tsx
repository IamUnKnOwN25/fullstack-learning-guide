"use client";

import React from "react";
import { useGameStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import { X, Trophy, Award, ShieldAlert, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BADGES_CATALOG: Record<string, { name: string; description: string; icon: string }> = {
  welcome_recruit: {
    name: "Matrix Initiate",
    description: "Plugged into DevQuest and began your journey to full-stack mastery.",
    icon: "Sparkles",
  },
  slayer_of_divs: {
    name: "Semantic Warden",
    description: "Vanquished The Malformed Tag Abomination in the HTML Realm.",
    icon: "ShieldAlert",
  },
  slayer_of_hydra: {
    name: "Master of Grids & Flow",
    description: "Tamed horizontal scrollbars and vanquished The Overflow Hydra in the CSS Realm.",
    icon: "Award",
  },
  slayer_of_kraken: {
    name: "Async Spellcaster",
    description: "Banished callback hell and mastered Promises against The Callback Kraken.",
    icon: "Sparkles",
  },
  slayer_of_any: {
    name: "Discriminated Champion",
    description: "Banished type 'any' and enforced strict compile-time discriminated unions.",
    icon: "ShieldCheck",
  },
  slayer_of_rerenders: {
    name: "Master of Pure Renders",
    description: "Defeated the Infinite Re-Render Fiend using stable state dependencies.",
    icon: "Atom",
  },
  slayer_of_blocker: {
    name: "Non-Blocking Architect",
    description: "Protected Node.js single-threaded event loop from synchronous CPU stalls.",
    icon: "Server",
  },
  slayer_of_injection: {
    name: "Guardian of the Schema",
    description: "Eradicated SQL injection vulnerabilities using parameterized prepared statements.",
    icon: "Database",
  },
  slayer_of_conflict: {
    name: "DevOps Fleet Admiral",
    description: "Resolved intractable Git merge conflicts and automated container pipelines.",
    icon: "Cpu",
  },
  slayer_of_flakiness: {
    name: "TDD Purist",
    description: "Exorcised asynchronous timing race conditions with deterministic mock clocks.",
    icon: "CheckCircle",
  },
  slayer_of_goliath: {
    name: "Algorithmic Grandmaster",
    description: "Tamed factorial algorithmic complexity with dynamic programming memoization.",
    icon: "Network",
  },
  slayer_of_xss: {
    name: "Aegis Sentinel",
    description: "Secured web applications against XSS with strict Content-Security-Policy headers.",
    icon: "ShieldAlert",
  },
  master_of_the_matrix: {
    name: "Matrix Architect",
    description: "Banished The Null Void and completed the Full-Stack Web Development Capstone Odyssey.",
    icon: "Trophy",
  },
};

export function InventoryModal({ isOpen, onClose }: Props) {
  const { badges, completedQuests, completedBosses, xp, level, rankTitle, resetProgress } =
    useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-matrix-border bg-matrix-dark/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-matrix-neonGold/20 border border-matrix-neonGold/40 flex items-center justify-center text-matrix-neonGold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                Trophy Room & Badges
              </h2>
              <p className="text-xs text-gray-400">
                Your earned honors, boss trophies, and quest statistics
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-matrix-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-4 gap-2 px-6 py-3 border-b border-matrix-border bg-matrix-dark/30 text-center font-mono">
          <div>
            <div className="text-[10px] uppercase text-gray-400">Rank</div>
            <div className="text-xs font-bold text-matrix-accent truncate">{rankTitle}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Level</div>
            <div className="text-xs font-bold text-white">L{level}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Quests</div>
            <div className="text-xs font-bold text-matrix-neonCyan">{completedQuests.length}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Bosses</div>
            <div className="text-xs font-bold text-matrix-neonGold">{completedBosses.length}</div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            Earned Achievements ({badges.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(BADGES_CATALOG).map(([badgeId, badge]) => {
              const isEarned = badges.includes(badgeId);

              return (
                <div
                  key={badgeId}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isEarned
                      ? "bg-matrix-dark/80 border-matrix-neonGold/40 shadow-sm shadow-matrix-neonGold/10"
                      : "bg-matrix-dark/20 border-matrix-border opacity-50 grayscale"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isEarned
                        ? "bg-matrix-neonGold/20 text-matrix-neonGold border border-matrix-neonGold/50"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-mono text-sm font-bold text-white">{badge.name}</h4>
                      {isEarned && <CheckCircle2 className="w-3.5 h-3.5 text-matrix-accent" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Reset Progress option */}
        <div className="px-6 py-3 border-t border-matrix-border bg-matrix-dark/80 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              if (confirm("Reset all game progress? This will reset your level, quests, and XP.")) {
                resetProgress();
                soundEngine.playSfx("error");
              }
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-matrix-neonRed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Save Data
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-matrix-border hover:bg-gray-700 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
