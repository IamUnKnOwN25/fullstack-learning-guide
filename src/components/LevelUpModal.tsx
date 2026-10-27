"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import {
  Sparkles,
  Shield,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle2,
  Crown,
  Flame,
  X,
  Compass,
} from "lucide-react";

interface Props {
  onOpenSkillTree?: () => void;
  onOpenLevelJourney?: () => void;
}

export function LevelUpModal({ onOpenSkillTree, onOpenLevelJourney }: Props) {
  const { pendingLevelUp, dismissLevelUp, streak } = useGameStore();

  useEffect(() => {
    if (pendingLevelUp) {
      soundEngine.playSfx("level-up");

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00ff88", "#00d8ff", "#ffcc00", "#b026ff"],
        });
      } catch {}
    }
  }, [pendingLevelUp]);

  useEffect(() => {
    if (!pendingLevelUp) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        soundEngine.playSfx("click");
        dismissLevelUp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingLevelUp, dismissLevelUp]);

  if (!pendingLevelUp) return null;

  const {
    previousLevel,
    newLevel,
    newRankTitle,
    isNewRank,
    unlockedSkillPoints,
    maxHp,
    maxMana,
  } = pendingLevelUp;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Up Ascension"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.playSfx("click");
          dismissLevelUp();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md bg-matrix-card border-2 border-matrix-neonGold/60 rounded-3xl shadow-2xl shadow-matrix-neonGold/20 overflow-hidden flex flex-col animate-slideUp">
        {/* Glow ambient background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-matrix-neonGold/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          aria-label="Dismiss level up modal"
          onClick={() => {
            soundEngine.playSfx("click");
            dismissLevelUp();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-matrix-dark/80 transition-colors z-10 cursor-pointer"
          title="Dismiss (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-8 pb-4 px-6 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-matrix-neonGold/20 border-2 border-matrix-neonGold shadow-lg shadow-matrix-neonGold/30 text-matrix-neonGold mb-3.5 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-widest text-matrix-neonGold font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cybernetic Ascension</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Level Up!
          </h2>

          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-sm font-mono text-gray-400 line-through">
              Level {previousLevel}
            </span>
            <ArrowRight className="w-4 h-4 text-matrix-neonGold" />
            <span className="text-lg font-mono font-bold text-matrix-neonGold px-3 py-0.5 rounded-full bg-matrix-neonGold/10 border border-matrix-neonGold/40 shadow-sm">
              Level {newLevel}
            </span>
          </div>
        </div>

        {/* Rank Promotion Banner if rank changed */}
        {isNewRank && (
          <div className="mx-6 mb-4 p-3 rounded-2xl bg-gradient-to-r from-matrix-neonGold/20 via-matrix-accent/15 to-matrix-neonCyan/20 border border-matrix-neonGold/40 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonGold/20 border border-matrix-neonGold flex items-center justify-center text-matrix-neonGold shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase font-bold text-matrix-neonGold tracking-wider">
                Rank Promotion Unlocked
              </div>
              <div className="text-sm font-bold text-white truncate">
                {newRankTitle}
              </div>
            </div>
          </div>
        )}

        {/* Rewards & Stat Bonuses Grid */}
        <div className="px-6 py-2 space-y-2.5">
          <div className="text-[11px] font-mono uppercase font-bold text-gray-400 tracking-wider">
            Upgrades & Perks Acquired:
          </div>

          <div className="p-3 rounded-xl bg-matrix-dark/80 border border-matrix-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-matrix-neonPurple/20 border border-matrix-neonPurple/40 flex items-center justify-center text-matrix-neonPurple">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Skill Point</div>
                <div className="text-[10px] text-gray-400">
                  Spend in Cybernetic Skill Tree
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-matrix-neonPurple bg-matrix-neonPurple/10 px-2 py-0.5 rounded border border-matrix-neonPurple/30">
              +{unlockedSkillPoints} Point{unlockedSkillPoints > 1 ? "s" : ""}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-matrix-dark/80 border border-matrix-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-matrix-neonRed/20 border border-matrix-neonRed/40 flex items-center justify-center text-matrix-neonRed">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Maximum Health</div>
                <div className="text-[10px] text-matrix-accent">
                  HP fully restored to 100%
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-matrix-neonRed bg-matrix-neonRed/10 px-2 py-0.5 rounded border border-matrix-neonRed/30">
              {maxHp} HP (+10)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-matrix-dark/80 border border-matrix-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 flex items-center justify-center text-matrix-neonCyan">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Maximum Mana</div>
                <div className="text-[10px] text-matrix-neonCyan">
                  Energy fully replenished
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-matrix-neonCyan bg-matrix-neonCyan/10 px-2 py-0.5 rounded border border-matrix-neonCyan/30">
              {maxMana} MP (+5)
            </span>
          </div>

          {streak > 1 && (
            <div className="p-2.5 rounded-xl bg-matrix-neonGold/10 border border-matrix-neonGold/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-matrix-neonGold">
                <Flame className="w-4 h-4 fill-matrix-neonGold" />
                <span className="font-bold">{streak}-Day Study Streak Active</span>
              </div>
              <span className="text-[11px] text-gray-300">
                +{Math.min(30, (streak - 1) * 5)}% Bonus XP
              </span>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-6 pt-4 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {onOpenSkillTree && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  dismissLevelUp();
                  onOpenSkillTree();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-matrix-neonPurple hover:bg-matrix-neonPurple/90 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-matrix-neonPurple/30 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Unlock Skill Perks</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                dismissLevelUp();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-matrix-accent hover:bg-matrix-accent/90 text-matrix-dark font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-matrix-accent/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Continue Journey</span>
            </button>
          </div>

          {onOpenLevelJourney && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                dismissLevelUp();
                onOpenLevelJourney();
              }}
              className="w-full py-2 px-3 rounded-xl bg-matrix-dark/60 hover:bg-matrix-dark border border-matrix-neonGold/30 hover:border-matrix-neonGold text-matrix-neonGold text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>View Rank Ladder & Level Roadmap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
