"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
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
  BookOpen,
  Shield,
  Crosshair,
  Sparkles,
  ArrowRight,
  AlertOctagon,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { REALMS } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import { BOSSES, Boss } from "@/data/bosses";
import { BossMonsterSprite } from "./BossMonsterSprite";
import { BOSS_INCIDENT_POST_MORTEMS } from "@/data/questPedagogy";

interface Props {
  boss?: Boss;
  realmId: string;
}

interface FloatingDamage {
  id: number;
  text: string;
  type: "player-hit" | "boss-hit" | "shield-deflect";
}

const PROGRAMMER_SYMBOLS = [
  "Tab", "{", "}", "(", ")", "[", "]", ";", "=>", '"', "'", "=", "<", ">", "/", ":", ".", "!"
];

export function BossBattleArena({ boss: initialBoss, realmId }: Props) {
  const boss = initialBoss || BOSSES[realmId];
  const { hp, maxHp, takeDamage, defeatBoss, completedBosses, completedQuests, unlockedSkills } =
    useGameStore();
  const realm = REALMS.find((r) => r.id === realmId);
  const realmIndex = REALMS.findIndex((r) => r.id === realmId);
  const nextRealm =
    realmIndex !== -1 && realmIndex + 1 < REALMS.length ? REALMS[realmIndex + 1] : undefined;
  const nextRealmFirstQuest = nextRealm ? QUESTS[nextRealm.id]?.[0] : undefined;
  const realmQuests = QUESTS[realmId] || [];

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [bossHp, setBossHp] = useState(boss?.maxHp || 100);
  const [code, setCode] = useState(boss?.phases[0]?.initialCode || "");
  const [isHit, setIsHit] = useState(false);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [battleWon, setBattleWon] = useState(completedBosses.includes(realmId));
  const [battleLost, setBattleLost] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingDamage[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const [arenaShaking, setArenaShaking] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [postMortemOpen, setPostMortemOpen] = useState(true);
  const gutterRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const insertSymbolAtCursor = (symbol: string) => {
    soundEngine.playSfx("click");
    const target = textareaRef.current;
    if (!target) return;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const insertion = symbol === "Tab" ? "  " : symbol;
    const nextCode = code.substring(0, start) + insertion + code.substring(end);
    setCode(nextCode);
    const nextPos = start + insertion.length;
    setTimeout(() => {
      target.focus();
      target.selectionStart = nextPos;
      target.selectionEnd = nextPos;
    }, 0);
  };

  const postMortem = BOSS_INCIDENT_POST_MORTEMS[realmId];

  const phase = boss?.phases[currentPhaseIndex];

  if (!boss || !phase) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-mono">Boss Encounter Not Found</h2>
        <p className="text-sm text-gray-400">The realm guardian could not be summoned.</p>
        <Link
          href="/"
          className="inline-flex px-4 py-2 rounded-lg bg-matrix-neonRed text-white font-mono text-xs font-bold"
        >
          Retreat to World Map
        </Link>
      </div>
    );
  }

  // Submit Attack (Test Code)
  const handleAttack = () => {
    soundEngine.playSfx("attack");
    const result = phase.testCondition(code);
    const newId = Date.now();

    if (result.passed) {
      soundEngine.playSfx("boss-hit");
      setIsHit(true);
      setLaserActive(true);
      setTimeout(() => {
        setIsHit(false);
        setLaserActive(false);
      }, 500);

      const newBossHp = Math.max(0, bossHp - phase.damageToBoss);
      setBossHp(newBossHp);
      setFloatingNumbers((prev) => [
        ...prev,
        { id: newId, text: `-${phase.damageToBoss} REFACTOR CRIT!`, type: "player-hit" },
      ]);
      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
      }, 1200);

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
      setArenaShaking(true);
      setTimeout(() => setArenaShaking(false), 500);

      // Check if Lint Barrier skill absorbs the counter-attack
      if (unlockedSkills.includes("lint_shield") && !shieldUsed) {
        setShieldUsed(true);
        soundEngine.playSfx("skill-unlock");
        setFloatingNumbers((prev) => [
          ...prev,
          { id: newId, text: `🛡️ DEFLECTED! 0 DMG`, type: "shield-deflect" },
        ]);
        setTimeout(() => {
          setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
        }, 1200);

        setCombatLog((prev) => [
          `[LINT BARRIER DEFLECTION] Your Lint Barrier absorbed the syntax counter-strike! 0 damage taken!`,
          ...prev,
        ]);
      } else {
        // Counter-attack by Boss!
        soundEngine.playSfx("error");
        const remainingHp = takeDamage(phase.damageToPlayer);
        setFloatingNumbers((prev) => [
          ...prev,
          { id: newId, text: `-${phase.damageToPlayer} SYNTAX COUNTER!`, type: "boss-hit" },
        ]);
        setTimeout(() => {
          setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
        }, 1200);

        setCombatLog((prev) => [
          `[SYNTAX COUNTER] ${result.message} ${boss.name} struck you for ${phase.damageToPlayer} damage!`,
          ...prev,
        ]);

        if (remainingHp <= 0) {
          setBattleLost(true);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-6 pb-24 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-matrix-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
          onClick={() => soundEngine.playSfx("click")}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Retreat to World Map
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Realm Trial & Boss Quick Switcher */}
          <div className="flex items-center gap-1 bg-matrix-dark p-1 rounded-lg border border-matrix-border font-mono text-xs shrink-0 overflow-x-auto select-none">
            {realmQuests.map((rq) => {
              const solved = completedQuests.includes(rq.id);
              return (
                <Link
                  key={rq.id}
                  href={`/quest/${realmId}/${rq.id}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-all ${
                    solved
                      ? "text-matrix-accent hover:bg-matrix-card"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Trial {rq.order}</span>
                  {solved && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                </Link>
              );
            })}
            <span className="px-2.5 py-1 rounded flex items-center gap-1 bg-matrix-neonRed text-white font-bold whitespace-nowrap shrink-0">
              <Swords className="w-3 h-3 shrink-0" />
              <span>Boss</span>
            </span>
          </div>

          {realm && (
            <Link
              href={`/curriculum?file=${realm.fileRef}`}
              target="_blank"
              onClick={() => soundEngine.playSfx("click")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border hover:border-matrix-neonCyan text-matrix-neonCyan text-xs font-mono transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Grimoire Guide ({realm.fileRef})</span>
            </Link>
          )}

          <div className="font-mono text-xs text-matrix-neonRed font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <Swords className="w-4 h-4 animate-pulse shrink-0" />
            BOSS ENCOUNTER • {boss.realmId.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Arena Stage: Monster Graphic + Health Gauges */}
      <div
        className={`relative rounded-2xl bg-gradient-to-b from-red-950/20 via-matrix-card to-matrix-dark border border-matrix-neonRed/40 p-6 sm:p-8 overflow-hidden shadow-2xl transition-all ${
          arenaShaking ? "animate-shake" : ""
        }`}
      >
        {/* Laser Refactor Strike Visual FX */}
        {laserActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-matrix-accent/30 via-matrix-neonCyan/40 to-matrix-neonRed/20 pointer-events-none z-20 animate-pulse" />
        )}

        {/* Floating Combat Text Layer */}
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
          {floatingNumbers.map((item) => (
            <div
              key={item.id}
              className={`absolute font-mono font-extrabold text-sm sm:text-base px-3 py-1 rounded-lg shadow-2xl animate-float-up ${
                item.type === "player-hit"
                  ? "bg-matrix-accent/90 text-matrix-dark border border-white"
                  : item.type === "shield-deflect"
                  ? "bg-matrix-neonPurple/90 text-white border border-matrix-neonPurple"
                  : "bg-matrix-neonRed/90 text-white border border-red-300"
              }`}
              style={{
                top: item.type === "player-hit" ? "25%" : "45%",
                left: item.type === "player-hit" ? "20%" : "60%",
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Boss Sprite & Avatar */}
          <div className="flex flex-col items-center text-center space-y-4">
            <BossMonsterSprite
              realmId={boss.realmId}
              isHit={isHit}
              bossHpPercent={(bossHp / boss.maxHp) * 100}
            />

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{boss.name}</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{boss.title}</p>
            </div>
          </div>

          {/* Health Bars: Boss vs Player */}
          <div className="flex-1 w-full max-w-lg space-y-5">
            {/* Boss HP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold tabular-nums">
                <span className="text-matrix-neonRed">{boss.name} HP</span>
                <span className="text-gray-200">
                  {bossHp}/{boss.maxHp}
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-matrix-border overflow-hidden p-0.5 border border-red-900/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-matrix-neonRed transition-all duration-300 rounded-full"
                  style={{ width: `${(bossHp / boss.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* Player HP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold tabular-nums">
                <span className="text-matrix-accent flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-matrix-accent" /> Player Vitality
                </span>
                <span className="text-gray-200">
                  {hp}/{maxHp}
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-matrix-border overflow-hidden p-0.5 border border-emerald-900/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-matrix-accentDark to-matrix-accent transition-all duration-300 rounded-full"
                  style={{ width: `${(hp / maxHp) * 100}%` }}
                />
              </div>

              {unlockedSkills.includes("lint_shield") && (
                <div
                  className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-colors ${
                    !shieldUsed
                      ? "bg-matrix-neonPurple/20 border-matrix-neonPurple/50 text-matrix-neonPurple shadow-sm shadow-matrix-neonPurple/20"
                      : "bg-gray-800/40 border-gray-700 text-gray-500"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Lint Barrier: {!shieldUsed ? "Charged (1 Absorption Ready)" : "Discharged"}</span>
                </div>
              )}
            </div>

            {/* Boss Dialogue Speech Bubble */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-matrix-border text-xs sm:text-sm font-sans text-gray-200 italic">
              <span className="text-matrix-neonRed font-mono font-bold not-italic mr-2">&gt;</span>
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

          {/* Senior Production Post-Mortem & Incident Retrospective */}
          {postMortem && (
            <div className="text-left bg-matrix-dark/95 border border-matrix-border rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xl max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-matrix-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                    {postMortem.incidentSeverity}
                  </span>
                  <span className="text-xs font-mono font-bold text-matrix-neonCyan">
                    {postMortem.incidentId} • SENIOR INCIDENT RETROSPECTIVE
                  </span>
                </div>
                <button
                  type="button"
                  aria-expanded={postMortemOpen}
                  onClick={() => setPostMortemOpen(!postMortemOpen)}
                  className="text-[11px] font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{postMortemOpen ? "Collapse Report" : "Expand Report"}</span>
                  {postMortemOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {postMortemOpen && (
                <div className="space-y-3 font-mono text-xs animate-fadeIn">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{postMortem.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{postMortem.rootCause}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-black/40 border border-red-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-bold">
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                        <span>Real-World Outage Impact:</span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-sans leading-relaxed">{postMortem.productionImpact}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-matrix-accent/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-matrix-accent text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Senior Prevention Strategy:</span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-sans leading-relaxed">{postMortem.seniorMitigation}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2 text-yellow-300 text-[11px]">
                    <Activity className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-400" />
                    <div>
                      <span className="font-bold">Production Metric Alert Rule: </span>
                      <span className="text-gray-300 font-sans">{postMortem.metricAlert}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                useGameStore.getState().resetHealth();
                setBossHp(boss.maxHp);
                setCurrentPhaseIndex(0);
                setCode(boss.phases[0].initialCode);
                setBattleWon(false);
                setBattleLost(false);
                setShieldUsed(false);
                setCombatLog([]);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-200 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rematch Boss
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-accent/50 text-matrix-accent font-mono text-xs font-bold transition-all"
              onClick={() => soundEngine.playSfx("click")}
            >
              Return to World Map
            </Link>

            {nextRealm && nextRealmFirstQuest && (
              <Link
                href={`/quest/${nextRealm.id}/${nextRealmFirstQuest.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-matrix-accent text-matrix-dark font-mono text-xs font-bold shadow-lg shadow-matrix-accent/20 hover:scale-105 transition-all"
                onClick={() => soundEngine.playSfx("click")}
              >
                <span>Advance to {nextRealm.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
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
              setShieldUsed(false);
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
          <div
            key={currentPhaseIndex}
            className="bg-matrix-card border border-matrix-border rounded-xl p-5 space-y-4 flex flex-col justify-between animate-fadeIn"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-matrix-neonCyan font-bold tracking-wider">
                  BATTLE STAGE {currentPhaseIndex + 1} OF {boss.phases.length}
                </span>
                <span className="text-[11px] font-mono font-bold text-matrix-neonGold tabular-nums">
                  +{phase.damageToBoss} Boss Damage on Pass
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {phase.phaseTitle}
              </h4>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-matrix-dark/50 p-3.5 rounded-xl border border-matrix-border font-sans">
                {phase.prompt}
              </p>

              {/* Tactical Scanner Toggle */}
              <div className="rounded-xl border border-yellow-500/30 overflow-hidden bg-yellow-500/5">
                <button
                  type="button"
                  aria-expanded={scanOpen}
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setScanOpen(!scanOpen);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-mono font-bold text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
                    Tactical Weakness Scanner
                  </span>
                  <span className="text-[10px] text-yellow-500">
                    {scanOpen ? "Hide Scan ▲" : "Reveal Intel ▼"}
                  </span>
                </button>

                {scanOpen && (
                  <div className="p-3.5 border-t border-yellow-500/20 bg-matrix-dark/80 text-xs font-mono space-y-2 text-yellow-200 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-matrix-neonCyan text-[11px] font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Target Vulnerability Signature:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playSfx("click");
                          setCode(phase.hint);
                        }}
                        className="px-2 py-0.5 rounded bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-[10px] font-bold transition-colors"
                      >
                        Load Tactical Patch
                      </button>
                    </div>
                    <p className="leading-relaxed text-gray-300 bg-black/40 p-2.5 rounded border border-matrix-border/50 whitespace-pre-wrap">
                      {phase.hint}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAttack}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-matrix-neonRed to-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 hover:opacity-90 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Cast Refactor Strike ({phase.damageToBoss} DMG)</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800 text-white font-mono">
                Ctrl+↵
              </kbd>
            </button>
          </div>

          {/* Code Editor */}
          <div className="bg-matrix-card border border-matrix-border rounded-xl flex flex-col overflow-hidden shadow-lg">
            <div className="px-4 py-2 border-b border-matrix-border bg-matrix-dark/70 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-gray-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="whitespace-nowrap shrink-0">DEBUG WORKBENCH</span>
                {phase.testCondition(code).passed && (
                  <span className="px-2 py-0.5 rounded bg-matrix-accent/20 border border-matrix-accent/40 text-matrix-accent text-[10px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    PATCH VERIFIED — READY TO STRIKE
                  </span>
                )}
              </div>
              <button
                onClick={() => setCode(phase.initialCode)}
                className="hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3 shrink-0" /> Reset Code
              </button>
            </div>

            {/* Mobile Programmer Keyboard Accessory Bar */}
            <div className="flex md:hidden items-center gap-1.5 px-2 py-1.5 bg-matrix-card/95 border-b border-matrix-border overflow-x-auto shrink-0 select-none">
              <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Symbols:</span>
              {PROGRAMMER_SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbolAtCursor(sym)}
                  className="px-2.5 py-1 rounded bg-matrix-dark hover:bg-matrix-cardHover active:bg-matrix-neonRed/20 border border-matrix-border/80 text-matrix-neonRed active:scale-95 text-xs font-mono font-bold shrink-0 shadow-sm cursor-pointer"
                >
                  {sym === "Tab" ? "⇥ Tab" : sym}
                </button>
              ))}
            </div>

            <div className="bg-matrix-dark flex-1 min-h-[240px] flex overflow-hidden">
              <div
                ref={gutterRef}
                aria-hidden="true"
                className="select-none text-right py-4 pl-4 pr-2.5 border-r border-matrix-border/60 text-gray-600 font-mono text-xs leading-6 overflow-hidden shrink-0"
              >
                {code.split("\n").map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                aria-label="Combat code editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={(e) => {
                  if (gutterRef.current) {
                    gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
                spellCheck={false}
                wrap="off"
                className="w-full flex-1 h-full py-4 px-3 bg-transparent text-gray-200 outline-none resize-none font-mono text-xs leading-6 overflow-auto whitespace-pre selection:bg-red-500/30"
                style={{ tabSize: 2 }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    setCode(code.substring(0, start) + "  " + code.substring(end));
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + 2;
                    }, 0);
                  } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleAttack();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Combat Activity Log */}
      {combatLog.length > 0 && (
        <div
          role="log"
          aria-live="polite"
          aria-label="Combat Activity Log"
          className="bg-matrix-dark/80 border border-matrix-border rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto"
        >
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
