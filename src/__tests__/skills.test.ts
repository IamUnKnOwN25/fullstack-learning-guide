import { describe, it, expect } from "vitest";
import {
  SKILL_TREE,
  SKILL_CATEGORIES,
  getSkillById,
  getSkillsByCategory,
  getSkillsByTier,
  getSkillPrerequisites,
  detectSkillTreeCycles,
  getTotalSkillTreeCost,
} from "../data/skills";

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

  describe("Skill Tree Helper Functions", () => {
    it("getSkillById finds existing skills and returns undefined for unknown or empty IDs", () => {
      const skill = getSkillById("syntax_sense");
      expect(skill).toBeDefined();
      expect(skill?.name).toBe("Syntax Sense");
      expect(skill?.category).toBe("foundations");

      expect(getSkillById("non_existent_skill")).toBeUndefined();
      expect(getSkillById("")).toBeUndefined();
    });

    it("getSkillsByCategory filters skills for each branch correctly", () => {
      const foundations = getSkillsByCategory("foundations");
      expect(foundations.length).toBeGreaterThan(0);
      expect(foundations.every((s) => s.category === "foundations")).toBe(true);

      const frontend = getSkillsByCategory("frontend");
      expect(frontend.length).toBeGreaterThan(0);
      expect(frontend.every((s) => s.category === "frontend")).toBe(true);

      const backend = getSkillsByCategory("backend");
      expect(backend.length).toBeGreaterThan(0);
      expect(backend.every((s) => s.category === "backend")).toBe(true);

      const devops = getSkillsByCategory("devops");
      expect(devops.length).toBeGreaterThan(0);
      expect(devops.every((s) => s.category === "devops")).toBe(true);

      const mastery = getSkillsByCategory("mastery");
      expect(mastery.length).toBeGreaterThan(0);
      expect(mastery.every((s) => s.category === "mastery")).toBe(true);
    });

    it("getSkillsByTier returns skills belonging to specific tiers", () => {
      const tier1 = getSkillsByTier(1);
      const tier2 = getSkillsByTier(2);
      const tier3 = getSkillsByTier(3);

      expect(tier1.length).toBeGreaterThan(0);
      expect(tier2.length).toBeGreaterThan(0);
      expect(tier3.length).toBeGreaterThan(0);

      expect(tier1.every((s) => s.tier === 1)).toBe(true);
      expect(tier2.every((s) => s.tier === 2)).toBe(true);
      expect(tier3.every((s) => s.tier === 3)).toBe(true);
      expect(tier1.length + tier2.length + tier3.length).toBe(SKILL_TREE.length);
    });

    it("getSkillPrerequisites returns empty chain for tier 1 skills", () => {
      const prereqs = getSkillPrerequisites("syntax_sense");
      expect(prereqs).toEqual([]);

      const reactivePrereqs = getSkillPrerequisites("reactive_flow");
      expect(reactivePrereqs).toEqual([]);
    });

    it("getSkillPrerequisites traverses prerequisite chain up to root in correct order", () => {
      // tier 2 skill with 1 prereq
      const tier2Prereqs = getSkillPrerequisites("state_synchronizer");
      expect(tier2Prereqs).toHaveLength(1);
      expect(tier2Prereqs[0].id).toBe("reactive_flow");

      // tier 3 skill with 2 prereqs
      const tier3Prereqs = getSkillPrerequisites("server_action_warp");
      expect(tier3Prereqs).toHaveLength(2);
      expect(tier3Prereqs[0].id).toBe("reactive_flow");
      expect(tier3Prereqs[1].id).toBe("state_synchronizer");

      // mastery branch grandmaster chain
      const grandmasterPrereqs = getSkillPrerequisites("matrix_grandmaster");
      expect(grandmasterPrereqs).toHaveLength(2);
      expect(grandmasterPrereqs[0].id).toBe("clean_code_aura");
      expect(grandmasterPrereqs[1].id).toBe("zero_day_warden");
    });

    it("detectSkillTreeCycles verifies the skill tree is a directed acyclic graph (DAG)", () => {
      const hasCycle = detectSkillTreeCycles();
      expect(hasCycle).toBe(false);
    });

    it("getTotalSkillTreeCost calculates the exact sum of all skill point costs", () => {
      const totalCost = getTotalSkillTreeCost();
      const expectedSum = SKILL_TREE.reduce((sum, s) => sum + s.cost, 0);
      expect(totalCost).toBe(expectedSum);
      expect(totalCost).toBeGreaterThan(30);
    });
  });
});
