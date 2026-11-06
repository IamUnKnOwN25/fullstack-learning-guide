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
  evaluateLevelUp,
  createLevelUpNotification,
  getXpDifference,
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
      expect(calculateLevel(-50)).toBe(1);
      expect(calculateLevel(24)).toBe(1);
      expect(calculateLevel(25)).toBe(2);
      expect(calculateLevel(99)).toBe(2);
      expect(calculateLevel(100)).toBe(3);
      expect(calculateLevel(225)).toBe(4);
      expect(calculateLevel(400)).toBe(5);
      expect(calculateLevel(2025)).toBe(10);
    });

    it("evaluates milestone level 50 boundary XP correctly", () => {
      // Level 50 requires (50 - 1)^2 * 25 = 2401 * 25 = 60,025 XP
      expect(getXpForLevel(50)).toBe(60025);
      expect(calculateLevel(60024)).toBe(49);
      expect(calculateLevel(60025)).toBe(50);
    });

    it("returns correct XP thresholds for each level and clamps negative levels", () => {
      expect(getXpForLevel(1)).toBe(0);
      expect(getXpForLevel(2)).toBe(25);
      expect(getXpForLevel(3)).toBe(100);
      expect(getXpForLevel(0)).toBe(0);
      expect(getXpForLevel(-10)).toBe(0);

      expect(getNextLevelXp(1)).toBe(25);
      expect(getNextLevelXp(2)).toBe(100);
      expect(getNextLevelXp(3)).toBe(225);
      expect(getNextLevelXp(0)).toBe(25);
      expect(getNextLevelXp(-5)).toBe(25);
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

      // Near boundary at 224 XP
      const progressNear = getLevelProgress(224);
      expect(progressNear.currentLevel).toBe(3);
      expect(progressNear.xpNeededForNextLevel).toBe(1);
      expect(progressNear.progressPercent).toBeCloseTo(99.2, 1);
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

    it("verifies RANKS array structural integrity and strictly ascending requirements", () => {
      expect(RANKS.length).toBe(11);
      for (let i = 0; i < RANKS.length; i++) {
        const tier = RANKS[i];
        expect(tier.level).toBeGreaterThan(0);
        expect(tier.title.trim().length).toBeGreaterThan(0);
        expect(tier.subtitle.trim().length).toBeGreaterThan(0);
        expect(tier.realmTheme.trim().length).toBeGreaterThan(0);
        expect(tier.color.trim().length).toBeGreaterThan(0);
        expect(tier.badgeIcon.trim().length).toBeGreaterThan(0);
        expect(tier.lore.trim().length).toBeGreaterThan(0);

        if (i > 0) {
          expect(tier.level).toBeGreaterThan(RANKS[i - 1].level);
        }
      }
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
      expect(calculateStreakBonus(14)).toEqual({ multiplier: 1.30, bonusPercent: 30 });
    });

    it("scales Max HP and Max Mana linearly per level and handles out-of-range levels", () => {
      expect(calculateHpForLevel(1)).toBe(100);
      expect(calculateHpForLevel(5)).toBe(140);
      expect(calculateHpForLevel(10)).toBe(190);
      expect(calculateHpForLevel(50)).toBe(590);
      expect(calculateHpForLevel(0)).toBe(100);
      expect(calculateHpForLevel(-10)).toBe(100);

      expect(calculateManaForLevel(1)).toBe(50);
      expect(calculateManaForLevel(5)).toBe(70);
      expect(calculateManaForLevel(10)).toBe(95);
      expect(calculateManaForLevel(50)).toBe(295);
      expect(calculateManaForLevel(0)).toBe(50);
      expect(calculateManaForLevel(-5)).toBe(50);
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

  describe("evaluateLevelUp Progression & Multi-Level Logic", () => {
    it("returns didLevelUp: false when earned XP does not cross level threshold", () => {
      const result = evaluateLevelUp(0, 10);
      expect(result.didLevelUp).toBe(false);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(1);
      expect(result.levelsGained).toBe(0);
      expect(result.previousRank).toBe("Novice Byte");
      expect(result.newRank).toBe("Novice Byte");
      expect(result.isNewRank).toBe(false);
    });

    it("evaluates single-level gain without crossing rank boundary", () => {
      // 0 XP (Level 1) + 25 XP = 25 XP (Level 2, both Novice Byte)
      const result = evaluateLevelUp(0, 25);
      expect(result.didLevelUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(2);
      expect(result.levelsGained).toBe(1);
      expect(result.previousRank).toBe("Novice Byte");
      expect(result.newRank).toBe("Novice Byte");
      expect(result.isNewRank).toBe(false);
    });

    it("evaluates single-level gain that crosses rank boundary", () => {
      // 25 XP (Level 2, Novice Byte) + 75 XP = 100 XP (Level 3, Markup Apprentice)
      const result = evaluateLevelUp(25, 75);
      expect(result.didLevelUp).toBe(true);
      expect(result.previousLevel).toBe(2);
      expect(result.newLevel).toBe(3);
      expect(result.levelsGained).toBe(1);
      expect(result.previousRank).toBe("Novice Byte");
      expect(result.newRank).toBe("Markup Apprentice");
      expect(result.isNewRank).toBe(true);
    });

    it("handles multi-level leaps and multiple rank boundary crossings", () => {
      // 0 XP (Level 1, Novice Byte) + 625 XP = 625 XP (Level 6, Style Weaver)
      const result = evaluateLevelUp(0, 625);
      expect(result.didLevelUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(6);
      expect(result.levelsGained).toBe(5);
      expect(result.previousRank).toBe("Novice Byte");
      expect(result.newRank).toBe("Style Weaver");
      expect(result.isNewRank).toBe(true);
    });

    it("evaluates massive XP surge reaching capstone level 50", () => {
      const result = evaluateLevelUp(0, 60025);
      expect(result.didLevelUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(50);
      expect(result.levelsGained).toBe(49);
      expect(result.previousRank).toBe("Novice Byte");
      expect(result.newRank).toBe("Full-Stack Grandmaster");
      expect(result.isNewRank).toBe(true);
    });

    it("handles non-finite, negative, and NaN inputs gracefully", () => {
      const nanCurrent = evaluateLevelUp(NaN, 100);
      expect(nanCurrent.previousLevel).toBe(1);
      expect(nanCurrent.newLevel).toBe(3);
      expect(nanCurrent.didLevelUp).toBe(true);

      const nanEarned = evaluateLevelUp(100, NaN);
      expect(nanEarned.previousLevel).toBe(3);
      expect(nanEarned.newLevel).toBe(3);
      expect(nanEarned.didLevelUp).toBe(false);

      const negativeBoth = evaluateLevelUp(-100, -50);
      expect(negativeBoth.previousLevel).toBe(1);
      expect(negativeBoth.newLevel).toBe(1);
      expect(negativeBoth.didLevelUp).toBe(false);

      const infinityInput = evaluateLevelUp(Infinity, 100);
      expect(infinityInput.previousLevel).toBe(1);
      expect(infinityInput.newLevel).toBe(3);
    });
  });

  describe("createLevelUpNotification Factory & Sanitization", () => {
    it("returns null when newLevel is less than or equal to previousLevel", () => {
      expect(createLevelUpNotification(1, 1)).toBeNull();
      expect(createLevelUpNotification(5, 5)).toBeNull();
      expect(createLevelUpNotification(10, 4)).toBeNull();
      expect(createLevelUpNotification(50, 1)).toBeNull();
    });

    it("sanitizes non-finite and sub-1 inputs to minimum level 1", () => {
      expect(createLevelUpNotification(NaN, 1)).toBeNull();
      expect(createLevelUpNotification(1, NaN)).toBeNull();
      expect(createLevelUpNotification(NaN, NaN)).toBeNull();
      expect(createLevelUpNotification(-10, -5)).toBeNull();
      expect(createLevelUpNotification(0, 0)).toBeNull();

      // -5 clamps to 1; 3 remains 3 -> valid level up from 1 to 3
      const clampedFrom = createLevelUpNotification(-5, 3);
      expect(clampedFrom).not.toBeNull();
      expect(clampedFrom?.previousLevel).toBe(1);
      expect(clampedFrom?.newLevel).toBe(3);
      expect(clampedFrom?.unlockedSkillPoints).toBe(2);

      // Infinity clamps to 1
      const infFrom = createLevelUpNotification(Infinity, 4);
      expect(infFrom).not.toBeNull();
      expect(infFrom?.previousLevel).toBe(1);
      expect(infFrom?.newLevel).toBe(4);
    });

    it("floors decimal / floating point level inputs", () => {
      const result = createLevelUpNotification(1.9, 4.2);
      expect(result).not.toBeNull();
      expect(result?.previousLevel).toBe(1);
      expect(result?.newLevel).toBe(4);
      expect(result?.unlockedSkillPoints).toBe(3);
    });

    it("creates complete notification payload for single-level increase without rank change", () => {
      const notif = createLevelUpNotification(1, 2);
      expect(notif).not.toBeNull();
      expect(notif?.previousLevel).toBe(1);
      expect(notif?.newLevel).toBe(2);
      expect(notif?.rankTitle).toBe("Novice Byte");
      expect(notif?.newRankTitle).toBe("Novice Byte");
      expect(notif?.isRankUpgrade).toBe(false);
      expect(notif?.isNewRank).toBe(false);
      expect(notif?.unlockedSkillPoints).toBe(1);
      expect(notif?.maxHp).toBe(110);
      expect(notif?.maxMana).toBe(55);
      expect(notif?.statBonuses).toEqual({ maxHp: 110, maxMana: 55 });
    });

    it("creates complete notification payload across rank boundary transitions", () => {
      // Level 2 -> 3 transition (Novice Byte -> Markup Apprentice)
      const notifL3 = createLevelUpNotification(2, 3);
      expect(notifL3).not.toBeNull();
      expect(notifL3?.previousLevel).toBe(2);
      expect(notifL3?.newLevel).toBe(3);
      expect(notifL3?.rankTitle).toBe("Markup Apprentice");
      expect(notifL3?.isRankUpgrade).toBe(true);
      expect(notifL3?.unlockedSkillPoints).toBe(1);
      expect(notifL3?.statBonuses).toEqual({ maxHp: 120, maxMana: 60 });

      // Level 5 -> 6 transition (Markup Apprentice -> Style Weaver)
      const notifL6 = createLevelUpNotification(5, 6);
      expect(notifL6?.rankTitle).toBe("Style Weaver");
      expect(notifL6?.isRankUpgrade).toBe(true);
      expect(notifL6?.statBonuses).toEqual({ maxHp: 150, maxMana: 75 });

      // Level 49 -> 50 transition (Aegis Sentinel -> Full-Stack Grandmaster)
      const notifL50 = createLevelUpNotification(49, 50);
      expect(notifL50?.rankTitle).toBe("Full-Stack Grandmaster");
      expect(notifL50?.isRankUpgrade).toBe(true);
      expect(notifL50?.statBonuses).toEqual({ maxHp: 590, maxMana: 295 });
    });

    it("creates complete notification payload for multi-level jumps", () => {
      const notif = createLevelUpNotification(1, 10);
      expect(notif).not.toBeNull();
      expect(notif?.previousLevel).toBe(1);
      expect(notif?.newLevel).toBe(10);
      expect(notif?.rankTitle).toBe("DOM Enchanter");
      expect(notif?.isRankUpgrade).toBe(true);
      expect(notif?.unlockedSkillPoints).toBe(9);
      expect(notif?.statBonuses).toEqual({ maxHp: 190, maxMana: 95 });
    });
  });

  describe("getXpDifference Delta Calculations", () => {
    it("calculates exact XP delta between sequential levels", () => {
      // L1 -> L2: 25 - 0 = 25
      expect(getXpDifference(1, 2)).toBe(25);
      // L2 -> L3: 100 - 25 = 75
      expect(getXpDifference(2, 3)).toBe(75);
      // L3 -> L4: 225 - 100 = 125
      expect(getXpDifference(3, 4)).toBe(125);
      // L4 -> L5: 400 - 225 = 175
      expect(getXpDifference(4, 5)).toBe(175);
    });

    it("calculates multi-level XP delta accurately", () => {
      // L1 -> L5: 400 - 0 = 400
      expect(getXpDifference(1, 5)).toBe(400);
      // L1 -> L10: 2025 - 0 = 2025
      expect(getXpDifference(1, 10)).toBe(2025);
      // L5 -> L10: 2025 - 400 = 1625
      expect(getXpDifference(5, 10)).toBe(1625);
      // L1 -> L50: 60025 - 0 = 60025
      expect(getXpDifference(1, 50)).toBe(60025);
    });

    it("returns 0 when toLevel is less than or equal to fromLevel", () => {
      expect(getXpDifference(1, 1)).toBe(0);
      expect(getXpDifference(10, 10)).toBe(0);
      expect(getXpDifference(5, 4)).toBe(0);
      expect(getXpDifference(50, 1)).toBe(0);
    });

    it("returns 0 when inputs are invalid, non-finite, sub-1, or NaN", () => {
      expect(getXpDifference(0, 5)).toBe(0);
      expect(getXpDifference(-5, 5)).toBe(0);
      expect(getXpDifference(1, 0)).toBe(0);
      expect(getXpDifference(1, -10)).toBe(0);
      expect(getXpDifference(NaN, 5)).toBe(0);
      expect(getXpDifference(1, NaN)).toBe(0);
      expect(getXpDifference(NaN, NaN)).toBe(0);
      expect(getXpDifference(Infinity, 5)).toBe(0);
      expect(getXpDifference(1, Infinity)).toBe(0);
      expect(getXpDifference(-Infinity, 10)).toBe(0);
    });

    it("floors decimal inputs and returns correct XP difference", () => {
      // 1.8 floors to 1 (0 XP), 3.9 floors to 3 (100 XP) -> delta 100
      expect(getXpDifference(1.8, 3.9)).toBe(100);
      // 2.2 floors to 2 (25 XP), 4.7 floors to 4 (225 XP) -> delta 200
      expect(getXpDifference(2.2, 4.7)).toBe(200);
      // 2.1 floors to 2, 2.9 floors to 2 -> toLevel <= fromLevel -> 0
      expect(getXpDifference(2.1, 2.9)).toBe(0);
    });
  });
});
