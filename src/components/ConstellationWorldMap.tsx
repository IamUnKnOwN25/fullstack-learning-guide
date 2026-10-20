"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Realm, REALMS } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import { BOSSES } from "@/data/bosses";
import { soundEngine } from "@/lib/soundEngine";
import {
  Lock,
  CheckCircle2,
  Swords,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Crown,
  Play,
  BookOpen,
} from "lucide-react";

interface Props {
  selectedRealm: Realm | null;
  onSelectRealm: (realm: Realm) => void;
  unlockedRealms: string[];
  completedBosses: string[];
  completedQuests: string[];
  level: number;
  highlightedRealmIds?: string[];
}

// 12-Node Map Coordinates in percent (x, y)
const NODE_COORDINATES: Record<string, { x: number; y: number; icon: string }> = {
  html: { x: 12, y: 16, icon: "01" },
  css: { x: 36, y: 12, icon: "02" },
  javascript: { x: 60, y: 16, icon: "03" },
  typescript: { x: 85, y: 14, icon: "04" },
  react: { x: 88, y: 44, icon: "05" },
  backend: { x: 64, y: 48, icon: "06" },
  databases: { x: 40, y: 44, icon: "07" },
  devops: { x: 15, y: 46, icon: "08" },
  testing: { x: 12, y: 72, icon: "09" },
  cs: { x: 36, y: 74, icon: "10" },
  security: { x: 62, y: 71, icon: "11" },
  capstone: { x: 86, y: 73, icon: "12" },
};

const CONDUIT_PATHS = [
  { from: "html", to: "css" },
  { from: "css", to: "javascript" },
  { from: "javascript", to: "typescript" },
  { from: "typescript", to: "react" },
  { from: "react", to: "backend" },
  { from: "backend", to: "databases" },
  { from: "databases", to: "devops" },
  { from: "devops", to: "testing" },
  { from: "testing", to: "cs" },
  { from: "cs", to: "security" },
  { from: "security", to: "capstone" },
];

