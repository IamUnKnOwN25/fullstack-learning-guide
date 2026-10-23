import { describe, it, expect } from "vitest";
import { SKILL_TREE, SKILL_CATEGORIES } from "../data/skills";

describe("Skill Tree Data Integrity & Hierarchy", () => {
  it("defines exactly 5 skill categories with unique labels, icons, and styling colors", () => {
    expect(SKILL_CATEGORIES).toHaveLength(5);
    const categoryIds = new Set(SKILL_CATEGORIES.map((c) => c.id));
    expect(categoryIds.size).toBe(5);

    SKILL_CATEGORIES.forEach((cat) => {
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.icon.length).toBeGreaterThan(0);
      expect(cat.color).toContain("text-");
    });
  });

  it("verifies all skill nodes belong to valid defined categories", () => {
    const validCategories = new Set(SKILL_CATEGORIES.map((c) => c.id));
    SKILL_TREE.forEach((skill) => {
      expect(validCategories.has(skill.category)).toBe(true);
    });
  });

  it("ensures unique skill IDs and valid positive costs", () => {
    const skillIds = new Set<string>();
    SKILL_TREE.forEach((skill) => {
      expect(skillIds.has(skill.id)).toBe(false);
      skillIds.add(skill.id);
      expect(skill.cost).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(skill.cost)).toBe(true);
      expect([1, 2, 3]).toContain(skill.tier);
    });
  });

  it("validates prerequisite hierarchy and ensures no broken prerequisite links", () => {
    const skillMap = new Map(SKILL_TREE.map((s) => [s.id, s]));

    SKILL_TREE.forEach((skill) => {
      if (skill.prerequisiteId) {
        const prereq = skillMap.get(skill.prerequisiteId);
        expect(prereq).toBeDefined();
        // Prerequisite must be strictly in an equal or earlier tier
        expect(prereq!.tier).toBeLessThan(skill.tier);
        // Prerequisite should belong to the same branch category
        expect(prereq!.category).toBe(skill.category);
      }
    });
  });

  it("verifies default unlocked starter talents", () => {
    const defaultUnlocked = SKILL_TREE.filter((s) => s.unlockedByDefault);
    expect(defaultUnlocked).toHaveLength(1);
    expect(defaultUnlocked[0].id).toBe("syntax_sense");
    expect(defaultUnlocked[0].cost).toBe(1);
  });

  it("verifies descriptions, titles, stat bonuses, and icon references across all skills", () => {
    SKILL_TREE.forEach((skill) => {
      expect(skill.name.trim().length).toBeGreaterThan(0);
      expect(skill.description.length).toBeGreaterThan(20);
      expect(skill.icon.length).toBeGreaterThan(0);
      expect(skill.statBonus).toBeDefined();
      expect(skill.statBonus!.length).toBeGreaterThan(3);
    });
  });
});
