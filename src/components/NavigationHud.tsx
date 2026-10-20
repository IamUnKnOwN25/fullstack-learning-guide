"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
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
} from "lucide-react";
import { SkillTreeModal } from "./SkillTreeModal";
import { AchievementsModal } from "./AchievementsModal";

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
  } = useGameStore();

  const isGrandmaster = unlockedSkills.includes("matrix_grandmaster");

  const [skillTreeOpen, setSkillTreeOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // Level curve: xp needed for current level vs next level
  const prevLevelXp = Math.pow(level - 1, 2) * 25;
  const nextLevelXp = Math.pow(level, 2) * 25;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((xp - prevLevelXp) / Math.max(1, nextLevelXp - prevLevelXp)) * 100)
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-matrix-border bg-matrix-dark/90 backdrop-blur-md px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
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

            <div className="hidden md:flex items-center gap-1.5 border-l border-matrix-border/80 pl-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-gray-300 hover:text-matrix-accent hover:bg-matrix-card transition-colors"
                onClick={() => {
                  soundEngine.playSfx("click");
                  if (typeof window !== "undefined" && window.location.pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-matrix-accent" />
                World Map
              </Link>
              <Link
                href="/curriculum"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-gray-300 hover:text-matrix-neonCyan hover:bg-matrix-card transition-colors"
                onClick={() => soundEngine.playSfx("click")}
              >
                <BookOpen className="w-3.5 h-3.5 text-matrix-neonCyan" />
                Curriculum Vault
              </Link>
            </div>
          </div>

          {/* Player Vitals (Level, Rank, XP Bar, HP) */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Rank & Level */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full bg-matrix-card border-2 flex items-center justify-center font-mono font-bold text-xs shadow-md transition-all ${
                  isGrandmaster
                    ? "border-matrix-neonGold text-matrix-neonGold shadow-matrix-neonGold/40 animate-pulse"
                    : "border-matrix-accent text-matrix-accent shadow-matrix-accent/20"
                }`}
              >
                L{level}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {isGrandmaster && <Crown className="w-3.5 h-3.5 text-matrix-neonGold animate-bounce" />}
                    <span
                      className={`text-xs font-bold font-mono ${
                        isGrandmaster ? "text-matrix-neonGold" : "text-matrix-accent"
                      }`}
                    >
                      {isGrandmaster ? "Full-Stack Archmage" : rankTitle}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {xp} XP
                  </span>
                </div>
                {/* XP Bar */}
                <div className="w-28 sm:w-36 h-2 rounded-full bg-matrix-border overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-matrix-accent to-matrix-neonCyan transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

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

            {/* Action Buttons: Skills & Trophies */}
            <div className="flex items-center gap-1.5 border-l border-matrix-border/80 pl-2 sm:pl-4">
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
      <SkillTreeModal isOpen={skillTreeOpen} onClose={() => setSkillTreeOpen(false)} />
      <AchievementsModal isOpen={inventoryOpen} onClose={() => setInventoryOpen(false)} />
    </>
  );
}

export { NavigationHud as HUD };
