"use client";

import React from "react";
import { useGameStore } from "@/lib/gameStore";
import { SKILL_TREE } from "@/data/skills";
import { soundEngine } from "@/lib/soundEngine";
import { X, Shield, Eye, Atom, Zap, Cpu, Crown, Check, Lock, RotateCcw } from "lucide-react";

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
};

export function SkillTreeModal({ isOpen, onClose }: Props) {
  const { level, unlockedSkills, unlockSkill, respecSkills } = useGameStore();

  if (!isOpen) return null;

  const availableSkillPoints = Math.max(0, level - unlockedSkills.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-matrix-border bg-matrix-dark/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-matrix-neonPurple/20 border border-matrix-neonPurple/40 flex items-center justify-center text-matrix-neonPurple shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Cybernetic Skill Tree
              </h2>
              <p className="text-xs text-gray-400">
                Unlock passive abilities with skill points earned on level-up
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 rounded-full bg-matrix-neonPurple/10 border border-matrix-neonPurple/40 text-matrix-neonPurple font-mono tabular-nums text-xs font-bold whitespace-nowrap shrink-0">
              {availableSkillPoints} Skill Points Available
            </div>
            <button
              onClick={() => {
                soundEngine.playSfx("click");
                onClose();
              }}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-matrix-border/50 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Skills Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Active Perks Summary Bar */}
          <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border font-mono text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-gray-400 uppercase text-[10px] font-bold">
              Active Cybernetic Buffs ({unlockedSkills.length + 1}/{SKILL_TREE.length}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-matrix-accent/15 border border-matrix-accent/30 text-matrix-accent text-[10px]">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILL_TREE.map((skill) => {
              const isUnlocked = unlockedSkills.includes(skill.id) || skill.unlockedByDefault;
              const canAfford = availableSkillPoints >= skill.cost;

              return (
                <div
                  key={skill.id}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? "bg-matrix-accent/5 border-matrix-accent/40 shadow-sm shadow-matrix-accent/10"
                      : "bg-matrix-dark/40 border-matrix-border hover:border-gray-600"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isUnlocked
                              ? "bg-matrix-accent/20 text-matrix-accent border border-matrix-accent/40"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {ICON_MAP[skill.icon] || <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white font-mono">
                            {skill.name}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider text-matrix-neonCyan font-mono">
                            {skill.category}
                          </span>
                        </div>
                      </div>

                      {isUnlocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-accent/20 text-matrix-accent flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> Learned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {skill.cost} SP
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      {skill.description}
                    </p>
                  </div>

                  {!isUnlocked && (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        const success = unlockSkill(skill.id, skill.cost);
                        if (!success) {
                          soundEngine.playSfx("error");
                        }
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                        canAfford
                          ? "bg-matrix-neonPurple hover:bg-matrix-neonPurple/80 text-white shadow-md shadow-matrix-neonPurple/20 cursor-pointer"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                      }`}
                    >
                      {canAfford ? `Learn (${skill.cost} SP)` : `Need ${skill.cost} SP (Level Up)`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-t border-matrix-border bg-matrix-dark/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span>Earn 1 Skill Point on every Level Up</span>
            {unlockedSkills.length > 0 && (
              <button
                type="button"
                onClick={() => respecSkills()}
                className="px-2.5 py-1 rounded bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-matrix-neonCyan flex items-center gap-1 transition-colors cursor-pointer"
                title="Refund all spent skill points so you can reallocate your build"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Respec Skills</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-matrix-border hover:bg-gray-700 text-white text-xs font-mono"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