export function ConstellationWorldMap({
  selectedRealm,
  onSelectRealm,
  unlockedRealms,
  completedBosses,
  completedQuests,
  level,
  highlightedRealmIds,
}: Props) {
  const router = useRouter();

  const handleLaunchRealm = (realm: Realm) => {
    const rQuests = QUESTS[realm.id] || [];
    const nextQuest = rQuests.find((q) => !completedQuests.includes(q.id)) || rQuests[0];
    if (nextQuest) {
      router.push(`/quest/${realm.id}/${nextQuest.id}`);
    } else if (BOSSES[realm.id]) {
      router.push(`/boss/${realm.id}`);
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[500px] lg:h-[calc(100vh-17rem)] max-h-[820px] rounded-2xl bg-matrix-dark border border-matrix-border overflow-hidden shadow-2xl p-4 sm:p-6 select-none">
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1f2e4d 1px, transparent 1px), linear-gradient(to bottom, #1f2e4d 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-matrix-neonCyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Conduits & Pathways (Synchronized 800x500 coordinate system) */}
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <linearGradient id="activeConduit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="50%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="inactiveConduit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1f2e4d" />
            <stop offset="100%" stopColor="#0b1120" />
          </linearGradient>
        </defs>

        {CONDUIT_PATHS.map(({ from, to }, idx) => {
          const start = NODE_COORDINATES[from];
          const end = NODE_COORDINATES[to];
          if (!start || !end) return null;

          const isPathUnlocked =
            completedBosses.includes(from) ||
            unlockedRealms.includes(to);

          const x1 = start.x * 8;
          const y1 = start.y * 5;
          const x2 = end.x * 8;
          const y2 = end.y * 5;

          return (
            <g key={idx}>
              {/* Conduit Glow */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isPathUnlocked ? "url(#activeConduit)" : "#1e293b"}
                strokeWidth={isPathUnlocked ? "3" : "1.5"}
                strokeDasharray={isPathUnlocked ? "none" : "6 4"}
                strokeLinecap="round"
                className={isPathUnlocked ? "drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" : "opacity-40"}
              />
              {/* Flowing pulse on active conduits */}
              {isPathUnlocked && (
                <circle r="3.5" fill="#00e5ff" className="animate-pulse">
                  <animateMotion
                    path={`M ${x1} ${y1} L ${x2} ${y2}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Realm Nodes */}
      {REALMS.map((realm) => {
        const coords = NODE_COORDINATES[realm.id];
        if (!coords) return null;

        const isUnlocked = unlockedRealms.includes(realm.id) || level >= realm.requiredLevel;
        const isBossDefeated = completedBosses.includes(realm.id);
        const isSelected = selectedRealm?.id === realm.id;
        const realmQuests = QUESTS[realm.id] || [];
        const finishedQuests = realmQuests.filter((q) => completedQuests.includes(q.id)).length;

        // Frontier node: unlocked but boss not defeated yet
        const isFrontier = isUnlocked && !isBossDefeated;
        const isFilterMatch =
          !highlightedRealmIds || highlightedRealmIds.includes(realm.id);

        return (
          <div
            key={realm.id}
            role="button"
            tabIndex={0}
            title={`${realm.title} — Click to inspect, Double-click to launch trial`}
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => {
              soundEngine.playSfx("click");
              onSelectRealm(realm);
            }}
            onDoubleClick={() => {
              soundEngine.playSfx("attack");
              handleLaunchRealm(realm);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                soundEngine.playSfx("click");
                onSelectRealm(realm);
              }
            }}
            className={`absolute z-10 flex flex-col items-center group cursor-pointer transition-all outline-none ${
              isSelected ? "scale-125 z-20" : "hover:scale-115"
            } ${isFilterMatch ? "opacity-100" : "opacity-25 scale-90"}`}
          >
            {/* Frontier Ping Halo */}
            {isFrontier && (
              <span className="absolute -inset-2 rounded-full border border-matrix-neonGold/80 animate-ping pointer-events-none" />
            )}

            {/* Selected Focus Ring */}
            {isSelected && (
              <span className="absolute -inset-3 rounded-full border-2 border-matrix-neonCyan animate-spin pointer-events-none" style={{ animationDuration: "8s" }} />
            )}

            {/* Node Circle */}
            <div
              className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-xs shadow-xl transition-all ${
                isBossDefeated
                  ? "bg-gradient-to-br from-matrix-accent/30 to-matrix-dark border-2 border-matrix-accent text-matrix-accent shadow-matrix-accent/30"
                  : isUnlocked
                  ? "bg-gradient-to-br from-matrix-neonGold/20 to-matrix-dark border-2 border-matrix-neonGold text-matrix-neonGold shadow-matrix-neonGold/30"
                  : "bg-matrix-card/80 border border-gray-700 text-gray-500 opacity-60"
              }`}
            >
              {realm.id === "capstone" ? (
                <Crown className={`w-6 h-6 ${isBossDefeated ? "text-matrix-neonGold animate-bounce" : ""}`} />
              ) : isBossDefeated ? (
                <CheckCircle2 className="w-6 h-6 text-matrix-accent" />
              ) : isUnlocked ? (
                <span>{coords.icon}</span>
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}

              {/* Mini Status Badge */}
              {isBossDefeated && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-matrix-neonGold border border-black flex items-center justify-center text-[9px] text-black font-bold">
                  ★
                </span>
              )}
            </div>

            {/* Realm Node Label Pill */}
            <div
              className={`mt-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] whitespace-nowrap shadow-md transition-all ${
                isSelected
                  ? "bg-matrix-neonCyan text-matrix-dark font-extrabold"
                  : isBossDefeated
                  ? "bg-matrix-dark/90 border border-matrix-accent/50 text-matrix-accent font-bold"
                  : isUnlocked
                  ? "bg-matrix-dark/90 border border-matrix-border text-gray-200"
                  : "bg-matrix-dark/80 text-gray-500"
              }`}
            >
              {realm.realmName}
            </div>

            {/* Quick Quest Pill */}
            {isUnlocked && (
              <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                {finishedQuests}/{realmQuests.length} Quests
              </div>
            )}
          </div>
        );
      })}

      {/* Map Legend & Selected Realm Quick-Launch Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-matrix-border text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1 text-matrix-accent font-bold">
            <span className="w-2 h-2 rounded-full bg-matrix-accent" /> Mastered
          </span>
          <span className="flex items-center gap-1 text-matrix-neonGold font-bold">
            <span className="w-2 h-2 rounded-full bg-matrix-neonGold animate-pulse" /> Active Trial
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Lock className="w-2.5 h-2.5" /> Sealed
          </span>
        </div>

        {selectedRealm && (
          <div className="flex flex-wrap items-center gap-1.5 bg-matrix-card/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-matrix-neonCyan/50 shadow-lg font-mono text-[11px]">
            <span className="text-white font-bold mr-1">
              {String(selectedRealm.order).padStart(2, "0")}. {selectedRealm.realmName}:
            </span>
            {(QUESTS[selectedRealm.id] || []).map((q) => (
              <Link
                key={q.id}
                href={`/quest/${selectedRealm.id}/${q.id}`}
                onClick={() => soundEngine.playSfx("click")}
                className="px-2 py-0.5 rounded bg-matrix-accent hover:bg-matrix-accentDark text-matrix-dark font-bold flex items-center gap-1 transition-all"
              >
                <Play className="w-2.5 h-2.5 fill-matrix-dark" />
                <span>Trial {q.order}</span>
              </Link>
            ))}
            {BOSSES[selectedRealm.id] && (
              <Link
                href={`/boss/${selectedRealm.id}`}
                onClick={() => soundEngine.playSfx("attack")}
                className="px-2 py-0.5 rounded bg-matrix-neonRed hover:bg-red-600 text-white font-bold flex items-center gap-1 transition-all"
              >
                <Swords className="w-2.5 h-2.5" />
                <span>Boss</span>
              </Link>
            )}
            <Link
              href={`/curriculum?file=${selectedRealm.fileRef}`}
              onClick={() => soundEngine.playSfx("click")}
              className="px-2 py-0.5 rounded bg-matrix-dark hover:bg-matrix-cardHover border border-matrix-border text-matrix-neonCyan font-bold flex items-center gap-1 transition-all"
            >
              <BookOpen className="w-2.5 h-2.5" />
              <span>Guide</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
