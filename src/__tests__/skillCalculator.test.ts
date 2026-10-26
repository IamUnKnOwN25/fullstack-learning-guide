import { describe, it, expect, vi } from "vitest";
import {
  calculateTotalEarnedSkillPoints,
  calculateSpentSkillPoints,
  calculateAvailableSkillPoints,
  validateSkillUnlock,
} from "../lib/skillCalculator";

// Mock the skills data
vi.mock("../data/skills", () => ({
  SKILL_TREE: [
    { id: "skill_1", cost: 1, unlockedByDefault: true },
    { id: "skill_2", cost: 2 },
    { id: "skill_3", cost: 3, prerequisiteId: "skill_2" },
    { id: "skill_4", cost: 4 },
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
    });

    it("returns 0 when level is NaN or non-numeric", () => {
      expect(calculateAvailableSkillPoints(NaN, ["skill_2"])).toBe(0);
    });
  });

  describe("validateSkillUnlock", () => {
    it("fails if skill is not found", () => {
      const result = validateSkillUnlock("unknown_skill", 10, []);
      expect(result).toEqual({ canUnlock: false, reason: "Skill not found." });
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
});
