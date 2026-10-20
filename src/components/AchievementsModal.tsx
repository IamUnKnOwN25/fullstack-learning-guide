"use client";

import React from "react";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import {
  X,
  Trophy,
  Award,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Star,
  Zap,
  Crown,
  Download,
  Upload,
  Unlock,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BADGES_CATALOG: Record<string, { name: string; description: string; icon: string }> = {
  welcome_recruit: {
    name: "Matrix Initiate",
    description: "Plugged into DevQuest and began your journey to full-stack mastery.",
    icon: "Sparkles",
  },
  speed_coder: {
    name: "Flawless Syntax",
    description: "Achieved a perfect 3-star rating on a coding trial without relying on hints.",
    icon: "Star",
  },
  skill_pioneer: {
    name: "Cybernetic Pioneer",
    description: "Unlocked your first talent tree ability and augmented your coding powers.",
    icon: "Zap",
  },
  slayer_of_divs: {
    name: "Semantic Warden",
    description: "Vanquished The Malformed Tag Abomination in the HTML Realm.",
    icon: "ShieldAlert",
  },
  slayer_of_hydra: {
    name: "Master of Grids & Flow",
    description: "Tamed horizontal scrollbars and vanquished The Overflow Hydra in the CSS Realm.",
    icon: "Award",
  },
  slayer_of_kraken: {
    name: "Async Spellcaster",
    description: "Banished callback hell and mastered Promises against The Callback Kraken.",
    icon: "Sparkles",
  },
  slayer_of_any: {
    name: "Discriminated Champion",
    description: "Banished type 'any' and enforced strict compile-time discriminated unions.",
    icon: "ShieldAlert",
  },
  slayer_of_rerenders: {
    name: "Master of Pure Renders",
    description: "Defeated the Infinite Re-Render Fiend using stable state dependencies.",
    icon: "Sparkles",
  },
  slayer_of_blocker: {
    name: "Non-Blocking Architect",
    description: "Protected Node.js single-threaded event loop from synchronous CPU stalls.",
    icon: "Zap",
  },
  slayer_of_injection: {
    name: "Guardian of the Schema",
    description: "Eradicated SQL injection vulnerabilities using parameterized prepared statements.",
    icon: "ShieldAlert",
  },
  slayer_of_conflict: {
    name: "DevOps Fleet Admiral",
    description: "Resolved intractable Git merge conflicts and automated container pipelines.",
    icon: "Zap",
  },
  slayer_of_flakiness: {
    name: "TDD Purist",
    description: "Exorcised asynchronous timing race conditions with deterministic mock clocks.",
    icon: "Award",
  },
  slayer_of_goliath: {
    name: "Algorithmic Grandmaster",
    description: "Tamed factorial algorithmic complexity with dynamic programming memoization.",
    icon: "Trophy",
  },
  slayer_of_xss: {
    name: "Aegis Sentinel",
    description: "Secured web applications against XSS with strict Content-Security-Policy headers.",
    icon: "ShieldAlert",
  },
  master_of_the_matrix: {
    name: "Matrix Architect",
    description: "Banished The Null Void and completed the Full-Stack Web Development Capstone Odyssey.",
    icon: "Trophy",
  },
  grandmaster_matrix: {
    name: "Grandmaster Ascendant",
    description: "Attained the pinnacle Matrix Grandmaster skill and unlocked the Full-Stack Archmage rank.",
    icon: "Crown",
  },
};

export function AchievementsModal({ isOpen, onClose }: Props) {
  const {
    badges,
    completedQuests,
    completedBosses,
    completedChapters = [],
    completedCurriculumTasks = [],
    unlockedRealms,
    unlockedSkills,
    stars,
    xp,
    level,
    rankTitle,
    resetProgress,
    unlockAllRealms,
    importSaveData,
  } = useGameStore();

  const [copiedBackup, setCopiedBackup] = React.useState(false);
  const [showImportBox, setShowImportBox] = React.useState(false);
  const [importJsonText, setImportJsonText] = React.useState("");
  const [importStatus, setImportStatus] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const totalStarsEarned = Object.values(stars || {}).reduce((acc, s) => acc + s, 0);
  const allRealmsUnlocked = unlockedRealms.length >= 12;

  const handleExportSave = () => {
    const payload = JSON.stringify(
      {
        xp,
        level,
        rankTitle,
        completedQuests,
        completedBosses,
        unlockedRealms,
        stars,
        unlockedSkills,
        badges,
        completedCurriculumTasks,
        completedChapters,
      },
      null,
      2
    );
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(payload);
    }
    soundEngine.playSfx("click");
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleImportSave = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const ok = importSaveData(parsed);
      if (ok) {
        setImportStatus("Save profile restored successfully!");
        setShowImportBox(false);
        setImportJsonText("");
      } else {
        setImportStatus("Invalid save data structure.");
      }
    } catch {
      soundEngine.playSfx("error");
      setImportStatus("Invalid JSON format. Paste a valid DevQuest backup.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-matrix-card border border-matrix-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-matrix-border bg-matrix-dark/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-matrix-neonGold/20 border border-matrix-neonGold/40 flex items-center justify-center text-matrix-neonGold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Trophy Room & Operator Profile
              </h2>
              <p className="text-xs text-gray-400">
                Your earned honors, boss trophies, star ratings, and profile backup
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-matrix-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-6 py-3 border-b border-matrix-border bg-matrix-dark/30 text-center font-mono tabular-nums">
          <div>
            <div className="text-[10px] uppercase text-gray-400">Rank</div>
            <div className="text-xs font-bold text-matrix-accent truncate">{rankTitle}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Level</div>
            <div className="text-xs font-bold text-white">L{level}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Quests</div>
            <div className="text-xs font-bold text-matrix-neonCyan">{completedQuests.length}/24</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Bosses</div>
            <div className="text-xs font-bold text-matrix-neonGold">{completedBosses.length}/12</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Stars</div>
            <div className="text-xs font-bold text-matrix-neonGold">{totalStarsEarned}/72 ★</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-gray-400">Chapters</div>
            <div className="text-xs font-bold text-matrix-accent">{completedChapters.length}/13</div>
          </div>
        </div>

        {/* Sandbox Unlock & Backup Controls Bar */}
        <div className="px-6 py-2.5 border-b border-matrix-border bg-matrix-dark/50 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportSave}
              className="px-2.5 py-1 rounded bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-matrix-neonCyan" />
              <span>{copiedBackup ? "Copied Backup JSON!" : "Export Save JSON"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setShowImportBox(!showImportBox);
                setImportStatus(null);
              }}
              className="px-2.5 py-1 rounded bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-matrix-neonPurple" />
              <span>Import Save</span>
            </button>
          </div>

          {!allRealmsUnlocked ? (
            <button
              type="button"
              onClick={() => unlockAllRealms()}
              className="px-2.5 py-1 rounded bg-matrix-accent/15 hover:bg-matrix-accent/25 border border-matrix-accent/50 text-matrix-accent font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unlock all 12 realms immediately for open practice"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock All 12 Realms (Open Practice)</span>
            </button>
          ) : (
            <span className="text-[11px] text-matrix-accent font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All 12 Realms Unlocked
            </span>
          )}
        </div>

        {showImportBox && (
          <div className="px-6 py-3 border-b border-matrix-border bg-matrix-dark space-y-2 font-mono text-xs">
            <div className="text-gray-300">Paste your exported DevQuest JSON backup below:</div>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"xp": 500, "completedQuests": [...]}'
              rows={3}
              className="w-full p-2 rounded bg-matrix-card border border-matrix-border text-gray-200 font-mono text-xs outline-none focus:border-matrix-neonCyan"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1 rounded bg-matrix-card border border-matrix-border text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSave}
                className="px-3 py-1 rounded bg-matrix-accent text-matrix-dark font-bold"
              >
                Restore Backup
              </button>
            </div>
          </div>
        )}

        {importStatus && (
          <div className="px-6 py-2 bg-matrix-neonCyan/10 border-b border-matrix-neonCyan/30 text-matrix-neonCyan font-mono text-xs">
            {importStatus}
          </div>
        )}

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            Earned Achievements ({badges.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(BADGES_CATALOG).map(([badgeId, badge]) => {
              const isEarned = badges.includes(badgeId);

              return (
                <div
                  key={badgeId}
                  onClick={() => soundEngine.playSfx(isEarned ? "badge-inspect" : "click")}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isEarned
                      ? "bg-matrix-dark/80 border-matrix-neonGold/40 shadow-sm shadow-matrix-neonGold/10 hover:border-matrix-neonGold"
                      : "bg-matrix-dark/20 border-matrix-border opacity-50 grayscale hover:opacity-70"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isEarned
                        ? "bg-matrix-neonGold/20 text-matrix-neonGold border border-matrix-neonGold/50 shadow-sm shadow-matrix-neonGold/20"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {badge.icon === "Trophy" ? (
                      <Trophy className="w-5 h-5" />
                    ) : badge.icon === "Crown" ? (
                      <Crown className="w-5 h-5" />
                    ) : badge.icon === "Star" ? (
                      <Star className="w-5 h-5 fill-current" />
                    ) : badge.icon === "Zap" ? (
                      <Zap className="w-5 h-5" />
                    ) : badge.icon === "ShieldAlert" ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : badge.icon === "Sparkles" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-mono text-sm font-bold text-white">{badge.name}</h4>
                      {isEarned && <CheckCircle2 className="w-3.5 h-3.5 text-matrix-accent" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Reset Progress option */}
        <div className="px-6 py-3 border-t border-matrix-border bg-matrix-dark/80 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              if (confirm("Reset all game progress? This will reset your level, quests, and XP.")) {
                resetProgress();
                soundEngine.playSfx("error");
              }
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-matrix-neonRed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Save Data
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-matrix-border hover:bg-gray-700 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
