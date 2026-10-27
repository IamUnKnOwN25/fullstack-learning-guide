import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  RARITY_CONFIG,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getAchievementById,
  calculateAchievementProgress,
} from "../data/achievements";
import { PlayerStats } from "../lib/gameStore";

describe("Achievements Data & Logic", () => {
  const createMockStats = (overrides?: Partial<PlayerStats>): PlayerStats => ({
    xp: 0,
    level: 1,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    streak: 0,
    rankTitle: "Initiate",
    completedQuests: [],
    completedBosses: [],
    unlockedRealms: [],
    stars: {},
    unlockedSkills: [],
    badges: [],
    completedCurriculumTasks: [],
    curriculumTaskAwards: {},
    completedChapters: [],
    claimedAchievements: [],
    audioMuted: false,
    bgmActive: false,
    pendingLevelUp: null,
    recentXpGain: null,
    ...overrides,
  });

  describe("RARITY_CONFIG", () => {
    it("should contain standard rarity stylings", () => {
      expect(RARITY_CONFIG).toHaveProperty("common");
      expect(RARITY_CONFIG).toHaveProperty("rare");
      expect(RARITY_CONFIG).toHaveProperty("epic");
      expect(RARITY_CONFIG).toHaveProperty("legendary");
      expect(RARITY_CONFIG).toHaveProperty("mythic");

      expect(RARITY_CONFIG.common.label).toBe("Common");
      expect(RARITY_CONFIG.rare.label).toBe("Rare");
      expect(RARITY_CONFIG.epic.label).toBe("Epic");
      expect(RARITY_CONFIG.legendary.label).toBe("Legendary");
      expect(RARITY_CONFIG.mythic.label).toBe("Mythic");
    });
  });

  describe("ACHIEVEMENTS Structure & Integrity", () => {
    it("should export an array of valid achievements", () => {
      expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
      expect(ACHIEVEMENTS.length).toBeGreaterThan(0);

      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement).toHaveProperty("id");
        expect(typeof achievement.id).toBe("string");
        expect(achievement).toHaveProperty("category");
        expect(["bosses", "quests", "scholar", "mastery"]).toContain(achievement.category);
        expect(achievement).toHaveProperty("rarity");
        expect(["common", "rare", "epic", "legendary", "mythic"]).toContain(achievement.rarity);
        expect(typeof achievement.checkProgress).toBe("function");
      });
    });

    it("should ensure all achievement IDs are unique", () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should provide non-empty strings and positive XP rewards for every achievement", () => {
      ACHIEVEMENTS.forEach((a) => {
        expect(a.id.trim().length).toBeGreaterThan(0);
        expect(a.name.trim().length).toBeGreaterThan(0);
        expect(a.description.trim().length).toBeGreaterThan(0);
        expect(a.icon.trim().length).toBeGreaterThan(0);
        expect(a.xpReward).toBeGreaterThan(0);
        if (a.badgeId !== undefined) {
          expect(typeof a.badgeId).toBe("string");
          expect(a.badgeId.trim().length).toBeGreaterThan(0);
        }
      });
    });

    it("should populate all 4 categories and all 5 rarities across achievements", () => {
      const categories = new Set(ACHIEVEMENTS.map((a) => a.category));
      expect(categories.has("bosses")).toBe(true);
      expect(categories.has("quests")).toBe(true);
      expect(categories.has("scholar")).toBe(true);
      expect(categories.has("mastery")).toBe(true);

      const rarities = new Set(ACHIEVEMENTS.map((a) => a.rarity));
      expect(rarities.has("common")).toBe(true);
      expect(rarities.has("rare")).toBe(true);
      expect(rarities.has("epic")).toBe(true);
      expect(rarities.has("legendary")).toBe(true);
      expect(rarities.has("mythic")).toBe(true);
    });

    it("should ensure checkProgress returns non-negative current and positive target values", () => {
      const mock = createMockStats();
      ACHIEVEMENTS.forEach((a) => {
        const progress = a.checkProgress(mock);
        expect(progress.current).toBeGreaterThanOrEqual(0);
        expect(progress.target).toBeGreaterThan(0);
        expect(typeof progress.isUnlocked).toBe("boolean");
      });
    });
  });

  describe("checkProgress Logic - Bosses", () => {
    const getBossAchievement = (id: string) => ACHIEVEMENTS.find(a => a.id === id)!;

    it("should validate 'first_blood_boss'", () => {
      const a = getBossAchievement("first_blood_boss");
      expect(a.checkProgress(createMockStats()).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedBosses: ["html"] })).isUnlocked).toBe(true);
    });

    it("should validate 'slayer_of_hydra'", () => {
      const a = getBossAchievement("slayer_of_hydra");
      expect(a.checkProgress(createMockStats()).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedBosses: ["css"] })).isUnlocked).toBe(true);
    });

    it("should validate 'slayer_of_kraken'", () => {
      const a = getBossAchievement("slayer_of_kraken");
      expect(a.checkProgress(createMockStats()).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedBosses: ["javascript"] })).isUnlocked).toBe(true);
    });

    it("should validate 'slayer_of_any'", () => {
      const a = getBossAchievement("slayer_of_any");
      expect(a.checkProgress(createMockStats()).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedBosses: ["typescript"] })).isUnlocked).toBe(true);
    });

    it("should validate 'boss_halfway'", () => {
      const a = getBossAchievement("boss_halfway");
      expect(a.checkProgress(createMockStats({ completedBosses: ["1", "2", "3", "4", "5"] })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedBosses: ["1", "2", "3", "4", "5", "6"] })).isUnlocked).toBe(true);
    });

    it("should validate 'all_bosses_slain'", () => {
      const a = getBossAchievement("all_bosses_slain");
      const elevenBosses = Array(11).fill("boss");
      const twelveBosses = Array(12).fill("boss");
      expect(a.checkProgress(createMockStats({ completedBosses: elevenBosses })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedBosses: twelveBosses })).isUnlocked).toBe(true);
    });
  });

  describe("checkProgress Logic - Quests", () => {
    const getQuestAchievement = (id: string) => ACHIEVEMENTS.find(a => a.id === id)!;

    it("should validate 'welcome_initiate'", () => {
      const a = getQuestAchievement("welcome_initiate");
      expect(a.checkProgress(createMockStats()).isUnlocked).toBe(true);
    });

    it("should validate 'speed_coder'", () => {
      const a = getQuestAchievement("speed_coder");
      expect(a.checkProgress(createMockStats({ stars: { "q1": 2 } })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ stars: { "q1": 3 } })).isUnlocked).toBe(true);
    });

    it("should validate 'quest_milestone_10'", () => {
      const a = getQuestAchievement("quest_milestone_10");
      expect(a.checkProgress(createMockStats({ completedQuests: Array(9).fill("q") })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedQuests: Array(10).fill("q") })).isUnlocked).toBe(true);
    });

    it("should validate 'quest_all_24'", () => {
      const a = getQuestAchievement("quest_all_24");
      expect(a.checkProgress(createMockStats({ completedQuests: Array(23).fill("q") })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedQuests: Array(24).fill("q") })).isUnlocked).toBe(true);
    });

    it("should validate 'stars_milestone_50'", () => {
      const a = getQuestAchievement("stars_milestone_50");
      expect(a.checkProgress(createMockStats({ stars: { "q1": 3, "q2": 46 } })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ stars: { "q1": 10, "q2": 40 } })).isUnlocked).toBe(true);
    });
  });

  describe("checkProgress Logic - Scholar", () => {
    const getScholarAchievement = (id: string) => ACHIEVEMENTS.find(a => a.id === id)!;

    it("should validate 'tasks_milestone_25'", () => {
      const a = getScholarAchievement("tasks_milestone_25");
      expect(a.checkProgress(createMockStats({ completedCurriculumTasks: Array(24).fill("t") })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedCurriculumTasks: Array(25).fill("t") })).isUnlocked).toBe(true);
    });

    it("should validate 'chapters_milestone_5'", () => {
      const a = getScholarAchievement("chapters_milestone_5");
      expect(a.checkProgress(createMockStats({ completedChapters: Array(4).fill("c") })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedChapters: Array(5).fill("c") })).isUnlocked).toBe(true);
    });

    it("should validate 'chapters_all_13'", () => {
      const a = getScholarAchievement("chapters_all_13");
      expect(a.checkProgress(createMockStats({ completedChapters: Array(12).fill("c") })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ completedChapters: Array(13).fill("c") })).isUnlocked).toBe(true);
    });
  });

  describe("checkProgress Logic - Mastery", () => {
    const getMasteryAchievement = (id: string) => ACHIEVEMENTS.find(a => a.id === id)!;

    it("should validate 'skill_pioneer'", () => {
      const a = getMasteryAchievement("skill_pioneer");
      expect(a.checkProgress(createMockStats({ unlockedSkills: [] })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ unlockedSkills: ["skill1"] })).isUnlocked).toBe(true);
    });

    it("should validate 'streak_7_days'", () => {
      const a = getMasteryAchievement("streak_7_days");
      expect(a.checkProgress(createMockStats({ streak: 6 })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ streak: 7 })).isUnlocked).toBe(true);
    });

    it("should validate 'level_25'", () => {
      const a = getMasteryAchievement("level_25");
      expect(a.checkProgress(createMockStats({ level: 24 })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ level: 25 })).isUnlocked).toBe(true);
    });

    it("should validate 'matrix_archmage_mastery'", () => {
      const a = getMasteryAchievement("matrix_archmage_mastery");
      expect(a.checkProgress(createMockStats({ level: 49, unlockedSkills: ["matrix_grandmaster"] })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ level: 50, unlockedSkills: [] })).isUnlocked).toBe(false);
      expect(a.checkProgress(createMockStats({ level: 50, unlockedSkills: ["matrix_grandmaster"] })).isUnlocked).toBe(true);
    });
  });

  describe("Helper Functions & Progress Calculation", () => {
    it("getAchievementsByCategory filters properly or returns all", () => {
      expect(getAchievementsByCategory("all").length).toBe(ACHIEVEMENTS.length);
      expect(getAchievementsByCategory(undefined).length).toBe(ACHIEVEMENTS.length);

      const bosses = getAchievementsByCategory("bosses");
      expect(bosses.length).toBeGreaterThan(0);
      expect(bosses.every((a) => a.category === "bosses")).toBe(true);

      const quests = getAchievementsByCategory("quests");
      expect(quests.length).toBeGreaterThan(0);
      expect(quests.every((a) => a.category === "quests")).toBe(true);

      const scholar = getAchievementsByCategory("scholar");
      expect(scholar.length).toBeGreaterThan(0);
      expect(scholar.every((a) => a.category === "scholar")).toBe(true);

      const mastery = getAchievementsByCategory("mastery");
      expect(mastery.length).toBeGreaterThan(0);
      expect(mastery.every((a) => a.category === "mastery")).toBe(true);
    });

    it("getAchievementsByRarity filters correctly by rarity tier", () => {
      const legendaries = getAchievementsByRarity("legendary");
      expect(legendaries.length).toBeGreaterThan(0);
      expect(legendaries.every((a) => a.rarity === "legendary")).toBe(true);

      const mythics = getAchievementsByRarity("mythic");
      expect(mythics.length).toBeGreaterThan(0);
      expect(mythics.every((a) => a.rarity === "mythic")).toBe(true);
    });

    it("getAchievementById returns matching achievement or undefined", () => {
      const found = getAchievementById("first_blood_boss");
      expect(found).toBeDefined();
      expect(found?.name).toBe("Semantic Warden");

      expect(getAchievementById("non_existent_id")).toBeUndefined();
      expect(getAchievementById("")).toBeUndefined();
    });

    it("calculateAchievementProgress calculates initial stats correctly (includes welcome_initiate)", () => {
      const stats = createMockStats();
      const progress = calculateAchievementProgress(stats);

      expect(progress.total).toBe(ACHIEVEMENTS.length);
      // welcome_initiate is unlocked by default for any recruit plugging into DevQuest
      expect(progress.unlocked).toBe(1);
      expect(progress.claimed).toBe(0);
      expect(progress.claimable).toBe(1);
      expect(progress.percentUnlocked).toBe(Math.round((1 / ACHIEVEMENTS.length) * 100));
      expect(progress.totalXpAvailable).toBeGreaterThan(0);
      expect(progress.totalXpClaimed).toBe(0);
    });

    it("calculateAchievementProgress tracks unlocked and claimed achievements with XP", () => {
      const stats = createMockStats({
        completedBosses: ["html"], // Unlocks first_blood_boss (100 XP)
        claimedAchievements: ["welcome_initiate", "first_blood_boss"],
      });
      const progress = calculateAchievementProgress(stats);

      // welcome_initiate + first_blood_boss
      expect(progress.unlocked).toBe(2);
      expect(progress.claimed).toBe(2);
      expect(progress.claimable).toBe(0);
      expect(progress.percentUnlocked).toBe(Math.round((2 / ACHIEVEMENTS.length) * 100));
      expect(progress.totalXpClaimed).toBe(150); // 50 + 100
    });

    it("calculateAchievementProgress correctly reports claimable count when unlocked but unclaimed", () => {
      const stats = createMockStats({
        completedBosses: ["html"], // first_blood_boss unlocked (welcome_initiate is also unlocked = 2 total)
        unlockedSkills: ["some_skill"], // skill_pioneer unlocked = 3 total
        claimedAchievements: ["welcome_initiate"], // only 1 claimed
      });
      const progress = calculateAchievementProgress(stats);

      expect(progress.unlocked).toBe(3);
      expect(progress.claimed).toBe(1);
      expect(progress.claimable).toBe(2); // first_blood_boss and skill_pioneer are claimable
    });
  });
});
