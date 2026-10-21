"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import { REALMS } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import { BOSSES } from "@/data/bosses";
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Music,
  Shield,
  Trophy,
  BookOpen,
  MapPin,
  Heart,
  Crown,
  Search,
  X,
  Swords,
  Code,
  Award,
  User,
} from "lucide-react";
import { SkillTreeModal } from "./SkillTreeModal";
import { AchievementsModal } from "./AchievementsModal";
import { LevelUpModal } from "./LevelUpModal";
import { LevelJourneyModal } from "./LevelJourneyModal";
import { ProfileModal } from "./ProfileModal";
import { AuthModal } from "./AuthModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { XpGainFloatie } from "./XpGainFloatie";
import { getLevelProgress } from "@/lib/levelSystem";
import { useAuthStore, AVATAR_OPTIONS } from "@/lib/authStore";

export function NavigationHud() {
  const {
    xp,
    level,
    hp,
    maxHp,
    streak,
    rankTitle,
    audioMuted,
    bgmActive,
    toggleAudio,
    toggleBgm,
    badges,
    unlockedSkills,
    completedQuests,
    completedBosses,
  } = useGameStore();

  const pathname = usePathname() || "/";
  const isGrandmaster = unlockedSkills.includes("matrix_grandmaster");
  const isMapActive = pathname === "/" || pathname === "/map" || pathname === "/world-map";
  const isCurriculumActive = pathname.startsWith("/curriculum");
  const isIdeActive = pathname.startsWith("/ide");

  const [skillTreeOpen, setSkillTreeOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [levelJourneyOpen, setLevelJourneyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  const { currentUser, isAuthenticated } = useAuthStore();
  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === currentUser?.avatarId) || AVATAR_OPTIONS[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        soundEngine.playSfx("click");
        setCommandOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Level curve: xp needed for current level vs next level
  const progress = getLevelProgress(xp);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-matrix-border bg-matrix-dark/90 backdrop-blur-md px-3 sm:px-5 py-2 transition-colors">
        <div className="w-full max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => soundEngine.playSfx("click")}
            >
              <div className="w-8 h-8 rounded-lg bg-matrix-accent/20 border border-matrix-accent flex items-center justify-center text-matrix-accent shadow-sm shadow-matrix-accent/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-xs tracking-wider text-matrix-neonCyan uppercase font-bold block">
                  DevQuest
                </span>
                <span className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  The Web Matrix
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 border-l border-matrix-border/80 pl-2.5 sm:pl-4">
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isMapActive
                    ? "bg-matrix-accent/15 border border-matrix-accent/50 text-matrix-accent shadow-sm shadow-matrix-accent/20"
                    : "text-gray-300 hover:text-matrix-accent hover:bg-matrix-card border border-transparent"
                }`}
                onClick={() => {
                  soundEngine.playSfx("click");
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-matrix-accent shrink-0" />
                <span className="hidden sm:inline">World Map</span>
              </Link>
              <Link
                href="/curriculum"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isCurriculumActive
                    ? "bg-matrix-neonCyan/15 border border-matrix-neonCyan/50 text-matrix-neonCyan shadow-sm shadow-matrix-neonCyan/20"
                    : "text-gray-300 hover:text-matrix-neonCyan hover:bg-matrix-card border border-transparent"
                }`}
                onClick={() => soundEngine.playSfx("click")}
              >
                <BookOpen className="w-3.5 h-3.5 text-matrix-neonCyan shrink-0" />
                <span className="hidden sm:inline">Curriculum Vault</span>
              </Link>
              <Link
                href="/ide"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap shrink-0 ${
                  isIdeActive
                    ? "bg-matrix-neonCyan text-matrix-dark border border-matrix-neonCyan shadow-md shadow-matrix-neonCyan/30"
                    : "bg-matrix-neonCyan/10 border border-matrix-neonCyan/40 text-matrix-neonCyan hover:bg-matrix-neonCyan hover:text-matrix-dark"
                }`}
                onClick={() => soundEngine.playSfx("click")}
                title="Open Full Multi-File Online Matrix IDE (VS Code Mode)"
              >
                <Code className="w-3.5 h-3.5 shrink-0" />
                <span>Matrix IDE</span>
              </Link>
            </div>
          </div>

          {/* Player Vitals (Level, Rank, XP Bar, HP) */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Operator Profile Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setProfileOpen(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-xs font-mono transition-all group cursor-pointer text-left shrink-0"
              title={`Operative Dossier: ${currentUser?.displayName || currentUser?.username || "Cadet"} (${isAuthenticated ? "Authenticated" : "Guest Mode"})`}
            >
              <div className="w-8 h-8 rounded-lg bg-matrix-dark border border-matrix-border flex items-center justify-center text-sm sm:text-base group-hover:scale-105 group-hover:border-matrix-neonCyan transition-all shrink-0">
                {currentAvatar.emoji}
              </div>
              <div className="hidden sm:block">
                <span className="block text-[11px] font-bold text-gray-200 group-hover:text-matrix-neonCyan leading-tight">
                  {currentUser?.displayName || currentUser?.username || "Cadet"}
                </span>
                <span className={`block text-[9px] font-semibold tracking-wider uppercase ${isAuthenticated ? "text-matrix-accent" : "text-matrix-neonGold animate-pulse"}`}>
                  {isAuthenticated ? "SYNCED" : "SIGN IN"}
                </span>
              </div>
            </button>

            {/* Interactive Rank & Level Trigger Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setLevelJourneyOpen(true);
              }}
              className="flex items-center gap-2 sm:gap-2.5 p-1 rounded-xl hover:bg-matrix-card/80 transition-all cursor-pointer group text-left"
              title="View Level & Rank Progression Journey"
            >
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-full bg-matrix-card border-2 flex items-center justify-center font-mono font-bold text-xs shadow-md group-hover:scale-105 transition-all ${
                    isGrandmaster
                      ? "border-matrix-neonGold text-matrix-neonGold shadow-matrix-neonGold/40 animate-pulse"
                      : "border-matrix-accent text-matrix-accent shadow-matrix-accent/20 group-hover:border-matrix-neonCyan group-hover:text-matrix-neonCyan"
                  }`}
                >
                  L{level}
                </div>
                {/* Mobile compact progress pill */}
                <div className="sm:hidden absolute -bottom-1 -right-1 px-1 rounded bg-matrix-dark border border-matrix-border text-[9px] font-mono text-matrix-accent font-bold">
                  {Math.round(progress.progressPercent)}%
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {isGrandmaster && <Crown className="w-3.5 h-3.5 text-matrix-neonGold animate-bounce" />}
                    <span
                      className={`text-xs font-bold font-mono group-hover:underline ${
                        isGrandmaster ? "text-matrix-neonGold" : "text-matrix-accent"
                      }`}
                    >
                      {isGrandmaster ? "Full-Stack Archmage" : rankTitle}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {progress.xpIntoCurrentLevel}/{progress.nextLevelTargetXp - progress.currentLevelBaseXp} XP
                  </span>
                </div>
                {/* XP Bar */}
                <div className="w-28 sm:w-36 h-2 rounded-full bg-matrix-border overflow-hidden mt-1 relative">
                  <div
                    className="h-full bg-gradient-to-r from-matrix-accent via-matrix-neonCyan to-matrix-neonGold transition-all duration-500"
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Health Bar */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-matrix-card border border-matrix-border">
              <Heart className="w-3.5 h-3.5 text-matrix-neonRed fill-matrix-neonRed animate-pulse" />
              <span className="font-mono text-xs font-bold text-gray-200">
                {hp}/{maxHp}
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-matrix-card border border-matrix-border text-matrix-neonGold">
              <Flame className="w-3.5 h-3.5 fill-matrix-neonGold" />
              <span className="font-mono text-xs font-bold">{streak}d</span>
            </div>

            {/* Action Buttons: Quick Search, Skills & Trophies */}
            <div className="hidden sm:flex items-center gap-1.5 border-l border-matrix-border/80 pl-2 sm:pl-4">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setCommandOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-matrix-neonCyan text-xs font-mono transition-all"
                title="Quick Jump & Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-matrix-neonCyan" />
                <span className="hidden lg:inline">Jump</span>
                <kbd className="hidden xl:inline-block text-[10px] px-1 rounded bg-matrix-dark border border-matrix-border text-gray-400">
                  Ctrl+K
                </kbd>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSkillTreeOpen(true);
                }}
                className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-matrix-neonPurple transition-all"
                title="Skill Tree"
              >
                <Shield className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setInventoryOpen(true);
                }}
                className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-matrix-neonGold relative transition-all"
                title="Trophies & Badges"
              >
                <Trophy className="w-4 h-4" />
                {badges.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-matrix-neonGold rounded-full ring-2 ring-matrix-dark" />
                )}
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setLeaderboardOpen(true);
                }}
                className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-matrix-neonCyan transition-all"
                title="Global Matrix Leaderboards"
              >
                <Award className="w-4 h-4" />
              </button>

              {/* Audio Controls */}
              <button
                onClick={() => {
                  toggleAudio();
                  soundEngine.playSfx("click");
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  audioMuted
                    ? "bg-matrix-card border-matrix-border text-gray-500"
                    : "bg-matrix-card hover:bg-matrix-cardHover border-matrix-accent/40 text-matrix-accent"
                }`}
                title={audioMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  toggleBgm();
                  soundEngine.playSfx("click");
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  bgmActive
                    ? "bg-matrix-neonCyan/10 border-matrix-neonCyan text-matrix-neonCyan shadow-sm shadow-matrix-neonCyan/40"
                    : "bg-matrix-card border-matrix-border text-gray-400 hover:text-gray-200"
                }`}
                title={bgmActive ? "Stop 8-bit Chiptune Music" : "Play 8-bit Chiptune Music"}
              >
                <Music className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <SkillTreeModal
        isOpen={skillTreeOpen}
        onClose={() => setSkillTreeOpen(false)}
        onOpenAuthModal={() => {
          setSkillTreeOpen(false);
          setAuthOpen(true);
        }}
      />
      <AchievementsModal
        isOpen={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        onOpenAuthModal={() => {
          setInventoryOpen(false);
          setAuthOpen(true);
        }}
      />
      <LevelJourneyModal
        isOpen={levelJourneyOpen}
        onClose={() => setLevelJourneyOpen(false)}
        onOpenSkillTree={() => {
          setLevelJourneyOpen(false);
          setSkillTreeOpen(true);
        }}
      />
      <LevelUpModal
        onOpenSkillTree={() => setSkillTreeOpen(true)}
        onOpenLevelJourney={() => setLevelJourneyOpen(true)}
      />
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onOpenAuthModal={() => {
          setProfileOpen(false);
          setAuthOpen(true);
        }}
        onOpenLeaderboard={() => {
          setProfileOpen(false);
          setLeaderboardOpen(true);
        }}
      />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="login"
      />
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        onOpenProfile={() => {
          setLeaderboardOpen(false);
          setProfileOpen(true);
        }}
        onOpenAuthModal={() => {
          setLeaderboardOpen(false);
          setAuthOpen(true);
        }}
      />

      {/* Floating XP Gain Notification */}
      <XpGainFloatie />

      {/* Global Quick-Jump Command Modal (Ctrl+K) */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-matrix-card border border-matrix-border rounded-2xl shadow-2xl overflow-hidden font-mono">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-matrix-border bg-matrix-dark">
              <Search className="w-4 h-4 text-matrix-neonCyan shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search 12 realms, 24 coding quests, 12 bosses, or curriculum guides..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 pb-1">
                <Link
                  href="/ide"
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setCommandOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-matrix-neonCyan/10 hover:bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 text-matrix-neonCyan font-bold flex items-center gap-2 transition-all"
                >
                  <Code className="w-4 h-4 shrink-0" />
                  <span>Open Matrix Studio IDE</span>
                </Link>
                <Link
                  href="/curriculum"
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setCommandOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-matrix-accent/10 hover:bg-matrix-accent/20 border border-matrix-accent/40 text-matrix-accent font-bold flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Open Curriculum Vault</span>
                </Link>
              </div>
              {REALMS.filter((r) => {
                const q = commandQuery.trim().toLowerCase();
                if (!q) return true;
                const quests = QUESTS[r.id] || [];
                const boss = BOSSES[r.id];
                return (
                  r.title.toLowerCase().includes(q) ||
                  r.realmName.toLowerCase().includes(q) ||
                  r.id.toLowerCase().includes(q) ||
                  quests.some((item) => item.title.toLowerCase().includes(q)) ||
                  (boss && boss.name.toLowerCase().includes(q))
                );
              }).map((r) => {
                const quests = QUESTS[r.id] || [];
                const boss = BOSSES[r.id];
                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {String(r.order).padStart(2, "0")}. {r.title}
                      </span>
                      <Link
                        href={`/curriculum?file=${r.fileRef}`}
                        onClick={() => {
                          soundEngine.playSfx("click");
                          setCommandOpen(false);
                        }}
                        className="text-[11px] text-matrix-neonCyan hover:underline flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        Guide
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {quests.map((q) => (
                        <Link
                          key={q.id}
                          href={`/quest/${r.id}/${q.id}`}
                          onClick={() => {
                            soundEngine.playSfx("click");
                            setCommandOpen(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                            completedQuests.includes(q.id)
                              ? "bg-matrix-accent/15 border-matrix-accent/50 text-matrix-accent"
                              : "bg-matrix-card border-matrix-border hover:border-matrix-neonCyan text-gray-200"
                          }`}
                        >
                          <Code className="w-3 h-3" />
                          <span>{q.title}</span>
                        </Link>
                      ))}

                      {boss && (
                        <Link
                          href={`/boss/${r.id}`}
                          onClick={() => {
                            soundEngine.playSfx("click");
                            setCommandOpen(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                            completedBosses.includes(r.id)
                              ? "bg-matrix-neonGold/15 border-matrix-neonGold/50 text-matrix-neonGold"
                              : "bg-red-950/30 border-matrix-neonRed/40 hover:border-matrix-neonRed text-matrix-neonRed"
                          }`}
                        >
                          <Swords className="w-3 h-3" />
                          <span>{boss.name}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (Visible only on < md screens) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-matrix-dark/95 backdrop-blur-lg border-t border-matrix-border px-2 py-1 shadow-2xl flex items-center justify-around font-mono text-[10px]"
      >
        <Link
          href="/"
          onClick={() => {
            soundEngine.playSfx("click");
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] min-h-[44px] transition-all ${
            isMapActive ? "text-matrix-accent font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span>Map</span>
        </Link>

        <Link
          href="/curriculum"
          onClick={() => soundEngine.playSfx("click")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] min-h-[44px] transition-all ${
            isCurriculumActive ? "text-matrix-neonCyan font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Vault</span>
        </Link>

        <Link
          href="/ide"
          onClick={() => soundEngine.playSfx("click")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] min-h-[44px] transition-all ${
            isIdeActive
              ? "text-matrix-neonCyan font-bold bg-matrix-neonCyan/10 rounded-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Code className="w-4 h-4 mb-0.5" />
          <span>IDE</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setSkillTreeOpen(true);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] min-h-[44px] text-gray-400 hover:text-matrix-neonPurple transition-all"
        >
          <Shield className="w-4 h-4 mb-0.5" />
          <span>Skills</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setInventoryOpen(true);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] min-h-[44px] text-gray-400 hover:text-matrix-neonGold relative transition-all"
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span>Badges</span>
          {badges.length > 0 && (
            <span className="absolute top-1 right-2.5 w-2 h-2 bg-matrix-neonGold rounded-full ring-2 ring-matrix-dark" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setLeaderboardOpen(true);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-lg min-w-[42px] min-h-[44px] text-gray-400 hover:text-matrix-neonCyan transition-all"
        >
          <Award className="w-4 h-4 mb-0.5 text-matrix-neonCyan" />
          <span>Ranks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setProfileOpen(true);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-lg min-w-[42px] min-h-[44px] text-gray-400 hover:text-matrix-accent transition-all"
        >
          <span className="text-xs mb-0.5 leading-none">{currentAvatar.emoji}</span>
          <span>{isAuthenticated ? "Profile" : "Sign In"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setCommandOpen(true);
          }}
          className="flex flex-col items-center justify-center p-1 rounded-lg min-w-[42px] min-h-[44px] text-gray-400 hover:text-white transition-all"
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>Jump</span>
        </button>
      </nav>
    </>
  );
}

export { NavigationHud as HUD };
