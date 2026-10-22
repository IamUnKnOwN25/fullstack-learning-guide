"use client";

import React, { useState } from "react";
import { useAuthStore, AVATAR_OPTIONS } from "@/lib/authStore";
import { soundEngine } from "@/lib/soundEngine";
import {
  X,
  User,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: Props) {
  const { login, signup, accounts, switchAccount, continueAsGuest, isAuthenticated } =
    useAuthStore();

  const [mode, setMode] = useState<"login" | "signup" | "accounts">(initialMode);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("neon-hacker");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const savedAccountList = Object.values(accounts || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === "signup") {
      const result = signup(username, displayName || username, password, selectedAvatarId);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.message);
      }
    } else if (mode === "login") {
      const result = login(username, password);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-matrix-card border border-matrix-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-slideUp font-mono">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-matrix-neonCyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-matrix-border bg-matrix-dark/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 flex items-center justify-center text-matrix-neonCyan shrink-0">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Matrix Terminal Access
              </h2>
              <p className="text-xs text-gray-400">
                Manage your Operator profile, save progression & rank status
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSfx("click");
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-matrix-border/50 transition-colors shrink-0"
            type="button" aria-label="Close authentication modal" title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-matrix-border bg-matrix-dark/50 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mode === "login"
                ? "border-matrix-neonCyan text-matrix-neonCyan font-bold bg-matrix-card/60"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx("click");
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              mode === "signup"
                ? "border-matrix-neonCyan text-matrix-neonCyan font-bold bg-matrix-card/60"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Cadet</span>
          </button>

          {savedAccountList.length > 0 && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setMode("accounts");
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 px-3 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                mode === "accounts"
                  ? "border-matrix-neonCyan text-matrix-neonCyan font-bold bg-matrix-card/60"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Accounts ({savedAccountList.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-matrix-neonRed/15 border border-matrix-neonRed/50 text-matrix-neonRed text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-matrix-accent/15 border border-matrix-accent/50 text-matrix-accent text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "accounts" ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-400">
                Select a saved Matrix Cadet identity to load into this terminal:
              </div>
              <div className="space-y-2">
                {savedAccountList.map((acc) => {
                  const avatar =
                    AVATAR_OPTIONS.find((a) => a.id === acc.profile.avatarId) ||
                    AVATAR_OPTIONS[0];

                  return (
                    <div
                      key={acc.profile.username}
                      className="p-3.5 rounded-xl bg-matrix-dark/80 border border-matrix-border hover:border-matrix-neonCyan flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${avatar.borderColor} bg-gradient-to-br ${avatar.bgGradient}`}
                        >
                          {avatar.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {acc.profile.displayName}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            @{acc.profile.username} • {acc.profile.title}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const ok = switchAccount(acc.profile.username);
                          if (ok) {
                            soundEngine.playSfx("victory");
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-matrix-neonCyan text-matrix-dark font-bold text-xs hover:opacity-90 transition-opacity shrink-0"
                      >
                        Switch
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs text-gray-300 font-bold mb-1.5">
                    Select Cybernetic Insignia Avatar:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVATAR_OPTIONS.map((av) => {
                      const isSelected = selectedAvatarId === av.id;
                      return (
                        <button
                          type="button"
                          key={av.id}
                          onClick={() => {
                            soundEngine.playSfx("click");
                            setSelectedAvatarId(av.id);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? `${av.borderColor} bg-matrix-dark shadow-md ring-1 ring-matrix-neonCyan`
                              : "border-matrix-border bg-matrix-dark/50 hover:border-gray-500 opacity-70"
                          }`}
                        >
                          <span className="text-xl">{av.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-white truncate">
                              {av.name}
                            </div>
                            <div className="text-[9px] text-gray-400 truncate">
                              {av.role.split(" ")[0]}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="block text-xs text-gray-300 font-bold mb-1">
                    Display Name (Call-sign):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Neo Architect, Ada Coder"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-matrix-dark border border-matrix-border text-white text-xs outline-none focus:border-matrix-neonCyan"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-300 font-bold mb-1">
                  Terminal Handle (Username):
                </label>
                <div className="relative">
                  <span className="text-matrix-neonCyan font-bold absolute left-3 top-1/2 -translate-y-1/2 text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    aria-label="Terminal Handle (Username)"
                    placeholder="e.g. neobyte_99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-matrix-dark border border-matrix-border text-white text-xs outline-none focus:border-matrix-neonCyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-bold mb-1">
                  Security Passphrase:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    aria-label="Security Passphrase"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-matrix-dark border border-matrix-border text-white text-xs outline-none focus:border-matrix-neonCyan"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-matrix-neonCyan hover:bg-matrix-neonCyan/90 text-matrix-dark font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-matrix-neonCyan/20 transition-all cursor-pointer mt-4"
              >
                <span>{mode === "signup" ? "Initialize Operator Profile" : "Authenticate Terminal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Guest Mode Fallback */}
          <div className="pt-2 border-t border-matrix-border/50 text-center">
            <button
              type="button"
              onClick={() => {
                continueAsGuest();
                onClose();
              }}
              className="text-xs text-gray-400 hover:text-matrix-accent transition-colors underline cursor-pointer"
            >
              Continue as Guest Recruit (Offline Session)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
