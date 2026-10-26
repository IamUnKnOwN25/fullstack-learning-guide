"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./gameStore";
import { soundEngine } from "./soundEngine";

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  emoji: string;
  borderColor: string;
  bgGradient: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "cyber-ninja",
    name: "Cyber Ninja",
    role: "Stealth Algorithmic Operator",
    emoji: "🥷",
    borderColor: "border-matrix-neonCyan",
    bgGradient: "from-matrix-neonCyan/20 to-matrix-dark",
  },
  {
    id: "neon-hacker",
    name: "Neon Hacker",
    role: "Full-Stack System Infiltrator",
    emoji: "⚡",
    borderColor: "border-matrix-accent",
    bgGradient: "from-matrix-accent/20 to-matrix-dark",
  },
  {
    id: "code-mage",
    name: "Code Enchanter",
    role: "Async Spellcaster & DOM Alchemist",
    emoji: "🧙‍♂️",
    borderColor: "border-matrix-neonPurple",
    bgGradient: "from-matrix-neonPurple/20 to-matrix-dark",
  },
  {
    id: "matrix-architect",
    name: "Matrix Architect",
    role: "Immutable Container Fleet Admiral",
    emoji: "👑",
    borderColor: "border-matrix-neonGold",
    bgGradient: "from-matrix-neonGold/20 to-matrix-dark",
  },
  {
    id: "synth-ai",
    name: "Synthetic Sentinel",
    role: "Neural Microtask Engine",
    emoji: "🤖",
    borderColor: "border-blue-400",
    bgGradient: "from-blue-500/20 to-matrix-dark",
  },
  {
    id: "quantum-dev",
    name: "Quantum Dev",
    role: "Strict TypeScript Dimension Weaver",
    emoji: "🔮",
    borderColor: "border-pink-400",
    bgGradient: "from-pink-500/20 to-matrix-dark",
  },
];

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  customBio: string;
  title: string;
  joinedAt: string;
  isGuest: boolean;
  showcaseBadgeId: string;
}

interface StoredAccount {
  profile: UserProfile;
  passHash: string;
  gameStatsSnapshot?: {
    xp: number;
    completedQuests: string[];
    completedBosses: string[];
    stars: Record<string, number>;
    unlockedSkills: string[];
    badges: string[];
    completedCurriculumTasks: string[];
    completedChapters: string[];
    streak: number;
  };
}

interface AuthState {
  currentUser: UserProfile;
  accounts: Record<string, StoredAccount>;
  isAuthenticated: boolean;

  login: (username: string, pass: string) => { success: boolean; message: string };
  signup: (
    username: string,
    displayName: string,
    pass: string,
    avatarId?: string
  ) => { success: boolean; message: string };
  logout: () => void;
  continueAsGuest: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  switchAccount: (username: string) => boolean;
}

export function getAvatarById(avatarId?: string | null): AvatarOption {
  if (!avatarId) return AVATAR_OPTIONS[0];
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found || AVATAR_OPTIONS[0];
}

export interface CredentialValidationResult {
  valid: boolean;
  message?: string;
}

export function validateUsername(username: string): CredentialValidationResult {
  const clean = (username || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!clean || clean.length < 3) {
    return { valid: false, message: "Username must be at least 3 alphanumeric characters." };
  }
  return { valid: true };
}

export function validatePassphrase(pass: string): CredentialValidationResult {
  if (!pass || pass.length < 4) {
    return { valid: false, message: "Passphrase must be at least 4 characters." };
  }
  return { valid: true };
}

