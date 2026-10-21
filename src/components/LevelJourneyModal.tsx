"use client";

import React from "react";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import {
  RANKS,
  getLevelProgress,
  calculateStreakBonus,
  calculateHpForLevel,
  calculateManaForLevel,
} from "@/lib/levelSystem";
import {
  X,
  Sparkles,
  Crown,
  Flame,
  Shield,
  Heart,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Sword,
  Terminal,
  Award,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenSkillTree?: () => void;
}

export function LevelJourneyModal({ isOpen, onClose, onOpenSkillTree }: Props) {
  const {
    xp,
    level,
    rankTitle,
    streak,
    unlockedSkills,
    completedQuests,
    completedBosses,
    completedChapters = [],
  } = useGameStore();

  if (!isOpen) return null;

  const progress = getLevelProgress(xp);
  const streakBonus = calculateStreakBonus(streak);
  const maxHp = calculateHpForLevel(level);
  const maxMana = calculateManaForLevel(level);
  const availableSkillPoints = Math.max(0, level - unlockedSkills.length);
  const isGrandmaster = level >= 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-matrix-border bg-matrix-dark/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-matrix-accent/20 border border-matrix-accent/40 flex items-center justify-center text-matrix-accent shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Level & Rank Progression
              </h2>
              <p className="text-xs text-gray-400">
                Track your full-stack journey from Novice Byte to Full-Stack Grandmaster
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-matrix-border/50 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Hero Card: Current Level & XP Progress */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-matrix-dark via-matrix-card to-matrix-dark border border-matrix-border shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-matrix-accent/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-matrix-dark border-2 flex flex-col items-center justify-center font-mono font-bold shadow-md ${
                    isGrandmaster
                      ? "border-matrix-neonGold text-matrix-neonGold shadow-matrix-neonGold/30"
                      : "border-matrix-accent text-matrix-accent shadow-matrix-accent/20"
                  }`}
                >
                  <span className="text-[10px] text-gray-400 uppercase">LVL</span>
                  <span className="text-xl leading-none">{level}</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    {isGrandmaster && <Crown className="w-4 h-4 text-matrix-neonGold" />}
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {rankTitle}
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-gray-400 mt-0.5">
                    Total Career EXP:{" "}
                    <span className="text-matrix-neonCyan font-bold">
                      {xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-matrix-dark border border-matrix-border text-matrix-neonRed">
                  <Heart className="w-3.5 h-3.5 fill-matrix-neonRed" />
                  <span>{maxHp} Max HP</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-matrix-dark border border-matrix-border text-matrix-neonCyan">
                  <Zap className="w-3.5 h-3.5 fill-matrix-neonCyan" />
                  <span>{maxMana} Max MP</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-matrix-dark border border-matrix-border text-matrix-neonGold">
                  <Flame className="w-3.5 h-3.5 fill-matrix-neonGold" />
                  <span>{streak}d Streak (+{streakBonus.bonusPercent}%)</span>
                </div>
              </div>
            </div>

            {/* XP Bar to Next Level */}
            <div className="mt-5 space-y-1.5 relative z-10">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300">
                  Progress to{" "}
                  <strong className="text-matrix-neonGold">
                    Level {progress.nextLevel}
                  </strong>
                </span>
                <span className="text-matrix-neonCyan font-bold">
                  {progress.xpIntoCurrentLevel.toLocaleString()} /{" "}
                  {(progress.nextLevelTargetXp - progress.currentLevelBaseXp).toLocaleString()} XP{" "}
                  <span className="text-gray-400 text-[11px]">
                    ({progress.progressPercent.toFixed(1)}%)
                  </span>
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-matrix-dark border border-matrix-border overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-matrix-accent via-matrix-neonCyan to-matrix-neonGold transition-all duration-500 shadow-sm shadow-matrix-neonCyan/50"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Current: {progress.currentLevelBaseXp.toLocaleString()} XP</span>
                <span className="text-matrix-accent">
                  {progress.xpNeededForNextLevel.toLocaleString()} XP remaining
                </span>
                <span>Next: {progress.nextLevelTargetXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* Quick Perks & Available Points */}
          <div className="p-3.5 rounded-xl bg-matrix-dark/70 border border-matrix-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-matrix-neonPurple/20 border border-matrix-neonPurple/40 flex items-center justify-center text-matrix-neonPurple">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-gray-300">Skill Tree Points: </span>
                <span className="text-matrix-neonPurple font-bold">
                  {availableSkillPoints} Available
                </span>
              </div>
            </div>

            {onOpenSkillTree && (
              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenSkillTree();
                }}
                className="px-3 py-1 rounded-lg bg-matrix-neonPurple/20 hover:bg-matrix-neonPurple/30 border border-matrix-neonPurple/40 text-matrix-neonPurple hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Spend Skill Points</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 11-Tier Rank Ladder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase font-bold text-gray-300 tracking-wider flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-matrix-neonGold" />
                <span>Career Rank Ladder (12 Realms)</span>
              </h4>
              <span className="text-[11px] font-mono text-gray-400">
                Current: {rankTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {RANKS.map((r) => {
                const isUnlocked = level >= r.level;
                const isCurrent = rankTitle === r.title;

                return (
                  <div
                    key={r.level}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-matrix-neonGold/10 border-matrix-neonGold shadow-md shadow-matrix-neonGold/10"
                        : isUnlocked
                        ? "bg-matrix-dark/60 border-matrix-border/80 text-gray-300"
                        : "bg-matrix-dark/30 border-matrix-border/40 opacity-60 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                          isCurrent
                            ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold animate-pulse"
                            : isUnlocked
                            ? "bg-matrix-card border-matrix-border text-matrix-accent"
                            : "bg-matrix-dark border-matrix-border/50 text-gray-600"
                        }`}
                      >
                        L{r.level}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-xs truncate ${
                              isCurrent
                                ? "text-matrix-neonGold"
                                : isUnlocked
                                ? "text-white"
                                : "text-gray-400"
                            }`}
                          >
                            {r.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-matrix-card border border-matrix-border text-gray-400 hidden sm:inline">
                            {r.realmTheme}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
                          {r.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full bg-matrix-neonGold/20 border border-matrix-neonGold text-matrix-neonGold text-[10px] font-bold">
                          ACTIVE
                        </span>
                      ) : isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-matrix-accent" />
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Lock className="w-3.5 h-3.5" />
                          <span>L{r.level}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Earn More EXP Card */}
          <div className="p-4 rounded-xl bg-matrix-dark/80 border border-matrix-border space-y-2.5">
            <h4 className="text-xs font-mono uppercase font-bold text-gray-300 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-matrix-neonCyan" />
              <span>How to Earn EXP & Level Up</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-matrix-card/60 border border-matrix-border/60">
                <div className="flex items-center gap-1.5 text-white font-bold mb-0.5">
                  <Sword className="w-3.5 h-3.5 text-matrix-accent" />
                  <span>Quest Trials</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Solve 24 coding trials across 12 realms for 100 - 400 XP + speedrun bonuses.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-matrix-card/60 border border-matrix-border/60">
                <div className="flex items-center gap-1.5 text-white font-bold mb-0.5">
                  <Crown className="w-3.5 h-3.5 text-matrix-neonGold" />
                  <span>Boss Guardians</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Vanquish the 12 realm monsters for 350 - 1500 XP and realm trophy badges.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-matrix-card/60 border border-matrix-border/60">
                <div className="flex items-center gap-1.5 text-white font-bold mb-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-matrix-neonCyan" />
                  <span>Curriculum Checkpoints</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Master curriculum tasks (+10 XP) and finish chapters (+50 XP).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-matrix-card/60 border border-matrix-border/60">
                <div className="flex items-center gap-1.5 text-white font-bold mb-0.5">
                  <Terminal className="w-3.5 h-3.5 text-matrix-neonPurple" />
                  <span>Matrix IDE & Drills</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Execute code drills and answer Byte daily quizzes for quick 25 XP bursts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-matrix-border bg-matrix-dark/80 flex items-center justify-end">
          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-white font-mono text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
