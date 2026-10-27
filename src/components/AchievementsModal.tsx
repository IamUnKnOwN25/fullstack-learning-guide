"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "@/lib/gameStore";
import { useAuthStore } from "@/lib/authStore";
import { soundEngine } from "@/lib/soundEngine";
import {
  ACHIEVEMENTS,
  RARITY_CONFIG,
  AchievementCategory,
  getAchievementsByCategory,
  calculateAchievementProgress,
} from "@/data/achievements";
import {
  X,
  Trophy,
  Award,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Crown,
  Lock,
  Sword,
  BookOpen,
  Flame,
  Shield,
  Gift,
  LogIn,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Sword: <Sword className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
};

export function AchievementsModal({
  isOpen,
  onClose,
  onOpenAuthModal,
}: Props) {
  const storeState = useGameStore();
  const { claimedAchievements = [], claimAchievement } = storeState;
  const { isAuthenticated } = useAuthStore();

  const [activeCategory, setActiveCategory] = useState<AchievementCategory | "all">("all");

  if (!isOpen) return null;

  const filteredAchievements = getAchievementsByCategory(activeCategory);
  const { unlocked: unlockedCount, percentUnlocked: progressPercent } =
    calculateAchievementProgress(storeState, claimedAchievements);

  const handleClaim = (achievementId: string, xpReward: number) => {
    const ok = claimAchievement(achievementId, xpReward);
    if (ok) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#ffcc00", "#00ff88", "#00d8ff"],
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-matrix-neonGold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonGold/20 border border-matrix-neonGold/40 flex items-center justify-center text-matrix-neonGold shrink-0">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Trophy Room & Achievements</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-matrix-neonGold/15 border border-matrix-neonGold/40 text-matrix-neonGold font-bold">
                  {unlockedCount} / {ACHIEVEMENTS.length} Cleared
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Unlock honors, defeat boss guardians, and claim bonus EXP rewards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-matrix-border/50 transition-colors shrink-0"
            type="button" aria-label="Close achievements modal" title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Completion Bar */}
        <div className="px-5 py-3 border-b border-matrix-border bg-matrix-dark/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <span className="text-gray-300 font-bold shrink-0">
              Odyssey Completion:
            </span>
            <div className="flex-1 max-w-xs h-2.5 rounded-full bg-matrix-dark border border-matrix-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-matrix-accent via-matrix-neonCyan to-matrix-neonGold transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-matrix-neonGold font-bold shrink-0">
              {progressPercent}%
            </span>
          </div>

          <div className="text-gray-400 text-[11px]">
            Claimed Honors:{" "}
            <span className="text-matrix-neonCyan font-bold">
              {claimedAchievements.length} / {unlockedCount}
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-matrix-border bg-matrix-dark/40 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setActiveCategory("all");
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "all"
                ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All ({ACHIEVEMENTS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setActiveCategory("bosses");
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "bosses"
                ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
            }`}
          >
            <Sword className="w-3.5 h-3.5 text-matrix-accent" />
            <span>Boss Guardians</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setActiveCategory("quests");
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "quests"
                ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span>Coding Trials</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setActiveCategory("scholar");
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "scholar"
                ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-matrix-neonCyan" />
            <span>Vault & Scholar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setActiveCategory("mastery");
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "mastery"
                ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-matrix-neonPurple" />
            <span>Matrix Mastery</span>
          </button>
        </div>

        {/* Classified Honors Banner for Guests */}
        {!isAuthenticated && (
          <div className="mx-3 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-matrix-card/90 border border-matrix-neonGold/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg shadow-matrix-neonGold/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-matrix-neonGold/15 border border-matrix-neonGold/30 flex items-center justify-center text-matrix-neonGold shrink-0">
                <Lock className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                  Trophy Room Honors Restricted
                </h4>
                <p className="text-[11px] text-gray-400">
                  Rare honor telemetry and bonus EXP claims are restricted in guest mode. Sign in to reveal requirements and claim honors.
                </p>
              </div>
            </div>
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-matrix-neonGold text-matrix-dark font-bold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-md shadow-matrix-neonGold/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Claim</span>
              </button>
            )}
          </div>
        )}

        {/* Achievements Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredAchievements.map((ach) => {
              const status = ach.checkProgress(storeState);
              const isClaimed = claimedAchievements.includes(ach.id);
              const rarity = RARITY_CONFIG[ach.rarity];
              const pct = Math.min(100, Math.round((status.current / status.target) * 100));
              const isClassified = !isAuthenticated && ach.rarity !== "common";

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    status.isUnlocked
                      ? "bg-matrix-dark/80 border-matrix-border hover:border-matrix-neonGold/50 shadow-sm"
                      : "bg-matrix-dark/40 border-matrix-border/40 opacity-60"
                  }`}
                >
                  <div>
                    {/* Header: Icon, Title & Rarity */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                            status.isUnlocked && !isClassified
                              ? `${rarity.border} ${rarity.bg} ${rarity.color} shadow-sm`
                              : "border-matrix-border bg-matrix-dark text-gray-600"
                          }`}
                        >
                          {status.isUnlocked && !isClassified ? (
                            ICON_MAP[ach.icon] || <Trophy className="w-5 h-5" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-xs text-white">
                              {ach.name}
                            </h3>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${rarity.color}`}
                          >
                            {rarity.label} Honor
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-matrix-neonCyan bg-matrix-neonCyan/10 px-2 py-0.5 rounded-full border border-matrix-neonCyan/30 font-bold shrink-0">
                        +{ach.xpReward} XP
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {isClassified
                        ? "[CLASSIFIED HONOR // Login to reveal requirements]"
                        : ach.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1">
                      {isClassified ? (
                        <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1 py-1">
                          <Lock className="w-3 h-3 text-matrix-neonGold" />
                          <span>REQUIREMENTS CLASSIFIED</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span>Progress</span>
                            <span>
                              {status.current} / {status.target} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-matrix-dark border border-matrix-border/60 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                status.isUnlocked
                                  ? "bg-matrix-accent"
                                  : "bg-matrix-neonCyan/60"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Claim Button / Status Footer */}
                  <div className="pt-2 border-t border-matrix-border/50 flex items-center justify-between text-xs">
                    {status.isUnlocked ? (
                      isClaimed ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-matrix-accent" />
                          <span>Claimed</span>
                        </span>
                      ) : !isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playSfx("click");
                            onClose();
                            onOpenAuthModal?.();
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-matrix-neonGold/30 border border-matrix-neonGold hover:bg-matrix-neonGold hover:text-matrix-dark text-matrix-neonGold font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Sign In to Claim +{ach.xpReward} XP</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClaim(ach.id, ach.xpReward)}
                          className="w-full py-1.5 px-3 rounded-xl bg-matrix-neonGold hover:bg-matrix-neonGold/90 text-matrix-dark font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-matrix-neonGold/20 cursor-pointer animate-pulse"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Claim +{ach.xpReward} Bonus XP</span>
                        </button>
                      )
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span>In Progress ({status.target - status.current} remaining)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-matrix-border bg-matrix-dark/80 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
