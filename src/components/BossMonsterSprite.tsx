"use client";

import React from "react";

interface Props {
  realmId: string;
  isHit: boolean;
  bossHpPercent: number;
}

export function BossMonsterSprite({ realmId, isHit, bossHpPercent }: Props) {
  const isEnraged = bossHpPercent < 40;

  // Render unique crafted SVG sprite based on realmId
  const renderMonster = () => {
    switch (realmId) {
      case "html":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            {/* Core Body */}
            <circle cx="50" cy="50" r="28" fill="#1e1b4b" stroke={isEnraged ? "#ef4444" : "#f97316"} strokeWidth="3" />
            {/* Broken Angle Brackets */}
            <path
              d="M 28 35 L 18 50 L 28 65"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <path
              d="M 72 35 L 82 50 L 72 65"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <line x1="56" y1="32" x2="44" y2="68" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="42" cy="48" r="4" fill={isHit ? "#fff" : "#ef4444"} />
            <circle cx="58" cy="48" r="4" fill={isHit ? "#fff" : "#ef4444"} />
            {/* Malformed spikes */}
            <polygon points="50,14 44,24 56,24" fill="#ef4444" />
            <polygon points="20,24 30,28 24,36" fill="#f97316" />
            <polygon points="80,24 70,28 76,36" fill="#f97316" />
          </svg>
        );

      case "css":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
            {/* Swirling Box Shields */}
            <rect
              x="22"
              y="22"
              width="56"
              height="56"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="animate-spin"
              style={{ transformOrigin: "50% 50%", animationDuration: "10s" }}
            />
            {/* Hydra Heads */}
            <circle cx="50" cy="46" r="16" fill="#0f172a" stroke="#60a5fa" strokeWidth="3" />
            <circle cx="30" cy="38" r="12" fill="#0f172a" stroke="#3b82f6" strokeWidth="2.5" />
            <circle cx="70" cy="38" r="12" fill="#0f172a" stroke="#3b82f6" strokeWidth="2.5" />
            {/* Serpent Eyes */}
            <ellipse cx="48" cy="44" rx="2" ry="4" fill="#ef4444" />
            <ellipse cx="54" cy="44" rx="2" ry="4" fill="#ef4444" />
            <circle cx="28" cy="36" r="2" fill="#ef4444" />
            <circle cx="68" cy="36" r="2" fill="#ef4444" />
            {/* Overflow Bars */}
            <rect x="25" y="74" width="50" height="6" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <rect x="35" y="75" width="20" height="4" rx="2" fill="#38bdf8" className="animate-pulse" />
          </svg>
        );

      case "javascript":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
            {/* Kraken Body */}
            <ellipse cx="50" cy="44" rx="24" ry="22" fill="#1c1917" stroke="#eab308" strokeWidth="3" />
            {/* Glowing JS Glyph */}
            <text x="50" y="48" textAnchor="middle" fill="#eab308" fontSize="16" fontFamily="monospace" fontWeight="bold">
              JS
            </text>
            {/* Kraken Eyes */}
            <circle cx="40" cy="34" r="3.5" fill="#ef4444" />
            <circle cx="60" cy="34" r="3.5" fill="#ef4444" />
            {/* Callback Pyramid Tentacles */}
            <path
              d="M 32 60 Q 20 75 14 88 Q 24 82 34 70"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 44 64 Q 40 80 38 94 Q 46 84 48 68"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 56 64 Q 60 80 62 94 Q 54 84 52 68"
              fill="none"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 68 60 Q 80 75 86 88 Q 76 82 66 70"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case "typescript":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]">
            {/* Any-Demon Horns & Face */}
            <path d="M 24 28 Q 28 10 16 4 Q 28 20 34 32" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
            <path d="M 76 28 Q 72 10 84 4 Q 72 20 66 32" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
            <polygon points="50,24 76,46 66,78 34,78 24,46" fill="#0f172a" stroke="#3b82f6" strokeWidth="3" />
            {/* Any Rune */}
            <text x="50" y="58" textAnchor="middle" fill="#ef4444" fontSize="13" fontFamily="monospace" fontWeight="bold">
              :any
            </text>
            {/* Slit Demon Eyes */}
            <line x1="38" y1="42" x2="44" y2="44" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
            <line x1="62" y1="42" x2="56" y2="44" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case "react":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            {/* Infinite Loop Orbiting Rings */}
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="14"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              transform="rotate(30 50 50)"
              className="animate-spin"
              style={{ transformOrigin: "50% 50%", animationDuration: "3s" }}
            />
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="14"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              transform="rotate(90 50 50)"
              className="animate-spin"
              style={{ transformOrigin: "50% 50%", animationDuration: "4s" }}
            />
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="14"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              transform="rotate(150 50 50)"
              className="animate-spin"
              style={{ transformOrigin: "50% 50%", animationDuration: "5s" }}
            />
            {/* Core Re-render Fiend */}
            <circle cx="50" cy="50" r="14" fill="#083344" stroke={isEnraged ? "#ef4444" : "#22d3ee"} strokeWidth="3" />
            <circle cx="46" cy="48" r="2.5" fill="#ef4444" />
            <circle cx="54" cy="48" r="2.5" fill="#ef4444" />
            <path d="M 46 56 Q 50 52 54 56" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case "backend":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">
            {/* Mechanical Steam Golem / Blocker */}
            <rect x="28" y="24" width="44" height="52" rx="8" fill="#14532d" stroke="#22c55e" strokeWidth="3" />
            {/* Frozen Event Loop Dial */}
            <circle cx="50" cy="52" r="14" fill="#052e16" stroke="#4ade80" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="50" y1="52" x2="50" y2="42" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="52" x2="58" y2="52" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            {/* Golem Visor */}
            <rect x="34" y="30" width="32" height="8" rx="2" fill="#022c22" stroke="#22c55e" strokeWidth="1" />
            <circle cx="44" cy="34" r="2" fill="#ef4444" />
            <circle cx="56" cy="34" r="2" fill="#ef4444" />
            {/* Exhaust Stacks */}
            <rect x="22" y="32" width="6" height="18" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <rect x="72" y="32" width="6" height="18" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          </svg>
        );

      case "databases":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">
            {/* Database Injection Behemoth: Armored DB Cylinders */}
            <ellipse cx="50" cy="28" rx="28" ry="10" fill="#431407" stroke="#ea580c" strokeWidth="2.5" />
            <path d="M 22 28 V 50 C 22 56 78 56 78 50 V 28" fill="#271008" stroke="#ea580c" strokeWidth="2.5" />
            <path d="M 22 50 V 72 C 22 78 78 78 78 72 V 50" fill="#1c0c05" stroke="#ea580c" strokeWidth="2.5" />
            {/* Glowing Injected Glyph */}
            <text x="50" y="55" textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
              &apos; OR 1=1--
            </text>
            <circle cx="40" cy="38" r="3" fill="#ef4444" />
            <circle cx="60" cy="38" r="3" fill="#ef4444" />
          </svg>
        );

      case "devops":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
            {/* Merge Conflict Chimera: Fractured Git Branches */}
            <circle cx="50" cy="50" r="24" fill="#3b0764" stroke="#a855f7" strokeWidth="3" />
            <circle cx="36" cy="32" r="7" fill="#1e1b4b" stroke="#ef4444" strokeWidth="2" />
            <circle cx="64" cy="32" r="7" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="2" />
            {/* Git Branch Lines */}
            <path d="M 36 39 L 50 50 L 64 39" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 2" />
            <text x="50" y="66" textAnchor="middle" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
              &lt;&lt;&lt;&lt;&lt; HEAD
            </text>
            <circle cx="45" cy="48" r="2" fill="#ef4444" />
            <circle cx="55" cy="48" r="2" fill="#ef4444" />
          </svg>
        );

      case "testing":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">
            {/* Flaky Test Spectre: Phasing Ghost */}
            <path
              d="M 30 76 C 26 44 32 20 50 20 C 68 20 74 44 70 76 C 65 72 60 76 56 72 C 52 76 48 72 44 76 C 40 72 35 76 30 76 Z"
              fill="#18181b"
              stroke={isHit ? "#22c55e" : "#ef4444"}
              strokeWidth="3"
              className="animate-pulse"
            />
            {/* Two Face Eyes: One Pass Green, One Fail Red */}
            <circle cx="44" cy="42" r="4" fill="#22c55e" />
            <circle cx="56" cy="42" r="4" fill="#ef4444" />
            {/* Question mark halo */}
            <text x="50" y="60" textAnchor="middle" fill="#f43f5e" fontSize="12" fontFamily="monospace" fontWeight="bold">
              ? : Flaky
            </text>
          </svg>
        );

      case "cs":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
            {/* O(N!) Goliath Titan */}
            <polygon points="50,16 82,34 82,72 50,90 18,72 18,34" fill="#18181b" stroke="#ef4444" strokeWidth="3" />
            {/* Factorial Tree Grid */}
            <line x1="50" y1="28" x2="36" y2="46" stroke="#f59e0b" strokeWidth="2" />
            <line x1="50" y1="28" x2="64" y2="46" stroke="#f59e0b" strokeWidth="2" />
            <line x1="36" y1="46" x2="28" y2="64" stroke="#f87171" strokeWidth="1.5" />
            <line x1="36" y1="46" x2="44" y2="64" stroke="#f87171" strokeWidth="1.5" />
            <line x1="64" y1="46" x2="56" y2="64" stroke="#f87171" strokeWidth="1.5" />
            <line x1="64" y1="46" x2="72" y2="64" stroke="#f87171" strokeWidth="1.5" />
            <text x="50" y="80" textAnchor="middle" fill="#ef4444" fontSize="12" fontFamily="monospace" fontWeight="bold">
              O(N!)
            </text>
            <circle cx="50" cy="28" r="5" fill="#ef4444" className="animate-ping" />
          </svg>
        );

      case "security":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]">
            {/* The XSS Phantom: Shrouded Mask with Injected Script */}
            <path
              d="M 28 32 C 34 16 66 16 72 32 C 80 50 74 78 50 86 C 26 78 20 50 28 32 Z"
              fill="#0f172a"
              stroke="#f43f5e"
              strokeWidth="3"
            />
            {/* Neon Slit Eyes */}
            <line x1="38" y1="44" x2="46" y2="46" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            <line x1="62" y1="44" x2="54" y2="46" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            <text x="50" y="66" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
              &lt;script&gt;
            </text>
          </svg>
        );

      case "capstone":
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
            {/* The Null Void: Swirling Black Hole Singularity */}
            <circle cx="50" cy="50" r="32" fill="#020617" stroke="#a855f7" strokeWidth="3" className="animate-spin" style={{ animationDuration: "12s" }} />
            <circle cx="50" cy="50" r="22" fill="#000000" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" className="animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
            <circle cx="50" cy="50" r="10" fill="#000000" />
            <text x="50" y="54" textAnchor="middle" fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
              NULL
            </text>
            <circle cx="36" cy="36" r="2" fill="#38bdf8" />
            <circle cx="64" cy="64" r="2" fill="#38bdf8" />
            <circle cx="68" cy="38" r="1.5" fill="#f43f5e" />
          </svg>
        );
    }
  };

  return (
    <div
      data-testid="boss-monster-sprite" role="img" aria-label={`Boss Guardian (${realmId})`} className={`relative w-36 h-36 rounded-2xl bg-gradient-to-br from-red-950/60 via-matrix-card to-black border-2 transition-all p-3 flex items-center justify-center ${
        isHit
          ? "border-matrix-accent scale-105 brightness-200 animate-shake"
          : isEnraged
          ? "border-matrix-neonRed shadow-2xl shadow-red-950/80 animate-pulse"
          : "border-matrix-border shadow-xl shadow-black/80 hover:scale-105"
      }`}
    >
      {renderMonster()}
      <div
        className={`absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-md ${
          isEnraged
            ? "bg-matrix-neonRed text-white animate-bounce"
            : "bg-matrix-card border border-matrix-border text-gray-300"
        }`}
      >
        {isEnraged ? "ENRAGED" : "BOSS"}
      </div>
    </div>
  );
}
