"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Boss } from "@/data/bosses";
import { useGameStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import {
  Swords,
  Heart,
  RotateCcw,
  Play,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
} from "lucide-react";

interface Props {
  boss: Boss;
  realmId: string;
}

export function BossBattleArena({ boss, realmId }: Props) {
  const { hp, maxHp, takeDamage, defeatBoss, completedBosses } = useGameStore();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [bossHp, setBossHp] = useState(boss.maxHp);
  const [code, setCode] = useState(boss.phases[0].initialCode);
  const [isHit, setIsHit] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [battleWon, setBattleWon] = useState(completedBosses.includes(realmId));
  const [battleLost, setBattleLost] = useState(false);

  const phase = boss.phases[currentPhaseIndex];

  // Submit Attack (Test Code)
  const handleAttack = () => {
    soundEngine.playSfx("attack");
    const result = phase.testCondition(code);

    if (result.passed) {
      soundEngine.playSfx("boss-hit");
      setIsHit(true);
      setTimeout(() => setIsHit(false), 500);

      const newBossHp = Math.max(0, bossHp - phase.damageToBoss);
      setBossHp(newBossHp);
      setCombatLog((prev) => [
        `[CRITICAL HIT] ${result.message} Dealt ${phase.damageToBoss} damage to ${boss.name}!`,
        ...prev,
      ]);

      if (newBossHp <= 0 || currentPhaseIndex >= boss.phases.length - 1) {
        // Victory!
        soundEngine.playSfx("victory");
        setBattleWon(true);
        defeatBoss(realmId, boss.badge.id, boss.xpReward);
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ["#ef4444", "#f59e0b", "#00ff9d"],
        });
      } else {
        // Advance to next phase
        const nextIdx = currentPhaseIndex + 1;
        setCurrentPhaseIndex(nextIdx);
        setCode(boss.phases[nextIdx].initialCode);
      }
    } else {
      // Counter-attack by Boss!
      soundEngine.playSfx("error");
      const remainingHp = takeDamage(phase.damageToPlayer);
      setCombatLog((prev) => [
        `[SYNTAX COUNTER] ${result.message} ${boss.name} struck you for ${phase.damageToPlayer} damage!`,
        ...prev,
      ]);

      if (remainingHp <= 0) {
        setBattleLost(true);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-matrix-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
          onClick={() => soundEngine.playSfx("click")}
        >
          <ArrowLeft className="w-4 h-4" />
          Retreat to World Map
        </Link>

        <div className="font-mono text-xs text-matrix-neonRed font-bold flex items-center gap-1.5">
          <Swords className="w-4 h-4 animate-pulse" />
          BOSS ENCOUNTER • {boss.realmId.toUpperCase()}
        </div>
      </div>

      {/* Arena Stage: Monster Graphic + Health Gauges */}
      <div className="relative rounded-2xl bg-gradient-to-b from-red-950/20 via-matrix-card to-matrix-dark border border-matrix-neonRed/40 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Boss Sprite & Avatar */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={`relative w-36 h-36 rounded-2xl bg-gradient-to-br from-red-900/40 to-black border-2 border-matrix-neonRed flex items-center justify-center shadow-xl shadow-red-950/60 transition-transform ${
                isHit ? "animate-boss-hit scale-95 brightness-150" : "animate-float"
              }`}
            >
              <Swords className="w-16 h-16 text-matrix-neonRed animate-pulse" />
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-matrix-neonRed text-white text-[10px] font-mono font-bold">
                BOSS
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-mono">{boss.name}</h2>
              <p className="text-xs text-gray-400">{boss.title}</p>
            </div>
          </div>

          {/* Health Bars: Boss vs Player */}
          <div className="flex-1 w-full max-w-lg space-y-5">
            {/* Boss HP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-matrix-neonRed">{boss.name} HP</span>
                <span className="text-gray-300">
                  {bossHp}/{boss.maxHp}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-matrix-border overflow-hidden p-0.5 border border-red-900">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-matrix-neonRed transition-all duration-300 rounded-full"
                  style={{ width: `${(bossHp / boss.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* Player HP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-matrix-accent flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-matrix-accent" /> Player Vitality
                </span>
                <span className="text-gray-300">
                  {hp}/{maxHp}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-matrix-border overflow-hidden p-0.5 border border-emerald-900">
                <div
                  className="h-full bg-gradient-to-r from-matrix-accentDark to-matrix-accent transition-all duration-300 rounded-full"
                  style={{ width: `${(hp / maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* Boss Dialogue Speech Bubble */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-matrix-border text-xs font-mono text-gray-300 italic">
              <span className="text-matrix-neonRed font-bold not-italic mr-2">&gt;</span>
              &ldquo;{battleWon ? boss.defeatQuote : phase.bossDialogue}&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* Battle Victory Screen */}
      {battleWon && (
        <div className="p-6 rounded-2xl bg-matrix-accent/10 border-2 border-matrix-accent text-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-matrix-accent/20 border-2 border-matrix-accent flex items-center justify-center text-matrix-accent mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white font-mono">VICTORY ACHIEVED!</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            You vanquished {boss.name}! You earned +{boss.xpReward} XP and the prestigious{" "}
            <span className="text-matrix-neonGold font-bold font-mono">
              &ldquo;{boss.badge.name}&rdquo;
            </span>{" "}
            badge!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-matrix-accent text-matrix-dark font-mono text-xs font-bold shadow-lg shadow-matrix-accent/20 hover:scale-105 transition-all"
            onClick={() => soundEngine.playSfx("click")}
          >
            Return to World Map
          </Link>
        </div>
      )}

      {/* Battle Loss Screen */}
      {battleLost && !battleWon && (
        <div className="p-6 rounded-2xl bg-matrix-neonRed/10 border-2 border-matrix-neonRed text-center space-y-4 animate-fadeIn">
          <h3 className="text-2xl font-bold text-matrix-neonRed font-mono">CODE COLLAPSE</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Your HP reached 0. The Bug Monster overpowered your syntax defenses. Regroup and try
            again!
          </p>
          <button
            onClick={() => {
              useGameStore.getState().resetHealth();
              setBossHp(boss.maxHp);
              setCurrentPhaseIndex(0);
              setCode(boss.phases[0].initialCode);
              setBattleLost(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-matrix-neonRed text-white font-mono text-xs font-bold hover:scale-105 transition-all cursor-pointer"
          >
            Re-energize HP & Retry Boss
          </button>
        </div>
      )}

      {/* Combat Coding Workspace */}
      {!battleWon && !battleLost && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase Prompt & Objective */}
          <div className="bg-matrix-card border border-matrix-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-matrix-neonCyan font-bold">
                  BATTLE STAGE {currentPhaseIndex + 1} OF {boss.phases.length}
                </span>
                <span className="text-[10px] font-mono text-matrix-neonGold">
                  +{phase.damageToBoss} Boss Damage on Pass
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{phase.phaseTitle}</h4>
              <p className="text-xs text-gray-300 leading-relaxed bg-matrix-dark/50 p-3 rounded-lg border border-matrix-border">
                {phase.prompt}
              </p>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-mono text-yellow-300">
                <span className="font-bold block mb-1">Tactical Intel:</span>
                {phase.hint}
              </div>
            </div>

            <button
              onClick={handleAttack}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-matrix-neonRed to-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 hover:opacity-90 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              Cast Refactor Strike ({phase.damageToBoss} DMG)
            </button>
          </div>

          {/* Code Editor */}
          <div className="bg-matrix-card border border-matrix-border rounded-xl flex flex-col overflow-hidden shadow-lg">
            <div className="px-4 py-2 border-b border-matrix-border bg-matrix-dark/70 flex items-center justify-between font-mono text-xs text-gray-400">
              <span>DEBUG WORKBENCH</span>
              <button
                onClick={() => setCode(phase.initialCode)}
                className="hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Code
              </button>
            </div>

            <div className="p-4 bg-matrix-dark flex-1 min-h-[220px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-gray-200 outline-none resize-none font-mono text-xs leading-relaxed selection:bg-red-500/30"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Combat Activity Log */}
      {combatLog.length > 0 && (
        <div className="bg-matrix-dark/80 border border-matrix-border rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto">
          <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">
            Combat Log
          </div>
          {combatLog.map((log, idx) => (
            <div
              key={idx}
              className={log.includes("CRITICAL") ? "text-matrix-accent" : "text-matrix-neonRed"}
            >
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
