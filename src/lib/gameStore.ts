import { create } from "zustand";
import { persist } from "zustand/middleware";
import { soundEngine } from "./soundEngine";
import { validateSkillUnlock } from "./skillCalculator";
import {
  calculateLevel,
  calculateRank,
  calculateHpForLevel,
  calculateManaForLevel,
  calculateStreakBonus,
  RANKS,
  LevelUpNotification,
  XpGainEvent,
} from "./levelSystem";
import { deserializeSaveData } from "./saveManager";

export { calculateLevel, calculateRank, RANKS };
export type { LevelUpNotification, XpGainEvent };

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
  completedCurriculumTasks: string[];
  curriculumTaskAwards?: Record<string, number>;
  completedChapters: string[];
  claimedAchievements: string[];
  audioMuted: boolean;
  bgmActive: boolean;
  pendingLevelUp: LevelUpNotification | null;
  recentXpGain: XpGainEvent | null;
}

interface PlayerActions {
  addXp: (amount: number, source?: string) => { leveledUp: boolean; newLevel: number };
  removeXp: (amount: number, source?: string) => { newXp: number; newLevel: number };
  dismissLevelUp: () => void;
  dismissRecentXpGain: () => void;
  completeQuest: (questId: string, realmId: string, stars: number, xpReward: number) => void;
  defeatBoss: (realmId: string, badgeId: string, xpReward: number) => void;
  unlockSkill: (skillId: string, cost: number) => boolean;
  respecSkills: () => void;
  claimAchievement: (achievementId: string, xpReward: number) => boolean;
  unlockAllRealms: () => void;
  toggleCurriculumTask: (taskId: string) => boolean;
  completeChapter: (filename: string, xpReward?: number) => boolean;
  importSaveData: (data: Partial<PlayerStats> | string) => boolean;
  takeDamage: (amount: number) => number;
  healPlayer: (amount: number) => void;
  resetHealth: () => void;
  toggleAudio: () => void;
  toggleBgm: () => void;
  resetProgress: () => void;
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
  completedCurriculumTasks: [],
  curriculumTaskAwards: {},
  completedChapters: [],
  claimedAchievements: [],
  audioMuted: false,
  bgmActive: false,
  pendingLevelUp: null,
  recentXpGain: null,
};

