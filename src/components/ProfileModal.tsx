"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore, AVATAR_OPTIONS } from "@/lib/authStore";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import { serializeSaveData } from "@/lib/saveManager";
import { getAchievementById } from "@/data/achievements";
import {
  X,
  User,
  Shield,
  Heart,
  Zap,
  Flame,
  Award,
  Crown,
  Calendar,
  Edit3,
  Check,
  LogOut,
  Copy,
  Download,
  Upload,
  Sparkles,
  ExternalLink,
  Lock,
  LogIn,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
  onOpenLeaderboard?: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  onOpenAuthModal,
  onOpenLeaderboard,
}: Props) {
  const { currentUser, updateProfile, logout, isAuthenticated } = useAuthStore();
  const {
    xp,
    level,
    rankTitle,
    maxHp,
    maxMana,
    streak,
    completedQuests,
    completedBosses,
    stars,
    completedCurriculumTasks = [],
    completedChapters = [],
    badges = [],
    importSaveData,
  } = useGameStore();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser.customBio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatarId || "neon-hacker");
  const [selectedBadge, setSelectedBadge] = useState(currentUser.showcaseBadgeId || "");
  const [copiedSave, setCopiedSave] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        soundEngine.playSfx("click");
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const avatar =
    AVATAR_OPTIONS.find((a) => a.id === currentUser.avatarId) || AVATAR_OPTIONS[0];

  const totalStars = Object.values(stars || {}).reduce((sum, s) => sum + s, 0);

  const handleSaveBio = () => {
    updateProfile({
      customBio: bioText.trim(),
      avatarId: selectedAvatar,
      showcaseBadgeId: selectedBadge,
    });
    soundEngine.playSfx("click");
    setIsEditingBio(false);
  };

  const handleExportSave = () => {
    const payload = serializeSaveData({
      xp,
      level,
      rankTitle,
      completedQuests,
      completedBosses,
      stars,
      badges,
      completedCurriculumTasks,
      completedChapters,
      streak,
    });
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(payload);
    }
    soundEngine.playSfx("click");
    setCopiedSave(true);
    setTimeout(() => setCopiedSave(false), 2000);
  };

  const handleDownloadSaveFile = () => {
    const payload = serializeSaveData({
      xp,
      level,
      rankTitle,
      completedQuests,
      completedBosses,
      stars,
      badges,
      completedCurriculumTasks,
      completedChapters,
      streak,
    });
    if (typeof window !== "undefined") {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devquest-save-${currentUser.username || "player"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      soundEngine.playSfx("click");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        try {
          const ok = importSaveData(res);
          if (ok) {
            setImportMsg("Save file loaded successfully!");
            soundEngine.playSfx("level-up");
          } else {
            setImportMsg("Invalid save file structure.");
            soundEngine.playSfx("error");
          }
        } catch {
          setImportMsg("Invalid JSON format.");
          soundEngine.playSfx("error");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportSave = () => {
    try {
      const ok = importSaveData(importText);
      if (ok) {
        setImportMsg("Save file loaded successfully!");
        setShowImport(false);
        setImportText("");
      } else {
        setImportMsg("Invalid save file structure.");
      }
    } catch {
      setImportMsg("Invalid JSON format.");
      soundEngine.playSfx("error");
    }
  };

  const showcaseTitle = currentUser.showcaseBadgeId
    ? getAchievementById(currentUser.showcaseBadgeId)?.name || currentUser.showcaseBadgeId
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agent Profile Dossier"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.playSfx("click");
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-matrix-neonCyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${avatar.borderColor} bg-gradient-to-br ${avatar.bgGradient}`}
            >
              {avatar.emoji}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>{currentUser.displayName}</span>
                {currentUser.isGuest ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-matrix-card border border-matrix-border text-gray-400">
                    Guest Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 text-matrix-neonCyan font-bold">
                    Verified Cadet
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">@{currentUser.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.isGuest ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-matrix-neonCyan text-matrix-dark font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Sign Up / Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout();
                  soundEngine.playSfx("click");
                }}
                className="px-2.5 py-1.5 rounded-xl bg-matrix-dark border border-matrix-border text-gray-400 hover:text-matrix-neonRed text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch Account / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playSfx("click");
                onClose();
              }}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-matrix-border/50 transition-colors shrink-0 cursor-pointer"
              type="button"
              aria-label="Close profile modal"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Identity Dossier Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-matrix-dark/80 border border-matrix-border space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-matrix-neonGold" />
                <span className="text-white font-bold">{rankTitle}</span>
                <span className="px-2 py-0.5 rounded-full bg-matrix-card border border-matrix-border text-matrix-neonCyan font-bold">
                  Level {level}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-400 text-[11px]">
                {showcaseTitle && (
                  <div
                    className="flex items-center gap-1 text-matrix-neonGold font-bold px-2 py-0.5 rounded bg-matrix-neonGold/10 border border-matrix-neonGold/30"
                    title="Showcased Honor Badge"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{showcaseTitle}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {!isAuthenticated ? (
              <div className="pt-2 border-t border-matrix-border/50 flex items-center justify-between gap-3 text-xs">
                <p className="text-gray-500 italic">
                  &ldquo;[REDACTED // Identity records and custom bio require cadet login]&rdquo;
                </p>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono shrink-0">
                  <Lock className="w-3 h-3 text-matrix-neonCyan" />
                  <span>CLASSIFIED</span>
                </span>
              </div>
            ) : isEditingBio ? (
              <div className="space-y-3 pt-2 border-t border-matrix-border/50">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Select Identity Avatar:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedAvatar === av.id
                            ? `${av.borderColor} bg-matrix-dark shadow-md ring-1 ring-matrix-neonCyan`
                            : "border-matrix-border bg-matrix-dark/40 opacity-60"
                        }`}
                      >
                        <span className="text-xl">{av.emoji}</span>
                        <span className="text-[9px] text-gray-300 truncate w-full text-center">
                          {av.name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {badges && badges.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Showcase Honor Badge:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-matrix-dark border border-matrix-border">
                      {badges.map((bId) => {
                        const ach = getAchievementById(bId);
                        const isSelected = selectedBadge === bId;
                        return (
                          <button
                            type="button"
                            key={bId}
                            onClick={() => setSelectedBadge(bId)}
                            className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold font-bold shadow-sm"
                                : "border-matrix-border bg-matrix-card/60 text-gray-400 hover:text-white"
                            }`}
                          >
                            <span>{ach?.icon || "🎖️"}</span>
                            <span className="truncate max-w-[120px]">{ach?.name || bId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Cadet Bio / Motto:
                  </label>
                  <textarea
                    rows={2}
                    aria-label="Cadet Bio / Motto"
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-matrix-dark border border-matrix-border text-white text-xs outline-none focus:border-matrix-neonCyan"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1.5 rounded-lg bg-matrix-card border border-matrix-border text-gray-400 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    className="px-3 py-1.5 rounded-lg bg-matrix-accent text-matrix-dark font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Bio</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-matrix-border/50">
                <p className="text-xs text-gray-300 italic">
                  &ldquo;{currentUser.customBio}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingBio(true);
                    setBioText(currentUser.customBio || "");
                    setSelectedAvatar(currentUser.avatarId || "neon-hacker");
                    setSelectedBadge(currentUser.showcaseBadgeId || "");
                  }}
                  className="p-1 text-gray-400 hover:text-matrix-neonCyan transition-colors shrink-0 cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Classified Access Notice (when not logged in) */}
          {!isAuthenticated && (
            <div className="p-4 rounded-2xl bg-matrix-card/90 border border-matrix-neonCyan/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg shadow-matrix-neonCyan/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-matrix-neonCyan/15 border border-matrix-neonCyan/30 flex items-center justify-center text-matrix-neonCyan shrink-0">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    Classified Operative Dossier
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Most telemetry and career details are hidden until login. Authenticate to declassify your record.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-matrix-neonCyan text-matrix-dark font-bold text-xs hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-md shadow-matrix-neonCyan/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Enlist</span>
              </button>
            </div>
          )}

          {/* Core Metrics & Progression Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Career EXP</div>
              <div className="text-base font-bold text-matrix-neonCyan mt-0.5">
                {isAuthenticated ? (
                  `${xp.toLocaleString()} XP`
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-matrix-neonCyan" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Quests Cleared</div>
              <div className="text-base font-bold text-matrix-accent mt-0.5">
                {isAuthenticated ? (
                  `${completedQuests.length} / 24`
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-matrix-accent" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Bosses Slain</div>
              <div className="text-base font-bold text-matrix-neonGold mt-0.5">
                {isAuthenticated ? (
                  `${completedBosses.length} / 12`
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-matrix-neonGold" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Trial Stars</div>
              <div className="text-base font-bold text-yellow-400 mt-0.5">
                {isAuthenticated ? (
                  `${totalStars} ★`
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-yellow-400" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Health / Mana</div>
              <div className="text-xs font-bold text-gray-200 mt-1 flex items-center gap-1.5">
                {isAuthenticated ? (
                  <>
                    <span className="text-matrix-neonRed">{maxHp} HP</span> •{" "}
                    <span className="text-matrix-neonCyan">{maxMana} MP</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-gray-400" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Study Streak</div>
              <div className="text-base font-bold text-matrix-neonGold mt-0.5 flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    <Flame className="w-4 h-4 fill-matrix-neonGold" />
                    <span>{streak} Days</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-matrix-neonGold" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Vault Tasks</div>
              <div className="text-base font-bold text-matrix-neonCyan mt-0.5">
                {isAuthenticated ? (
                  `${completedCurriculumTasks.length} Done`
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-matrix-neonCyan" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-matrix-dark/70 border border-matrix-border">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Chapters</div>
              <div className="text-base font-bold text-matrix-accent mt-0.5">
                {isAuthenticated ? (
                  `${completedChapters.length} / 13`
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-matrix-accent" />
                    <span>CLASSIFIED</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-matrix-dark/80 border border-matrix-border text-xs">
            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  onClose();
                  onOpenLeaderboard();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-matrix-neonGold hover:border-matrix-neonGold transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Matrix Leaderboards</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="profile-file-input"
                  />

                  <button
                    type="button"
                    onClick={handleDownloadSaveFile}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Download Save File JSON"
                  >
                    <Download className="w-3 h-3 text-matrix-neonGold" />
                    <span>Download File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Upload Save File JSON"
                  >
                    <Upload className="w-3 h-3 text-matrix-neonCyan" />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSave}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Save Backup JSON to Clipboard"
                  >
                    <Copy className="w-3 h-3 text-matrix-accent" />
                    <span>{copiedSave ? "Copied!" : "Copy JSON"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImport(!showImport)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Paste Save JSON"
                  >
                    <Edit3 className="w-3 h-3 text-matrix-neonGreen" />
                    <span>Paste JSON</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>Cloud save backup requires login</span>
                </span>
              )}
            </div>
          </div>

          {/* Operation Status Feedback */}
          {importMsg && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
                importMsg.includes("successfully")
                  ? "bg-matrix-neonCyan/10 border-matrix-neonCyan/40 text-matrix-neonCyan"
                  : "bg-matrix-neonRed/10 border-matrix-neonRed/40 text-matrix-neonRed"
              }`}
            >
              <span>{importMsg}</span>
              <button
                type="button"
                onClick={() => setImportMsg(null)}
                className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Import JSON Dropdown */}
          {showImport && (
            <div className="p-3.5 rounded-xl bg-matrix-dark border border-matrix-border space-y-2">
              <div className="text-[11px] text-gray-300">
                Paste exported DevQuest save backup JSON:
              </div>
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"xp": 500, "completedQuests": [...]}'
                className="w-full p-2.5 rounded-xl bg-matrix-card border border-matrix-border text-white text-[11px] outline-none font-mono"
              />
              {importMsg && (
                <div className="text-[11px] text-matrix-neonCyan">{importMsg}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-3 py-1 rounded bg-matrix-card border border-matrix-border text-gray-400 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSave}
                  className="px-3 py-1 rounded bg-matrix-neonCyan text-matrix-dark font-bold text-xs cursor-pointer"
                >
                  Apply Backup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
