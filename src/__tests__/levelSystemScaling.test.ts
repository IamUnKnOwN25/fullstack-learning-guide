import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  getXpForLevel,
  getNextLevelXp,
  getLevelProgress,
  calculateHpForLevel,
  calculateManaForLevel,
  calculateRank,
  getRankTier,
  calculateStreakBonus,
  evaluateLevelUp,
  RANKS,
} from "../lib/levelSystem";

describe("Level System Mathematical Scaling", () => {
  describe("XP and Level Progression (Level 1 to 100)", () => {
    it("should correctly calculate XP required for every level up to 100", () => {
      for (let level = 1; level <= 100; level++) {
        const requiredXp = getXpForLevel(level);

        // Ensure that XP never goes negative
        expect(requiredXp).toBeGreaterThanOrEqual(0);

        // Check that calculateLevel properly reverses getXpForLevel logic
        const calculatedLevel = calculateLevel(requiredXp);
        expect(calculatedLevel).toBe(level);

        // Extra check to verify progression increases smoothly (except at level 1 where XP is 0)
        if (level > 1) {
          const previousLevelXp = getXpForLevel(level - 1);
          expect(requiredXp).toBeGreaterThan(previousLevelXp);
        }
      }
    });

    it("should correctly handle extremely high XP without breaking (NaN or negative levels)", () => {
      const extremeXp = 10000000;
      const extremeLevel = calculateLevel(extremeXp);
      expect(extremeLevel).toBeGreaterThan(0);
      expect(Number.isNaN(extremeLevel)).toBe(false);
    });

    it("handles non-finite, negative, and NaN XP gracefully", () => {
      expect(calculateLevel(NaN)).toBe(1);
      expect(calculateLevel(Infinity)).toBe(1);
      expect(calculateLevel(-500)).toBe(1);
      expect(getXpForLevel(NaN)).toBe(0);
      expect(getNextLevelXp(NaN)).toBe(25);
    });
  });

  describe("Character Stat Scaling (Level 1 to 100)", () => {
    it("should scale HP linearly without NaN or negative values up to level 100", () => {
      for (let level = 1; level <= 100; level++) {
        const hp = calculateHpForLevel(level);
        expect(hp).toBeGreaterThanOrEqual(100);
        expect(Number.isNaN(hp)).toBe(false);
        expect(hp).toBe(100 + (level - 1) * 10);
      }
    });

    it("should scale Mana linearly without NaN or negative values up to level 100", () => {
      for (let level = 1; level <= 100; level++) {
        const mana = calculateManaForLevel(level);
        expect(mana).toBeGreaterThanOrEqual(50);
        expect(Number.isNaN(mana)).toBe(false);
        expect(mana).toBe(50 + (level - 1) * 5);
      }
    });

    it("shields HP and Mana calculations against NaN and non-finite level inputs", () => {
      expect(calculateHpForLevel(NaN)).toBe(100);
      expect(calculateHpForLevel(-10)).toBe(100);
      expect(calculateManaForLevel(NaN)).toBe(50);
      expect(calculateManaForLevel(-5)).toBe(50);
    });
  });

  describe("Rank Title & Tier Evaluation (Level 1 to 100)", () => {
    it("should correctly evaluate rank title and tier without breaking at high levels", () => {
      for (let level = 1; level <= 100; level++) {
        const title = calculateRank(level);
        const tier = getRankTier(level);

        expect(title).toBeDefined();
        expect(typeof title).toBe("string");
        expect(tier).toBeDefined();
        expect(tier.title).toBe(title);

        let expectedTier = RANKS[0];
        for (const r of RANKS) {
          if (level >= r.level) {
            expectedTier = r;
          }
        }

        expect(title).toBe(expectedTier.title);
        expect(tier).toEqual(expectedTier);
      }
    });

    it("should fall back to the highest available rank for extreme levels", () => {
      const maxRank = RANKS[RANKS.length - 1];
      const extremeLevel = 999;

      const title = calculateRank(extremeLevel);
      const tier = getRankTier(extremeLevel);

      expect(title).toBe(maxRank.title);
      expect(tier).toEqual(maxRank);
    });

    it("falls back to Novice Byte for NaN and non-finite levels", () => {
      expect(calculateRank(NaN)).toBe("Novice Byte");
      expect(getRankTier(NaN).title).toBe("Novice Byte");
    });
  });

  describe("Streak Bonus Calculation", () => {
    it("scales linearly by 5% per day starting at day 2", () => {
      expect(calculateStreakBonus(1)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(2)).toEqual({ multiplier: 1.05, bonusPercent: 5 });
      expect(calculateStreakBonus(5)).toEqual({ multiplier: 1.2, bonusPercent: 20 });
    });

    it("caps streak bonus at 30% for 7+ days", () => {
      expect(calculateStreakBonus(7)).toEqual({ multiplier: 1.3, bonusPercent: 30 });
      expect(calculateStreakBonus(30)).toEqual({ multiplier: 1.3, bonusPercent: 30 });
    });

    it("handles non-finite and negative streak days safely", () => {
      expect(calculateStreakBonus(NaN)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
      expect(calculateStreakBonus(-5)).toEqual({ multiplier: 1.0, bonusPercent: 0 });
    });
  });

  describe("evaluateLevelUp", () => {
    it("detects when no level up occurs", () => {
      const result = evaluateLevelUp(0, 10);
      expect(result.didLevelUp).toBe(false);
      expect(result.levelsGained).toBe(0);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(1);
      expect(result.isNewRank).toBe(false);
    });

    it("detects single level up and rank change", () => {
      // Level 1 -> Level 3 requires reaching 100 XP (which unlocks Markup Apprentice)
      const result = evaluateLevelUp(0, 100);
      expect(result.didLevelUp).toBe(true);
      expect(result.previousLevel).toBe(1);
      expect(result.newLevel).toBe(3);
      expect(result.levelsGained).toBe(2);
      expect(result.previousRank).toBe("Novice Byte");
      expect(result.newRank).toBe("Markup Apprentice");
      expect(result.isNewRank).toBe(true);
    });

    it("detects massive multi-level surge from large XP drop", () => {
      const result = evaluateLevelUp(0, 10000);
      expect(result.didLevelUp).toBe(true);
      expect(result.newLevel).toBe(21);
      expect(result.levelsGained).toBe(20);
      expect(result.newRank).toBe("Component Artisan");
      expect(result.isNewRank).toBe(true);
    });

    it("handles non-finite and NaN inputs gracefully without throwing", () => {
      const result = evaluateLevelUp(NaN, NaN);
      expect(result.didLevelUp).toBe(false);
      expect(result.levelsGained).toBe(0);
      expect(result.previousLevel).toBe(1);
    });
  });

  describe("getLevelProgress", () => {
    it("calculates progress percentage correctly within current level bracket", () => {
      // Level 1: 0 to 25 XP. At 12.5 XP, progress should be 50%
      const prog = getLevelProgress(12.5);
      expect(prog.currentLevel).toBe(1);
      expect(prog.nextLevel).toBe(2);
      expect(prog.progressPercent).toBe(50);
      expect(prog.xpNeededForNextLevel).toBe(12.5);
    });

    it("handles 0 and NaN XP gracefully", () => {
      const prog0 = getLevelProgress(0);
      expect(prog0.progressPercent).toBe(0);
      expect(prog0.currentLevel).toBe(1);

      const progNaN = getLevelProgress(NaN);
      expect(progNaN.progressPercent).toBe(0);
      expect(progNaN.currentLevel).toBe(1);
    });
  });
});
