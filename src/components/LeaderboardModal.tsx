"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore, AVATAR_OPTIONS } from "@/lib/authStore";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import { TOP_OPERATIVES, LeaderboardEntry } from "@/data/leaderboard";
import {
  X,
  Trophy,
  Crown,
  Search,
  Star,
  Sword,
  BookOpen,
  Sparkles,
  Zap,
  ArrowUp,
  Shield,
  Lock,
  LogIn,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
  onOpenAuthModal?: () => void;
}

type LeaderboardTab = "xp" | "stars" | "bosses" | "curriculum";

export function LeaderboardModal({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenAuthModal,
}: Props) {
  const { currentUser, isAuthenticated } = useAuthStore();
  const {
    xp,
    level,
    rankTitle,
    stars,
    completedBosses,
    completedCurriculumTasks = [],
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<LeaderboardTab>("xp");
  const [searchQuery, setSearchQuery] = useState("");

  const totalStars = Object.values(stars || {}).reduce((sum, s) => sum + s, 0);
  const avatar =
    AVATAR_OPTIONS.find((a) => a.id === currentUser?.avatarId) || AVATAR_OPTIONS[0];

  // Synthesize player entry into the leaderboard pool
  const playerEntry: Omit<LeaderboardEntry, "rank"> = useMemo(
    () => ({
      id: "current-player",
      username: currentUser?.username || "guest_cadet",
      displayName: currentUser?.displayName || "Guest Operative",
      avatarEmoji: avatar.emoji,
      avatarBg: avatar.bgGradient,
      avatarBorder: avatar.borderColor,
      title: rankTitle,
      level,
      xp,
      stars: totalStars,
      bossesSlain: completedBosses.length,
      curriculumCompleted: completedCurriculumTasks.length,
      countryCode: "LIVE",
      badge: currentUser?.title || "Matrix Cadet",
      isCurrentUser: true,
    }),
    [
      currentUser?.username,
      currentUser?.displayName,
      currentUser?.title,
      avatar.emoji,
      avatar.bgGradient,
      avatar.borderColor,
      rankTitle,
      level,
      xp,
      totalStars,
      completedBosses.length,
      completedCurriculumTasks.length,
    ]
  );

  // Sort and rank operatives based on selected category
  const sortedEntries: LeaderboardEntry[] = useMemo(() => {
    const pool = [...TOP_OPERATIVES, playerEntry];

    pool.sort((a, b) => {
      if (activeTab === "xp") return b.xp - a.xp;
      if (activeTab === "stars") return b.stars - a.stars;
      if (activeTab === "bosses") return b.bossesSlain - a.bossesSlain;
      if (activeTab === "curriculum") return b.curriculumCompleted - a.curriculumCompleted;
      return 0;
    });

    return pool.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }, [activeTab, playerEntry]);

  if (!isOpen) return null;

  const playerRank = sortedEntries.find((e) => e.isCurrentUser)?.rank || 1;

  const filteredEntries = sortedEntries.filter(
    (e) =>
      e.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        {/* Glow ambient background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-matrix-neonGold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonGold/20 border border-matrix-neonGold/40 flex items-center justify-center text-matrix-neonGold shrink-0">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Matrix Global Leaderboards</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-matrix-neonGold/15 border border-matrix-neonGold/40 text-matrix-neonGold font-bold">
                  Live Global Sync
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Top Cyber Operatives ranked by skill, boss takedowns, and curriculum mastery
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

        {/* Tab Controls & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-matrix-border bg-matrix-dark/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setActiveTab("xp");
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "xp"
                  ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                  : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Global Power (XP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setActiveTab("stars");
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "stars"
                  ? "bg-yellow-400/20 border-yellow-400 text-yellow-400 font-bold shadow-sm"
                  : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Quest Stars</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setActiveTab("bosses");
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "bosses"
                  ? "bg-matrix-accent/20 border-matrix-accent text-matrix-accent font-bold shadow-sm"
                  : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              <Sword className="w-3.5 h-3.5" />
              <span>Boss Rush</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setActiveTab("curriculum");
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "curriculum"
                  ? "bg-matrix-neonCyan/20 border-matrix-neonCyan text-matrix-neonCyan font-bold shadow-sm"
                  : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum</span>
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search operative..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 rounded-xl bg-matrix-dark border border-matrix-border text-white text-xs outline-none focus:border-matrix-neonGold"
            />
          </div>
        </div>

        {/* Classified Intelligence Notice for Guests */}
        {!isAuthenticated && (
          <div className="mx-3 sm:mx-5 mt-3 p-3.5 rounded-2xl bg-matrix-card/90 border border-matrix-neonGold/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg shadow-matrix-neonGold/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-matrix-neonGold/15 border border-matrix-neonGold/30 flex items-center justify-center text-matrix-neonGold shrink-0">
                <Lock className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                  Operative Telemetry Restricted
                </h4>
                <p className="text-[11px] text-gray-400">
                  Detailed matrix telemetry and player rankings are restricted in guest mode. Sign in to view full standings.
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
                <span>Sign In to Rank</span>
              </button>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2 flex-1">
          {filteredEntries.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;
            const isYou = entry.isCurrentUser;
            const isClassified = !isAuthenticated && !isYou && entry.rank > 3;

            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isYou
                    ? "bg-matrix-accent/10 border-matrix-accent shadow-md shadow-matrix-accent/15 ring-1 ring-matrix-accent/50"
                    : isTop1
                    ? "bg-matrix-neonGold/10 border-matrix-neonGold shadow-md shadow-matrix-neonGold/10"
                    : isTop2
                    ? "bg-slate-300/10 border-slate-300/60"
                    : isTop3
                    ? "bg-amber-600/10 border-amber-600/50"
                    : "bg-matrix-dark/70 border-matrix-border/80 hover:border-gray-500"
                }`}
              >
                {/* Rank Insignia & Operative Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                      isTop1
                        ? "bg-matrix-neonGold text-matrix-dark shadow-sm shadow-matrix-neonGold"
                        : isTop2
                        ? "bg-slate-300 text-matrix-dark"
                        : isTop3
                        ? "bg-amber-600 text-white"
                        : isYou
                        ? "bg-matrix-accent text-matrix-dark font-extrabold"
                        : "bg-matrix-card border border-matrix-border text-gray-400"
                    }`}
                  >
                    {isTop1 ? "1" : isTop2 ? "2" : isTop3 ? "3" : `#${entry.rank}`}
                  </div>

                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 ${entry.avatarBorder} bg-gradient-to-br ${entry.avatarBg}`}
                  >
                    {isClassified ? "👤" : entry.avatarEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          isYou
                            ? "text-matrix-accent font-extrabold"
                            : isClassified
                            ? "text-gray-400"
                            : "text-white"
                        }`}
                      >
                        {isClassified ? "Classified Operative" : entry.displayName}
                      </span>
                      {isYou && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-matrix-accent text-matrix-dark font-bold">
                          YOU
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 hidden sm:inline truncate">
                        {isClassified ? "@restricted" : `@${entry.username}`}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 flex items-center gap-2 truncate">
                      <span className="text-matrix-neonGold">
                        {isClassified ? "Classified Rank" : entry.title}
                      </span>
                      <span>•</span>
                      <span>{isClassified ? "Level **" : `Level ${entry.level}`}</span>
                    </div>
                  </div>
                </div>

                {/* Score Column */}
                <div className="shrink-0 text-right font-mono">
                  {isClassified ? (
                    <div className="text-xs font-bold text-gray-500 flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3 text-matrix-neonGold" />
                      <span>CLASSIFIED</span>
                    </div>
                  ) : activeTab === "xp" ? (
                    <div>
                      <div className="text-xs font-bold text-matrix-neonCyan">
                        {entry.xp.toLocaleString()} XP
                      </div>
                      <div className="text-[10px] text-gray-400">Level {entry.level}</div>
                    </div>
                  ) : activeTab === "stars" ? (
                    <div>
                      <div className="text-xs font-bold text-yellow-400 flex items-center justify-end gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span>{entry.stars} ★</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Perfect Clears</div>
                    </div>
                  ) : activeTab === "bosses" ? (
                    <div>
                      <div className="text-xs font-bold text-matrix-accent flex items-center justify-end gap-1">
                        <Sword className="w-3.5 h-3.5" />
                        <span>{entry.bossesSlain} / 12</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Boss Trophies</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-matrix-neonCyan">
                        {entry.curriculumCompleted} Tasks
                      </div>
                      <div className="text-[10px] text-gray-400">Vault Checked</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Player Placement Bar */}
        <div className="p-3.5 sm:p-4 border-t border-matrix-border bg-matrix-dark/95 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-matrix-dark border border-matrix-border flex items-center justify-center text-gray-500 font-bold">
                <Lock className="w-3.5 h-3.5 text-matrix-neonGold" />
              </div>
              <div>
                <span className="text-gray-400">Status: </span>
                <strong className="text-matrix-neonGold font-bold">
                  Guest Operative (Unranked)
                </strong>
                <span className="text-[10px] text-gray-500 block">
                  Authenticate terminal to record your score globally
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-matrix-accent/20 border border-matrix-accent flex items-center justify-center text-matrix-accent font-bold">
                #{playerRank}
              </div>
              <div>
                <span className="text-gray-300">Your Current Placement: </span>
                <strong className="text-matrix-accent font-bold">
                  Rank #{playerRank} of {sortedEntries.length}
                </strong>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isAuthenticated && onOpenAuthModal ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3 py-1.5 rounded-lg bg-matrix-neonGold text-matrix-dark font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Rank</span>
              </button>
            ) : onOpenProfile ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenProfile();
                }}
                className="px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Operator Profile</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