// Simple deterministic hash for client vault passphrases
export function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export const DEFAULT_GUEST_USER: UserProfile = {
  id: "guest-cadet",
  username: "cadet_guest",
  displayName: "Cadet Recruit",
  avatarId: "neon-hacker",
  customBio: "Operator plugged into DevQuest learning the Web Matrix.",
  title: "Matrix Initiate",
  joinedAt: new Date().toISOString(),
  isGuest: true,
  showcaseBadgeId: "welcome_recruit",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: DEFAULT_GUEST_USER,
      accounts: {},
      isAuthenticated: false,

      signup: (username, displayName, pass, avatarId = "neon-hacker") => {
        const userValidation = validateUsername(username);
        if (!userValidation.valid) {
          return { success: false, message: userValidation.message || "Username must be at least 3 alphanumeric characters." };
        }
        const passValidation = validatePassphrase(pass);
        if (!passValidation.valid) {
          return { success: false, message: passValidation.message || "Passphrase must be at least 4 characters." };
        }
        const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

        const state = get();
        if (state.accounts[cleanUser]) {
          return { success: false, message: "Cadet handle already exists in the terminal database." };
        }

        const gameStoreState = useGameStore.getState();
        const profile: UserProfile = {
          id: `cadet-${Date.now()}`,
          username: cleanUser,
          displayName: displayName.trim() || cleanUser,
          avatarId,
          customBio: "Full-Stack Operator mastering the Web Matrix.",
          title: gameStoreState.rankTitle || "Novice Byte",
          joinedAt: new Date().toISOString(),
          isGuest: false,
          showcaseBadgeId: gameStoreState.badges[0] || "welcome_recruit",
        };

        const passHash = hashPassword(pass);
        const snapshot = {
          xp: gameStoreState.xp,
          completedQuests: gameStoreState.completedQuests,
          completedBosses: gameStoreState.completedBosses,
          stars: gameStoreState.stars,
          unlockedSkills: gameStoreState.unlockedSkills,
          badges: gameStoreState.badges,
          completedCurriculumTasks: gameStoreState.completedCurriculumTasks,
          completedChapters: gameStoreState.completedChapters,
          streak: gameStoreState.streak,
        };

        const updatedAccounts = {
          ...state.accounts,
          [cleanUser]: {
            profile,
            passHash,
            gameStatsSnapshot: snapshot,
          },
        };

        set({
          accounts: updatedAccounts,
          currentUser: profile,
          isAuthenticated: true,
        });

        soundEngine.playSfx("correct");
        return { success: true, message: `Welcome to the Matrix, Operator ${profile.displayName}!` };
      },

      login: (username, pass) => {
        const cleanUser = username.trim().toLowerCase();
        const state = get();
        const account = state.accounts[cleanUser];

        if (!account) {
          return { success: false, message: "Cadet handle not found in terminal registry." };
        }

        if (account.passHash !== hashPassword(pass)) {
          soundEngine.playSfx("error");
          return { success: false, message: "Incorrect security passphrase." };
        }

        // Restore game progress associated with this account
        if (account.gameStatsSnapshot) {
          useGameStore.getState().importSaveData(account.gameStatsSnapshot);
        }

        set({
          currentUser: account.profile,
          isAuthenticated: true,
        });

        soundEngine.playSfx("victory");
        return { success: true, message: `Welcome back, Operator ${account.profile.displayName}!` };
      },

      logout: () => {
        const state = get();
        // Snapshot current game state into account before logout
        if (!state.currentUser.isGuest && state.accounts[state.currentUser.username]) {
          const gameStoreState = useGameStore.getState();
          state.accounts[state.currentUser.username].gameStatsSnapshot = {
            xp: gameStoreState.xp,
            completedQuests: gameStoreState.completedQuests,
            completedBosses: gameStoreState.completedBosses,
            stars: gameStoreState.stars,
            unlockedSkills: gameStoreState.unlockedSkills,
            badges: gameStoreState.badges,
            completedCurriculumTasks: gameStoreState.completedCurriculumTasks,
            completedChapters: gameStoreState.completedChapters,
            streak: gameStoreState.streak,
          };
        }

        set({
          currentUser: DEFAULT_GUEST_USER,
          isAuthenticated: false,
        });
        soundEngine.playSfx("click");
      },

      continueAsGuest: () => {
        set({
          currentUser: DEFAULT_GUEST_USER,
          isAuthenticated: false,
        });
        soundEngine.playSfx("click");
      },

      updateProfile: (data) => {
        const state = get();
        const updated = { ...state.currentUser, ...data };
        const accounts = { ...state.accounts };

        if (!updated.isGuest && accounts[updated.username]) {
          accounts[updated.username].profile = updated;
        }

        set({
          currentUser: updated,
          accounts,
        });
        soundEngine.playSfx("click");
      },

      switchAccount: (username) => {
        const cleanUser = username.trim().toLowerCase();
        const state = get();
        const account = state.accounts[cleanUser];
        if (!account) return false;

        if (account.gameStatsSnapshot) {
          useGameStore.getState().importSaveData(account.gameStatsSnapshot);
        }

        set({
          currentUser: account.profile,
          isAuthenticated: true,
        });
        soundEngine.playSfx("click");
        return true;
      },
    }),
    {
      name: "devquest_auth_vault",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined" || !window.localStorage) return null;
          const str = window.localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined" || !window.localStorage) return;
          window.localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined" || !window.localStorage) return;
          window.localStorage.removeItem(name);
        },
      },
    }
  )
);