export const useGameStore = create<PlayerStats & PlayerActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addXp: (amount: number, source: string = "Quest Activity") => {
        if (!Number.isFinite(amount) || amount <= 0) {
          return { leveledUp: false, newLevel: get().level };
        }
        const state = get();
        const { multiplier, bonusPercent } = calculateStreakBonus(state.streak);
        const finalAmount = Math.max(1, Math.round(amount * multiplier));
        const streakBonus = finalAmount - amount;

        const newXp = state.xp + finalAmount;
        const newLevel = calculateLevel(newXp);
        const previousLevel = state.level;
        const leveledUp = newLevel > previousLevel;
        const previousRank = state.rankTitle;
        const newRank = calculateRank(newLevel);
        const isNewRank = newRank !== previousRank;

        const maxHp = calculateHpForLevel(newLevel);
        const maxMana = calculateManaForLevel(newLevel);

        const pendingLevelUp: LevelUpNotification | null = leveledUp
          ? {
              previousLevel,
              newLevel,
              newRankTitle: newRank,
              isNewRank,
              unlockedSkillPoints: newLevel - previousLevel,
              maxHp,
              maxMana,
            }
          : state.pendingLevelUp;

        set({
          xp: newXp,
          level: newLevel,
          rankTitle: newRank,
          maxHp,
          hp: leveledUp ? maxHp : state.hp,
          maxMana,
          mana: leveledUp ? maxMana : state.mana,
          pendingLevelUp,
          recentXpGain: {
            amount: finalAmount,
            source,
            streakBonus,
            timestamp: Date.now(),
          },
        });

        if (leveledUp) {
          soundEngine.playSfx("level-up");
        }

        return { leveledUp, newLevel };
      },

      removeXp: (amount: number, source: string = "Task Deduction") => {
        const state = get();
        const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
        const newXp = Math.max(0, state.xp - safeAmount);
        const newLevel = calculateLevel(newXp);
        const newRank = calculateRank(newLevel);
        const maxHp = calculateHpForLevel(newLevel);
        const maxMana = calculateManaForLevel(newLevel);

        set({
          xp: newXp,
          level: newLevel,
          rankTitle: newRank,
          maxHp,
          hp: Math.min(state.hp, maxHp),
          maxMana,
          mana: Math.min(state.mana, maxMana),
          recentXpGain: null,
          pendingLevelUp: null,
        });

        return { newXp, newLevel };
      },

      dismissLevelUp: () => set({ pendingLevelUp: null }),
      dismissRecentXpGain: () => set({ recentXpGain: null }),

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
          get().addXp(xpReward, `Quest: ${questId}`);
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
          get().addXp(xpReward, `Boss Vanquished: ${realmId.toUpperCase()}`);
          soundEngine.playSfx("victory");
        }
      },

      unlockSkill: (skillId: string, cost: number) => {
        const state = get();
        const validation = validateSkillUnlock(skillId, state.level, state.unlockedSkills);

        if (!validation.canUnlock) {
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

      respecSkills: () => {
        set({ unlockedSkills: [] });
        soundEngine.playSfx("click");
      },

      claimAchievement: (achievementId: string, xpReward: number) => {
        const state = get();
        const claimed = new Set(state.claimedAchievements || []);
        if (claimed.has(achievementId)) return false;

        claimed.add(achievementId);
        set({ claimedAchievements: Array.from(claimed) });
        get().addXp(xpReward, "Achievement Claimed");
        soundEngine.playSfx("victory");
        return true;
      },

      unlockAllRealms: () => {
        set({
          unlockedRealms: [
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
          ],
        });
        soundEngine.playSfx("level-up");
      },

      toggleCurriculumTask: (taskId: string) => {
        const state = get();
        const tasks = new Set(state.completedCurriculumTasks || []);
        const awards: Record<string, number> = { ...(state.curriculumTaskAwards || {}) };
        const isChecking = !tasks.has(taskId);

        if (isChecking) {
          tasks.add(taskId);
          const { multiplier } = calculateStreakBonus(state.streak);
          const finalAward = Math.max(1, Math.round(10 * multiplier));
          awards[taskId] = finalAward;

          set({
            completedCurriculumTasks: Array.from(tasks),
            curriculumTaskAwards: awards,
          });

          get().addXp(10, "Curriculum Task");
          soundEngine.playSfx("correct");
          return true;
        } else {
          tasks.delete(taskId);
          const xpToDeduct = awards[taskId] || 10;
          delete awards[taskId];

          set({
            completedCurriculumTasks: Array.from(tasks),
            curriculumTaskAwards: awards,
          });

          get().removeXp(xpToDeduct, "Curriculum Task Unchecked");
          soundEngine.playSfx("click");
          return false;
        }
      },

      completeChapter: (filename: string, xpReward: number = 50) => {
        const state = get();
        const chapters = new Set(state.completedChapters || []);
        if (chapters.has(filename)) {
          return false;
        }
        chapters.add(filename);
        set({ completedChapters: Array.from(chapters) });
        get().addXp(xpReward, `Chapter Mastered: ${filename.replace(/\.md$/, "")}`);
        soundEngine.playSfx("victory");
        return true;
      },

      importSaveData: (data: Partial<PlayerStats> | string) => {
        let validatedData: Partial<PlayerStats> | null = null;

        if (typeof data === "string") {
            validatedData = deserializeSaveData(data);
        } else if (data && typeof data === "object") {
            validatedData = deserializeSaveData(JSON.stringify(data));
        }

        if (!validatedData) {
            console.error("importSaveData received invalid data format");
            return false;
        }

        const safeXp = typeof validatedData.xp === "number" && validatedData.xp >= 0 && Number.isFinite(validatedData.xp) ? validatedData.xp : 0;
        const safeLevel = calculateLevel(safeXp);
        const safeRank = calculateRank(safeLevel);
        const safeMaxHp = calculateHpForLevel(safeLevel);
        const safeMaxMana = calculateManaForLevel(safeLevel);

        set({
          xp: safeXp,
          level: safeLevel,
          rankTitle: safeRank,
          maxHp: safeMaxHp,
          hp: safeMaxHp,
          maxMana: safeMaxMana,
          mana: safeMaxMana,
          completedQuests: Array.isArray(validatedData.completedQuests) ? validatedData.completedQuests : [],
          completedBosses: Array.isArray(validatedData.completedBosses) ? validatedData.completedBosses : [],
          unlockedRealms:
            Array.isArray(validatedData.unlockedRealms) && validatedData.unlockedRealms.length > 0
              ? validatedData.unlockedRealms
              : ["html"],
          stars: validatedData.stars && typeof validatedData.stars === "object" ? validatedData.stars : {},
          unlockedSkills: Array.isArray(validatedData.unlockedSkills) ? validatedData.unlockedSkills : [],
          badges:
            Array.isArray(validatedData.badges) && validatedData.badges.length > 0
              ? validatedData.badges
              : ["welcome_recruit"],
          completedCurriculumTasks: Array.isArray(validatedData.completedCurriculumTasks)
            ? validatedData.completedCurriculumTasks
            : [],
          curriculumTaskAwards:
            validatedData.curriculumTaskAwards && typeof validatedData.curriculumTaskAwards === "object"
              ? validatedData.curriculumTaskAwards
              : {},
          completedChapters: Array.isArray(validatedData.completedChapters) ? validatedData.completedChapters : [],
          claimedAchievements: Array.isArray(validatedData.claimedAchievements) ? validatedData.claimedAchievements : [],
          audioMuted: typeof validatedData.audioMuted === "boolean" ? validatedData.audioMuted : false,
          bgmActive: typeof validatedData.bgmActive === "boolean" ? validatedData.bgmActive : false,
          streak: typeof validatedData.streak === "number" && validatedData.streak > 0 && Number.isFinite(validatedData.streak) ? validatedData.streak : 1,
        });
        soundEngine.playSfx("level-up");
        return true;
      },

      takeDamage: (amount: number) => {
        const state = get();
        const safeDamage = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
        const newHp = Math.max(0, state.hp - safeDamage);
        set({ hp: newHp });
        soundEngine.playSfx("error");
        return newHp;
      },

      healPlayer: (amount: number) => {
        const state = get();
        const safeHeal = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
        set({ hp: Math.min(state.maxHp, state.hp + safeHeal) });
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
          try {
            const str = window.localStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch {
            return null;
          }
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
