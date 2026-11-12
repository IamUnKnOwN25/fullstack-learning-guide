import { describe, it, expect, vi } from "vitest";
import {
  calculateTotalEarnedSkillPoints,
  calculateSpentSkillPoints,
  calculateAvailableSkillPoints,
  validateSkillUnlock,
  calculateSkillBuildSummary,
  getRecommendedNextSkills,
  validateSkillRefund,
} from "../lib/skillCalculator";

// Mock the skills data
vi.mock("../data/skills", () => ({
  SKILL_TREE: [
    { id: "skill_1", cost: 1, unlockedByDefault: true, category: "foundations", tier: 1 },
    { id: "skill_2", cost: 2, category: "frontend", tier: 1 },
    { id: "skill_3", cost: 3, prerequisiteId: "skill_2", category: "frontend", tier: 2 },
    { id: "skill_4", cost: 4, category: "backend", tier: 2 },
    { id: "skill_5", cost: 2, category: "devops", tier: 1, requiredLevel: 5 },
    { id: "skill_6", cost: 3, category: "devops", tier: 2, prerequisites: ["skill_5"] },
  ],
}));

describe("skillCalculator", () => {
  describe("calculateTotalEarnedSkillPoints", () => {
    it("returns level as earned skill points", () => {
      expect(calculateTotalEarnedSkillPoints(1)).toBe(1);
      expect(calculateTotalEarnedSkillPoints(5)).toBe(5);
      expect(calculateTotalEarnedSkillPoints(10)).toBe(10);
    });

    it("does not return negative points", () => {
      expect(calculateTotalEarnedSkillPoints(0)).toBe(0);
      expect(calculateTotalEarnedSkillPoints(-5)).toBe(0);
    });

    it("handles non-finite, NaN, and fractional level inputs safely", () => {
      expect(calculateTotalEarnedSkillPoints(NaN)).toBe(0);
      expect(calculateTotalEarnedSkillPoints(Infinity)).toBe(0);
      expect(calculateTotalEarnedSkillPoints(-Infinity)).toBe(0);
      expect(calculateTotalEarnedSkillPoints(4.9)).toBe(4);
      expect(calculateTotalEarnedSkillPoints(null as any)).toBe(0);
    });
  });

  describe("calculateSpentSkillPoints", () => {
    it("returns 0 when no skills are unlocked", () => {
      expect(calculateSpentSkillPoints([])).toBe(0);
    });

    it("calculates total cost of unlocked skills", () => {
      expect(calculateSpentSkillPoints(["skill_2"])).toBe(2);
      expect(calculateSpentSkillPoints(["skill_2", "skill_4"])).toBe(6);
    });

    it("ignores unknown skill ids", () => {
      expect(calculateSpentSkillPoints(["skill_2", "unknown_skill"])).toBe(2);
    });
  });

  describe("calculateAvailableSkillPoints", () => {
    it("calculates available points correctly", () => {
      expect(calculateAvailableSkillPoints(5, ["skill_2"])).toBe(3); // 5 - 2 = 3
      expect(calculateAvailableSkillPoints(10, ["skill_2", "skill_4"])).toBe(4); // 10 - 6 = 4
    });

    it("does not return negative available points", () => {
      expect(calculateAvailableSkillPoints(1, ["skill_2", "skill_4"])).toBe(0); // 1 - 6 = -5 -> 0
      expect(calculateAvailableSkillPoints(1, ["skill_2"])).toBe(0); // 1 - 2 = -1 -> 0
    });

    it("returns 0 when level is NaN or non-numeric", () => {
      expect(calculateAvailableSkillPoints(NaN, ["skill_2"])).toBe(0);
      expect(calculateAvailableSkillPoints(NaN, [])).toBe(0);
      expect(calculateAvailableSkillPoints(null as any, [])).toBe(0);
      expect(calculateAvailableSkillPoints(undefined as any, [])).toBe(0);
    });

    it("handles non-finite infinity values safely", () => {
      expect(calculateAvailableSkillPoints(Infinity, [])).toBe(0);
      expect(calculateAvailableSkillPoints(-Infinity, [])).toBe(0);
    });

    it("sanitizes fractional levels and enforces bounds", () => {
      expect(calculateAvailableSkillPoints(5.8, ["skill_2"])).toBe(3); // floor(5.8) = 5 -> 5 - 2 = 3
    });
  });

  describe("validateSkillUnlock", () => {
    it("fails if skill is not found", () => {
      const result = validateSkillUnlock("unknown_skill", 10, []);
      expect(result).toEqual({ canUnlock: false, reason: "Skill not found." });
    });

    it("fails with invalid skill IDs", () => {
      expect(validateSkillUnlock("", 10, [])).toEqual({
        canUnlock: false,
        reason: "Invalid skill ID.",
      });
      expect(validateSkillUnlock("   ", 10, [])).toEqual({
        canUnlock: false,
        reason: "Invalid skill ID.",
      });
      expect(validateSkillUnlock(null as any, 10, [])).toEqual({
        canUnlock: false,
        reason: "Invalid skill ID.",
      });
      expect(validateSkillUnlock(undefined as any, 10, [])).toEqual({
        canUnlock: false,
        reason: "Invalid skill ID.",
      });
    });

    it("fails when level / available points is non-finite", () => {
      expect(validateSkillUnlock("skill_2", NaN, [])).toEqual({
        canUnlock: false,
        reason: "Not enough skill points.",
      });
      expect(validateSkillUnlock("skill_2", Infinity, [])).toEqual({
        canUnlock: false,
        reason: "Not enough skill points.",
      });
      expect(validateSkillUnlock("skill_2", -Infinity, [])).toEqual({
        canUnlock: false,
        reason: "Not enough skill points.",
      });
      expect(validateSkillUnlock("skill_2", null as any, [])).toEqual({
        canUnlock: false,
        reason: "Not enough skill points.",
      });
    });

    it("fails when level / available points is negative", () => {
      expect(validateSkillUnlock("skill_2", -1, [])).toEqual({
        canUnlock: false,
        reason: "Not enough skill points.",
      });
      expect(validateSkillUnlock("skill_2", -10, [])).toEqual({
        canUnlock: false,
        reason: "Not enough skill points.",
      });
    });

    it("fails if skill is already unlocked", () => {
      const result = validateSkillUnlock("skill_2", 10, ["skill_2"]);
      expect(result).toEqual({ canUnlock: false, reason: "Skill is already unlocked." });
    });

    it("fails if skill is unlocked by default", () => {
      const result = validateSkillUnlock("skill_1", 10, []);
      expect(result).toEqual({ canUnlock: false, reason: "Skill is already unlocked." });
    });

    it("fails if prerequisite is missing", () => {
      const result = validateSkillUnlock("skill_3", 10, []);
      expect(result).toEqual({ canUnlock: false, reason: "Prerequisite skill is missing." });
    });

    it("fails if not enough skill points", () => {
      const result = validateSkillUnlock("skill_4", 2, []); // Need 4 points, have 2
      expect(result).toEqual({ canUnlock: false, reason: "Not enough skill points." });
    });

    it("fails at exact boundary deficit of 1 point", () => {
      const result = validateSkillUnlock("skill_4", 3, []); // Need 4 points, have 3
      expect(result).toEqual({ canUnlock: false, reason: "Not enough skill points." });
    });

    it("succeeds at exact boundary of available points equaling cost", () => {
      const result = validateSkillUnlock("skill_4", 4, []); // Need 4 points, have 4
      expect(result).toEqual({ canUnlock: true });
    });

    it("succeeds if all conditions are met", () => {
      const result = validateSkillUnlock("skill_2", 10, []);
      expect(result).toEqual({ canUnlock: true });
    });

    it("succeeds if prerequisite is met and points are sufficient", () => {
      const result = validateSkillUnlock("skill_3", 10, ["skill_2"]);
      expect(result).toEqual({ canUnlock: true });
    });
  });

  describe("calculateSkillBuildSummary", () => {
    it("returns zeroed summary for empty array", () => {
      expect(calculateSkillBuildSummary([])).toEqual({
        totalUnlocked: 0,
        totalCostSpent: 0,
        byCategory: {},
        byTier: {},
      });
    });

    it("handles null, undefined, and non-array safely", () => {
      expect(calculateSkillBuildSummary(null as any)).toEqual({
        totalUnlocked: 0,
        totalCostSpent: 0,
        byCategory: {},
        byTier: {},
      });
      expect(calculateSkillBuildSummary(undefined as any)).toEqual({
        totalUnlocked: 0,
        totalCostSpent: 0,
        byCategory: {},
        byTier: {},
      });
      expect(calculateSkillBuildSummary("not_an_array" as any)).toEqual({
        totalUnlocked: 0,
        totalCostSpent: 0,
        byCategory: {},
        byTier: {},
      });
    });

    it("tallies unique valid skills, costs, categories, and tiers correctly", () => {
      const summary = calculateSkillBuildSummary(["skill_2", "skill_4"]);
      expect(summary.totalUnlocked).toBe(2);
      expect(summary.totalCostSpent).toBe(6);
      expect(summary.byCategory).toEqual({
        frontend: 1,
        backend: 1,
      });
      expect(summary.byTier).toEqual({
        1: 1,
        2: 1,
      });
    });

    it("deduplicates identical unlocked skill IDs", () => {
      const summary = calculateSkillBuildSummary(["skill_2", "skill_2", "skill_2"]);
      expect(summary.totalUnlocked).toBe(1);
      expect(summary.totalCostSpent).toBe(2);
      expect(summary.byCategory).toEqual({ frontend: 1 });
      expect(summary.byTier).toEqual({ 1: 1 });
    });

    it("safely ignores unknown skill IDs, empty strings, and whitespace", () => {
      const summary = calculateSkillBuildSummary([
        "skill_2",
        "unknown_skill",
        "",
        "   ",
        null as any,
      ]);
      expect(summary.totalUnlocked).toBe(1);
      expect(summary.totalCostSpent).toBe(2);
      expect(summary.byCategory).toEqual({ frontend: 1 });
      expect(summary.byTier).toEqual({ 1: 1 });
    });
  });

  describe("getRecommendedNextSkills", () => {
    it("returns empty array for invalid level or points", () => {
      expect(getRecommendedNextSkills(["skill_1"], NaN, 5)).toEqual([]);
      expect(getRecommendedNextSkills(["skill_1"], Infinity, 5)).toEqual([]);
      expect(getRecommendedNextSkills(["skill_1"], 5, NaN)).toEqual([]);
      expect(getRecommendedNextSkills(["skill_1"], 5, -1)).toEqual([]);
    });

    it("recommends locked skills that satisfy level, cost, and prerequisites", () => {
      const recommended = getRecommendedNextSkills(["skill_1"], 5, 3);
      expect(recommended).toEqual(["skill_2", "skill_5"]);
    });

    it("sorts recommendations by cost ascending, then tier ascending", () => {
      const recommended = getRecommendedNextSkills(
        ["skill_1", "skill_2", "skill_5"],
        10,
        10
      );
      expect(recommended).toEqual(["skill_3", "skill_6", "skill_4"]);
    });

    it("excludes already unlocked skills and unlockedByDefault skills", () => {
      const recommended = getRecommendedNextSkills([], 10, 10);
      expect(recommended).not.toContain("skill_1");
    });

    it("excludes skills when player level is lower than requiredLevel", () => {
      const recommendedAtLevel4 = getRecommendedNextSkills(["skill_1"], 4, 5);
      expect(recommendedAtLevel4).toContain("skill_2");
      expect(recommendedAtLevel4).not.toContain("skill_5");

      const recommendedAtLevel5 = getRecommendedNextSkills(["skill_1"], 5, 5);
      expect(recommendedAtLevel5).toContain("skill_5");
    });

    it("excludes skills when availablePoints is less than cost", () => {
      const recommended = getRecommendedNextSkills(["skill_1"], 10, 1);
      expect(recommended).toEqual([]);
    });

    it("unlocks recommendations with prerequisites array", () => {
      const withoutPrereq = getRecommendedNextSkills(["skill_1"], 10, 5);
      expect(withoutPrereq).not.toContain("skill_6");

      const withPrereq = getRecommendedNextSkills(["skill_1", "skill_5"], 10, 5);
      expect(withPrereq).toContain("skill_6");
    });
  });

  describe("validateSkillRefund", () => {
    it("rejects invalid, empty, or missing skill IDs", () => {
      expect(validateSkillRefund("", ["skill_2"])).toEqual({
        canRefund: false,
        dependentSkillIds: [],
      });
      expect(validateSkillRefund("   ", ["skill_2"])).toEqual({
        canRefund: false,
        dependentSkillIds: [],
      });
      expect(validateSkillRefund(null as any, ["skill_2"])).toEqual({
        canRefund: false,
        dependentSkillIds: [],
      });
    });

    it("rejects unknown skill IDs", () => {
      expect(validateSkillRefund("unknown_skill", ["skill_2"])).toEqual({
        canRefund: false,
        dependentSkillIds: [],
      });
    });

    it("rejects skills that are not currently unlocked", () => {
      expect(validateSkillRefund("skill_2", ["skill_4"])).toEqual({
        canRefund: false,
        dependentSkillIds: [],
      });
      expect(validateSkillRefund("skill_2", [])).toEqual({
        canRefund: false,
        dependentSkillIds: [],
      });
    });

    it("allows refund when no unlocked downstream skills depend on it", () => {
      const result = validateSkillRefund("skill_4", ["skill_2", "skill_4"]);
      expect(result).toEqual({
        canRefund: true,
        dependentSkillIds: [],
      });
    });

    it("blocks refund when a downstream skill with prerequisiteId is unlocked", () => {
      const result = validateSkillRefund("skill_2", ["skill_2", "skill_3"]);
      expect(result).toEqual({
        canRefund: false,
        dependentSkillIds: ["skill_3"],
      });
    });

    it("allows refund when dependent skill exists in tree but is NOT unlocked", () => {
      const result = validateSkillRefund("skill_2", ["skill_2"]);
      expect(result).toEqual({
        canRefund: true,
        dependentSkillIds: [],
      });
    });

    it("blocks refund when a downstream skill with prerequisites array is unlocked", () => {
      const result = validateSkillRefund("skill_5", ["skill_5", "skill_6"]);
      expect(result).toEqual({
        canRefund: false,
        dependentSkillIds: ["skill_6"],
      });
    });

    it("deduplicates dependent skill IDs in output", () => {
      const result = validateSkillRefund("skill_2", [
        "skill_2",
        "skill_3",
        "skill_3",
      ]);
      expect(result.canRefund).toBe(false);
      expect(result.dependentSkillIds).toEqual(["skill_3"]);
    });
  });
});
