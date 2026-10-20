import { create } from "zustand";
import { persist } from "zustand/middleware";
import { soundEngine } from "./soundEngine";

export interface PlayerStats {
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  streak: number;
  rankTitle: string;
  completedQuests: string[];
  completedBosses: string[];
  unlockedRealms: string[];
  stars: Record<string, number>;
  unlockedSkills: string[];
  badges: string[];
  audioMuted: boolean;
  bgmActive: boolean;
}

interface PlayerActions {
  addXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  completeQuest: (questId: string, realmId: string, stars: number, xpReward: number) => void;
  defeatBoss: (realmId: string, badgeId: string, xpReward: number) => void;
  unlockSkill: (skillId: string, cost: number) => boolean;
  takeDamage: (amount: number) => number;
  healPlayer: (amount: number) => void;
  resetHealth: () => void;
  toggleAudio: () => void;
  toggleBgm: () => void;
  resetProgress: () => void;
}

const RANKS = [
  { level: 1, title: "Novice Byte" },
  { level: 3, title: "Markup Apprentice" },
  { level: 6, title: "Style Weaver" },
  { level: 10, title: "DOM Enchanter" },
  { level: 15, title: "Type Warden" },
  { level: 20, title: "Component Artisan" },
  { level: 26, title: "Backend Conduit" },
  { level: 32, title: "Relational Sage" },
  { level: 40, title: "DevOps Fleet Admiral" },
  { level: 50, title: "Full-Stack Grandmaster" },
];

function calculateRank(level: number): string {
  let currentRank = RANKS[0].title;
  for (const r of RANKS) {
    if (level >= r.level) {
      currentRank = r.title;
    } else {
      break;
    }
  }
  return currentRank;
}

function calculateLevel(xp: number): number {
  // xp curve: Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, etc.
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}

const INITIAL_STATE: PlayerStats = {
  xp: 0,
  level: 1,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  streak: 1,
  rankTitle: "Novice Byte",
  completedQuests: [],
  completedBosses: [],
  unlockedRealms: ["html"],
  stars: {},
  unlockedSkills: [],
  badges: ["welcome_recruit"],
  audioMuted: false,
  bgmActive: false,
};

export const useGameStore = create<PlayerStats & PlayerActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addXp: (amount: number) => {
        const state = get();
        const newXp = state.xp + amount;
        const newLevel = calculateLevel(newXp);
        const leveledUp = newLevel > state.level;
        const newRank = calculateRank(newLevel);

        set({
          xp: newXp,
          level: newLevel,
          rankTitle: newRank,
          maxHp: 100 + (newLevel - 1) * 10,
          hp: leveledUp ? 100 + (newLevel - 1) * 10 : state.hp,
        });

        if (leveledUp) {
          soundEngine.playSfx("level-up");
        }

        return { leveledUp, newLevel };
      },

      completeQuest: (questId: string, realmId: string, stars: number, xpReward: number) => {
        const state = get();
        const completed = new Set(state.completedQuests);
        const isNewCompletion = !completed.has(questId);
        completed.add(questId);

        const currentStars = state.stars[questId] || 0;
        const newStars = { ...state.stars, [questId]: Math.max(currentStars, stars) };

        const badges = new Set(state.badges);
        if (stars === 3) {
          badges.add("speed_coder");
        }

        set({
          completedQuests: Array.from(completed),
          stars: newStars,
          badges: Array.from(badges),
        });

        if (isNewCompletion) {
          get().addXp(xpReward);
          soundEngine.playSfx("correct");
        }
      },

      defeatBoss: (realmId: string, badgeId: string, xpReward: number) => {
        const state = get();
        const bosses = new Set(state.completedBosses);
        const isNewBoss = !bosses.has(realmId);
        bosses.add(realmId);

        const badges = new Set(state.badges);
        if (badgeId) badges.add(badgeId);
        if (bosses.size === 12) {
          badges.add("master_of_the_matrix");
        }

        // Unlock next realm in sequence
        const REALM_ORDER = [
          "html",
          "css",
          "javascript",
          "typescript",
          "react",
          "backend",
          "databases",
          "devops",
          "testing",
          "cs",
          "security",
          "capstone",
        ];

        const currentIndex = REALM_ORDER.indexOf(realmId);
        const realms = new Set(state.unlockedRealms);
        if (currentIndex !== -1 && currentIndex + 1 < REALM_ORDER.length) {
          realms.add(REALM_ORDER[currentIndex + 1]);
        }

        set({
          completedBosses: Array.from(bosses),
          badges: Array.from(badges),
          unlockedRealms: Array.from(realms),
          hp: state.maxHp,
        });

        if (isNewBoss) {
          get().addXp(xpReward);
          soundEngine.playSfx("victory");
        }
      },

      unlockSkill: (skillId: string, cost: number) => {
        const state = get();
        // Skill points = level - unlockedSkills.length
        const availablePoints = state.level - state.unlockedSkills.length;
        if (availablePoints < cost || state.unlockedSkills.includes(skillId)) {
          return false;
        }

        const badges = new Set(state.badges);
        badges.add("skill_pioneer");
        if (skillId === "matrix_grandmaster") {
          badges.add("grandmaster_matrix");
        }

        set({
          unlockedSkills: [...state.unlockedSkills, skillId],
          badges: Array.from(badges),
        });
        soundEngine.playSfx("skill-unlock");
        return true;
      },

      takeDamage: (amount: number) => {
        const state = get();
        const newHp = Math.max(0, state.hp - amount);
        set({ hp: newHp });
        soundEngine.playSfx("error");
        return newHp;
      },

      healPlayer: (amount: number) => {
        const state = get();
        set({ hp: Math.min(state.maxHp, state.hp + amount) });
        soundEngine.playSfx("heal");
      },

      resetHealth: () => {
        const state = get();
        set({ hp: state.maxHp });
      },

      toggleAudio: () => {
        const state = get();
        const newMuted = !state.audioMuted;
        soundEngine.setMuted(newMuted);
        set({ audioMuted: newMuted });
      },

      toggleBgm: () => {
        const state = get();
        const newBgm = soundEngine.toggleBgm(!state.bgmActive);
        set({ bgmActive: newBgm });
      },

      resetProgress: () => {
        set({ ...INITIAL_STATE });
      },
    }),
    {
      name: "devquest_player_save",
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
