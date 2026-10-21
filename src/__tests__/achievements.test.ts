import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, RARITY_CONFIG } from "../data/achievements";
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

  describe("ACHIEVEMENTS Structure", () => {
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
});
