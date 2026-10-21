import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateLevel,
  getXpForLevel,
  getNextLevelXp,
  getLevelProgress,
  calculateRank,
  getRankTier,
  calculateStreakBonus,
  calculateHpForLevel,
  calculateManaForLevel,
  RANKS,
} from "../lib/levelSystem";
import { useGameStore } from "../lib/gameStore";

describe("Leveling & EXP System Architecture", () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress();
  });

  describe("Progression Formulas & Progress Mapping", () => {
    it("calculates levels correctly from total XP", () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(24)).toBe(1);
      expect(calculateLevel(25)).toBe(2);
      expect(calculateLevel(99)).toBe(2);
      expect(calculateLevel(100)).toBe(3);
      expect(calculateLevel(225)).toBe(4);
      expect(calculateLevel(400)).toBe(5);
      expect(calculateLevel(2025)).toBe(10);
    });

    it("returns correct XP thresholds for each level", () => {
      expect(getXpForLevel(1)).toBe(0);
      expect(getXpForLevel(2)).toBe(25);
      expect(getXpForLevel(3)).toBe(100);
      expect(getNextLevelXp(1)).toBe(25);
      expect(getNextLevelXp(2)).toBe(100);
      expect(getNextLevelXp(3)).toBe(225);
    });

    it("computes granular level progress percentage and remaining XP accurately", () => {
      const progressZero = getLevelProgress(0);
      expect(progressZero.currentLevel).toBe(1);
      expect(progressZero.nextLevel).toBe(2);
      expect(progressZero.xpIntoCurrentLevel).toBe(0);
      expect(progressZero.xpNeededForNextLevel).toBe(25);
      expect(progressZero.progressPercent).toBe(0);

      // Mid-level at 150 XP (Base L3: 100 XP, Target L4: 225 XP, span: 125 XP, into: 50 XP = 40%)
      const progressMid = getLevelProgress(150);
      expect(progressMid.currentLevel).toBe(3);
      expect(progressMid.nextLevel).toBe(4);
      expect(progressMid.xpIntoCurrentLevel).toBe(50);
      expect(progressMid.xpNeededForNextLevel).toBe(75);
      expect(progressMid.progressPercent).toBe(40);
    });
  });

  describe("Rank Ladder & Realm Milestones", () => {
    it("maps player level to correct developer career rank titles", () => {
      expect(calculateRank(1)).toBe("Novice Byte");
      expect(calculateRank(2)).toBe("Novice Byte");
      expect(calculateRank(3)).toBe("Markup Apprentice");
      expect(calculateRank(5)).toBe("Markup Apprentice");
      expect(calculateRank(6)).toBe("Style Weaver");
      expect(calculateRank(10)).toBe("DOM Enchanter");
      expect(calculateRank(15)).toBe("Type Warden");
      expect(calculateRank(20)).toBe("Component Artisan");
      expect(calculateRank(26)).toBe("Backend Conduit");
      expect(calculateRank(32)).toBe("Relational Sage");
      expect(calculateRank(38)).toBe("DevOps Fleet Admiral");
      expect(calculateRank(44)).toBe("Aegis Sentinel");
      expect(calculateRank(50)).toBe("Full-Stack Grandmaster");
    });

    it("provides complete rank tier lore and metadata", () => {
      const tier10 = getRankTier(10);
      expect(tier10.title).toBe("DOM Enchanter");
      expect(tier10.realmTheme).toBe("Modern JavaScript");
      expect(tier10.lore).toContain("microtask queues");

      const tierGrandmaster = getRankTier(50);
      expect(tierGrandmaster.title).toBe("Full-Stack Grandmaster");
      expect(tierGrandmaster.badgeIcon).toBe("Crown");
    });
  });

  describe("Streak Bonuses & Stat Scaling", () => {
    it("calculates streak bonus multipliers accurately up to 30% cap", () => {
      expect(calculateStreakBonus(1)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(2)).toEqual({ multiplier: 1.05, bonusPercent: 5 });
      expect(calculateStreakBonus(3)).toEqual({ multiplier: 1.10, bonusPercent: 10 });
      expect(calculateStreakBonus(5)).toEqual({ multiplier: 1.20, bonusPercent: 20 });
      expect(calculateStreakBonus(7)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
      expect(calculateStreakBonus(14)).toEqual({ multiplier: 1.30, bonusPercent: 30 }); // Capped at 30%
    });

    it("scales Max HP and Max Mana linearly per level", () => {
      expect(calculateHpForLevel(1)).toBe(100);
      expect(calculateHpForLevel(5)).toBe(140);
      expect(calculateHpForLevel(10)).toBe(190);

      expect(calculateManaForLevel(1)).toBe(50);
      expect(calculateManaForLevel(5)).toBe(70);
      expect(calculateManaForLevel(10)).toBe(95);
    });
  });

  describe("GameStore Integration & Level-Up Notifications", () => {
    it("dispatches level up notification and recent XP gain when gaining experience", () => {
      const store = useGameStore.getState();

      const result = store.addXp(100, "Trial Execution");
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(3);

      const state = useGameStore.getState();
      expect(state.level).toBe(3);
      expect(state.rankTitle).toBe("Markup Apprentice");
      expect(state.pendingLevelUp).toBeDefined();
      expect(state.pendingLevelUp?.newLevel).toBe(3);
      expect(state.pendingLevelUp?.previousLevel).toBe(1);
      expect(state.pendingLevelUp?.isNewRank).toBe(true);
      expect(state.pendingLevelUp?.newRankTitle).toBe("Markup Apprentice");
      expect(state.pendingLevelUp?.unlockedSkillPoints).toBe(2);

      expect(state.recentXpGain).toBeDefined();
      expect(state.recentXpGain?.amount).toBe(100);
      expect(state.recentXpGain?.source).toBe("Trial Execution");

      // Test dismissal
      state.dismissLevelUp();
      expect(useGameStore.getState().pendingLevelUp).toBeNull();

      state.dismissRecentXpGain();
      expect(useGameStore.getState().recentXpGain).toBeNull();
    });

    it("applies streak multiplier to awarded XP in gameStore", () => {
      const store = useGameStore.getState();
      // Set streak to 3 days (10% bonus)
      useGameStore.setState({ streak: 3 });

      store.addXp(100, "Quest Completed");

      const state = useGameStore.getState();
      // 100 * 1.10 = 110 XP
      expect(state.xp).toBe(110);
      expect(state.recentXpGain?.amount).toBe(110);
      expect(state.recentXpGain?.streakBonus).toBe(10);
    });
  });
});
