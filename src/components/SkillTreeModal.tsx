"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "@/lib/gameStore";
import { SKILL_TREE, SKILL_CATEGORIES, SkillCategory } from "@/data/skills";
import { soundEngine } from "@/lib/soundEngine";
import {
  X,
  Shield,
  Eye,
  Atom,
  Zap,
  Cpu,
  Crown,
  Check,
  Lock,
  RotateCcw,
  Sparkles,
  Server,
  Database,
  Layers,
  Rocket,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Eye: <Eye className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Atom: <Atom className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Server: <Server className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Rocket: <Rocket className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
};

export function SkillTreeModal({ isOpen, onClose }: Props) {
  const { level, unlockedSkills, unlockSkill, respecSkills } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
  const [confirmRespec, setConfirmRespec] = useState(false);

  if (!isOpen) return null;

  const availableSkillPoints = Math.max(0, level - unlockedSkills.length);

  const filteredSkills =
    selectedCategory === "all"
      ? SKILL_TREE
      : SKILL_TREE.filter((s) => s.category === selectedCategory);

  const handleUnlock = (skillId: string, cost: number) => {
    const success = unlockSkill(skillId, cost);
    if (success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#00d8ff", "#b026ff", "#00ff88"],
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-matrix-neonPurple/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonPurple/20 border border-matrix-neonPurple/40 flex items-center justify-center text-matrix-neonPurple shrink-0">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Cybernetic Skill Tree</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-matrix-neonPurple/15 border border-matrix-neonPurple/40 text-matrix-neonPurple font-bold">
                  15 Combat & Coding Perks
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Unlock passive abilities with skill points earned on level-up
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-full bg-matrix-neonPurple/15 border border-matrix-neonPurple/40 text-matrix-neonPurple font-mono tabular-nums text-xs font-bold whitespace-nowrap shadow-sm">
              {availableSkillPoints} Skill Points Available
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
        </div>

        {/* Branch Filter Tabs */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-matrix-border bg-matrix-dark/50 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setSelectedCategory("all");
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-matrix-neonPurple/20 border-matrix-neonPurple text-white font-bold"
                : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
            }`}
          >
            All Branches ({SKILL_TREE.length})
          </button>

          {SKILL_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => {
                soundEngine.playSfx("click");
                setSelectedCategory(cat.id);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-matrix-neonPurple/20 border-matrix-neonPurple text-white font-bold shadow-sm"
                  : "bg-matrix-card border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              <span className={cat.color}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Active Perks Summary Bar */}
          <div className="p-3.5 rounded-2xl bg-matrix-dark/80 border border-matrix-border font-mono text-xs flex flex-wrap items-center justify-between gap-2.5">
            <span className="text-gray-400 uppercase text-[10px] font-bold">
              Active Cybernetic Buffs ({unlockedSkills.length + 1}/{SKILL_TREE.length}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-matrix-accent/15 border border-matrix-accent/30 text-matrix-accent text-[10px] font-bold">
                Syntax Sense (Passive)
              </span>
              {unlockedSkills.map((skId) => {
                const sk = SKILL_TREE.find((s) => s.id === skId);
                return sk ? (
                  <span
                    key={skId}
                    className="px-2 py-0.5 rounded bg-matrix-neonPurple/20 border border-matrix-neonPurple/40 text-matrix-neonPurple text-[10px] font-bold"
                  >
                    {sk.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Respec Confirmation Notice */}
          {confirmRespec && (
            <div className="p-3.5 rounded-2xl bg-matrix-neonRed/15 border border-matrix-neonRed/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-matrix-neonRed">
                <strong>Refund all talents?</strong> All skill points will be refunded to spend again.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmRespec(false)}
                  className="px-2.5 py-1 rounded-lg bg-matrix-card border border-matrix-border text-gray-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    respecSkills();
                    setConfirmRespec(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-matrix-neonRed text-white font-bold text-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredSkills.map((skill) => {
              const isUnlocked = unlockedSkills.includes(skill.id) || skill.unlockedByDefault;
              const hasPrereq = !skill.prerequisiteId || unlockedSkills.includes(skill.prerequisiteId);
              const prereqSkill = skill.prerequisiteId ? SKILL_TREE.find((s) => s.id === skill.prerequisiteId) : null;
              const canAfford = availableSkillPoints >= skill.cost;
              const canUnlock = !isUnlocked && hasPrereq && canAfford;

              return (
                <div
                  key={skill.id}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isUnlocked
                      ? "bg-matrix-accent/5 border-matrix-accent/50 shadow-sm shadow-matrix-accent/10"
                      : hasPrereq
                      ? "bg-matrix-dark/70 border-matrix-border hover:border-matrix-neonPurple/50"
                      : "bg-matrix-dark/40 border-matrix-border/40 opacity-60"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isUnlocked
                              ? "bg-matrix-accent/20 border-matrix-accent text-matrix-accent"
                              : hasPrereq
                              ? "bg-matrix-neonPurple/20 border-matrix-neonPurple/40 text-matrix-neonPurple"
                              : "bg-matrix-dark border-matrix-border text-gray-500"
                          }`}
                        >
                          {ICON_MAP[skill.icon] || <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-white">
                              {skill.name}
                            </h3>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-matrix-dark border border-matrix-border text-gray-400">
                              Tier {skill.tier}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 capitalize">
                            {skill.category}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-matrix-accent bg-matrix-accent/15 px-2 py-0.5 rounded-full border border-matrix-accent/30">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>ACTIVE</span>
                        </span>
                      ) : !hasPrereq ? (
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-matrix-dark px-2 py-0.5 rounded-full border border-matrix-border/50">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-matrix-neonPurple bg-matrix-neonPurple/10 px-2 py-0.5 rounded-full border border-matrix-neonPurple/30">
                          {skill.cost} {skill.cost === 1 ? "Pt" : "Pts"}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {skill.description}
                    </p>

                    {skill.statBonus && (
                      <div className="mt-2 text-[10px] text-matrix-neonCyan font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Perk: {skill.statBonus}</span>
                      </div>
                    )}

                    {!hasPrereq && prereqSkill && (
                      <div className="mt-2 text-[10px] text-matrix-neonRed flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Requires: {prereqSkill.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {!isUnlocked && (
                    <div className="pt-2 border-t border-matrix-border/40 mt-1">
                      <button
                        type="button"
                        disabled={!canUnlock}
                        onClick={() => handleUnlock(skill.id, skill.cost)}
                        className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          canUnlock
                            ? "bg-matrix-neonPurple hover:bg-matrix-neonPurple/90 text-white shadow-md shadow-matrix-neonPurple/20 cursor-pointer"
                            : "bg-matrix-dark/80 text-gray-500 border border-matrix-border/40 cursor-not-allowed"
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>
                          {canUnlock
                            ? `Unlock for ${skill.cost} Points`
                            : !hasPrereq
                            ? "Prerequisite Locked"
                            : `Need ${skill.cost - availableSkillPoints} More Points`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3 border-t border-matrix-border bg-matrix-dark/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => setConfirmRespec(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-400 hover:text-matrix-neonRed transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset / Respec Talents</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-matrix-neonCyan text-matrix-dark font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
