"use client";

import React, { useState } from "react";
import Link from "next/link";
import { REALMS, Realm } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import { BOSSES } from "@/data/bosses";
import { useGameStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import {
  Lock,
  Sparkles,
  Swords,
  Star,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Terminal,
} from "lucide-react";

export function QuestMap() {
  const { unlockedRealms, completedQuests, completedBosses, level } = useGameStore();
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(REALMS[0]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Mission Briefing */}
      <div className="relative rounded-2xl bg-gradient-to-r from-matrix-card via-matrix-dark to-matrix-card border border-matrix-border p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-matrix-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-matrix-accent/10 border border-matrix-accent/30 text-matrix-accent text-xs font-mono font-bold">
              <Terminal className="w-3.5 h-3.5 animate-pulse" />
              MISSION BRIEFING • THE WEB MATRIX
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Restore the Twelve Shattered Realms
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Step through each realm in order. Solve interactive coding quests in the dual-pane
              terminal, fight Bug Monsters in Boss Battles, and assemble your full-stack power to
              banish The Null Void.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/curriculum"
              className="px-4 py-2.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all"
              onClick={() => soundEngine.playSfx("click")}
            >
              <BookOpen className="w-4 h-4 text-matrix-neonCyan" />
              Curriculum Guides
            </Link>
          </div>
        </div>
      </div>

      {/* Main Realm Grid & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: 12 Realm Cards Grid (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REALMS.map((realm) => {
            const isUnlocked = unlockedRealms.includes(realm.id) || level >= realm.requiredLevel;
            const isCompleted = completedBosses.includes(realm.id);
            const isSelected = selectedRealm?.id === realm.id;
            const realmQuests = QUESTS[realm.id] || [];
            const completedCount = realmQuests.filter((q) =>
              completedQuests.includes(q.id)
            ).length;

            return (
              <div
                key={realm.id}
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSelectedRealm(realm);
                }}
                className={`relative group p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "bg-matrix-cardHover border-matrix-accent shadow-lg shadow-matrix-accent/10 ring-1 ring-matrix-accent"
                    : isUnlocked
                    ? "bg-matrix-card/80 border-matrix-border hover:border-gray-500 hover:bg-matrix-cardHover"
                    : "bg-matrix-dark/40 border-matrix-border/50 opacity-60 hover:opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                          isUnlocked
                            ? "bg-matrix-accent/20 border-matrix-accent/50 text-matrix-accent shadow-sm shadow-matrix-accent/20"
                            : "bg-gray-800 border-gray-700 text-gray-500"
                        }`}
                      >
                        {String(realm.order).padStart(2, "0")}
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                          {realm.realmName}
                        </span>
                        <h3 className="font-bold text-base text-white group-hover:text-matrix-neonCyan transition-colors">
                          {realm.title}
                        </h3>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="p-1 rounded-full bg-matrix-accent/20 text-matrix-accent">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="p-1 rounded-full bg-gray-800 text-gray-500">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {realm.description}
                  </p>
                </div>

                {/* Progress Footer */}
                <div className="pt-3 border-t border-matrix-border/60 flex items-center justify-between text-xs font-mono">
                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 text-matrix-neonCyan">
                      <span>
                        Quests: {completedCount}/{realmQuests.length}
                      </span>
                      {isCompleted && (
                        <span className="text-matrix-neonGold ml-2 flex items-center gap-0.5">
                          <Swords className="w-3.5 h-3.5" /> Boss Defeated
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Requires Level {realm.requiredLevel}
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Realm Detail & Action Launcher */}
        <div className="lg:col-span-1">
          {selectedRealm ? (
            <div className="sticky top-20 bg-matrix-card border border-matrix-border rounded-2xl p-6 shadow-2xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-matrix-neonCyan">
                  <span>CHAPTER {String(selectedRealm.order).padStart(2, "0")}</span>
                  <span>•</span>
                  <span>{selectedRealm.realmName}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedRealm.title}</h2>
                <p className="text-xs text-gray-300 leading-relaxed italic bg-matrix-dark/60 p-3 rounded-lg border border-matrix-border/80 mb-3">
                  &ldquo;{selectedRealm.lore}&rdquo;
                </p>

                <Link
                  href={`/curriculum?file=${selectedRealm.fileRef}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className="w-full py-2 px-3 rounded-lg bg-matrix-dark hover:bg-matrix-card border border-matrix-border hover:border-matrix-neonCyan text-matrix-neonCyan font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read Chapter Guide ({selectedRealm.fileRef})
                </Link>
              </div>

              {/* Quests in this Realm */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">
                  Quests & Trials ({QUESTS[selectedRealm.id]?.length || 0})
                </h3>

                <div className="space-y-2">
                  {(QUESTS[selectedRealm.id] || []).map((quest) => {
                    const isQuestDone = completedQuests.includes(quest.id);

                    return (
                      <Link
                        key={quest.id}
                        href={`/quest/${selectedRealm.id}/${quest.id}`}
                        onClick={() => soundEngine.playSfx("click")}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-mono group ${
                          isQuestDone
                            ? "bg-matrix-accent/5 border-matrix-accent/40 text-gray-200"
                            : "bg-matrix-dark border-matrix-border hover:border-matrix-neonCyan text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isQuestDone
                                ? "bg-matrix-accent/20 text-matrix-accent"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {quest.order}
                          </span>
                          <span className="font-semibold group-hover:text-matrix-neonCyan transition-colors">
                            {quest.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-matrix-neonGold flex items-center gap-0.5">
                            +{quest.xpReward} XP
                          </span>
                          {isQuestDone && (
                            <Star className="w-3.5 h-3.5 text-matrix-neonGold fill-matrix-neonGold" />
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Boss Challenge Launcher */}
              {BOSSES[selectedRealm.id] && (
                <div className="pt-4 border-t border-matrix-border">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-matrix-dark border border-matrix-neonRed/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-matrix-neonRed font-mono text-xs font-bold">
                        <Swords className="w-4 h-4 animate-bounce" />
                        REALM GUARDIAN
                      </div>
                      {completedBosses.includes(selectedRealm.id) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-accent/20 text-matrix-accent font-bold">
                          DEFEATED
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {BOSSES[selectedRealm.id].name}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {BOSSES[selectedRealm.id].title}
                      </p>
                    </div>

                    <Link
                      href={`/boss/${selectedRealm.id}`}
                      onClick={() => soundEngine.playSfx("attack")}
                      className="w-full py-2.5 px-4 rounded-lg bg-matrix-neonRed hover:bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                    >
                      <Swords className="w-4 h-4" />
                      Engage Boss Battle (+{BOSSES[selectedRealm.id].xpReward} XP)
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
