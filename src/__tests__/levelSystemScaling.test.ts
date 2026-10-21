import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  getXpForLevel,
  calculateHpForLevel,
  calculateManaForLevel,
  calculateRank,
  getRankTier,
  RANKS
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
  });

  describe("Character Stat Scaling (Level 1 to 100)", () => {
    it("should scale HP linearly without NaN or negative values up to level 100", () => {
      for (let level = 1; level <= 100; level++) {
        const hp = calculateHpForLevel(level);

        // Ensure HP is valid and scales properly
        expect(hp).toBeGreaterThanOrEqual(100);
        expect(Number.isNaN(hp)).toBe(false);

        // Verify standard logic (100 + (level - 1) * 10)
        expect(hp).toBe(100 + (level - 1) * 10);
      }
    });

    it("should scale Mana linearly without NaN or negative values up to level 100", () => {
      for (let level = 1; level <= 100; level++) {
        const mana = calculateManaForLevel(level);

        // Ensure Mana is valid and scales properly
        expect(mana).toBeGreaterThanOrEqual(50);
        expect(Number.isNaN(mana)).toBe(false);

        // Verify standard logic (50 + (level - 1) * 5)
        expect(mana).toBe(50 + (level - 1) * 5);
      }
    });
  });

  describe("Rank Title & Tier Evaluation (Level 1 to 100)", () => {
    it("should correctly evaluate rank title and tier without breaking at high levels", () => {
      for (let level = 1; level <= 100; level++) {
        const title = calculateRank(level);
        const tier = getRankTier(level);

        // Basic safety checks
        expect(title).toBeDefined();
        expect(typeof title).toBe("string");
        expect(tier).toBeDefined();
        expect(tier.title).toBe(title);

        // Find the expected tier by finding the highest tier where tier.level <= current level
        let expectedTier = RANKS[0];
        for(const r of RANKS) {
            if(level >= r.level) {
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
  });
});
