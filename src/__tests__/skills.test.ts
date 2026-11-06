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
  SKILLS,
  canUnlockSkill,
  calculateActiveStatBonuses,
  getSkillPointsSpent,
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

    it("verifies SKILLS alias points to SKILL_TREE", () => {
      expect(SKILLS).toBe(SKILL_TREE);
      expect(SKILLS.length).toBe(15);
    });

    it("getSkillsByTier safely returns empty array for invalid, non-integer, or out-of-range tiers", () => {
      expect(getSkillsByTier(0)).toEqual([]);
      expect(getSkillsByTier(4)).toEqual([]);
      expect(getSkillsByTier(-1)).toEqual([]);
      expect(getSkillsByTier(99)).toEqual([]);
      expect(getSkillsByTier(NaN)).toEqual([]);
      expect(getSkillsByTier(1.5)).toEqual([]);
      expect(getSkillsByTier(2.99)).toEqual([]);
      expect(getSkillsByTier(Infinity)).toEqual([]);
      expect(getSkillsByTier(-Infinity)).toEqual([]);
      expect(getSkillsByTier(null as any)).toEqual([]);
      expect(getSkillsByTier(undefined as any)).toEqual([]);
      expect(getSkillsByTier("1" as any)).toEqual([]);
    });

    it("getSkillById performs trimmed and safe lookups", () => {
      expect(getSkillById("  syntax_sense  ")).toBeDefined();
      expect(getSkillById("  syntax_sense  ")?.id).toBe("syntax_sense");
      expect(getSkillById("\tlint_shield\n")).toBeDefined();
      expect(getSkillById("   ")).toBeUndefined();
      expect(getSkillById(null as any)).toBeUndefined();
      expect(getSkillById(undefined as any)).toBeUndefined();
      expect(getSkillById(123 as any)).toBeUndefined();
    });
  });

  describe("canUnlockSkill Guard Logic", () => {
    it("rejects unknown or invalid skill IDs", () => {
      expect(canUnlockSkill("", [], 5).allowed).toBe(false);
      expect(canUnlockSkill("   ", [], 5).allowed).toBe(false);
      expect(canUnlockSkill("unknown_skill", [], 5).allowed).toBe(false);
      expect(canUnlockSkill(null as any, [], 5).allowed).toBe(false);
    });

    it("rejects already unlocked skills and default unlocked skills", () => {
      // syntax_sense is unlockedByDefault: true
      const defaultRes = canUnlockSkill("syntax_sense", [], 1);
      expect(defaultRes.allowed).toBe(false);
      expect(defaultRes.reason).toContain("already unlocked");

      // lint_shield already in unlocked list
      const unlockedRes = canUnlockSkill("lint_shield", ["lint_shield"], 1);
      expect(unlockedRes.allowed).toBe(false);
      expect(unlockedRes.reason).toContain("already unlocked");
    });

    it("rejects invalid, negative, or non-finite player levels", () => {
      expect(canUnlockSkill("lint_shield", [], NaN).allowed).toBe(false);
      expect(canUnlockSkill("lint_shield", [], Infinity).allowed).toBe(false);
      expect(canUnlockSkill("lint_shield", [], -Infinity).allowed).toBe(false);
      expect(canUnlockSkill("lint_shield", [], -1).allowed).toBe(false);
      expect(canUnlockSkill("lint_shield", [], 0).allowed).toBe(false);
    });

    it("enforces prerequisite requirements across dependency chains", () => {
      // state_synchronizer requires reactive_flow
      const missingPrereq = canUnlockSkill("state_synchronizer", [], 5);
      expect(missingPrereq.allowed).toBe(false);
      expect(missingPrereq.reason).toContain("reactive_flow");

      // allowed when immediate prerequisite is present
      const hasPrereq = canUnlockSkill("state_synchronizer", ["reactive_flow"], 5);
      expect(hasPrereq.allowed).toBe(true);

      // server_action_warp requires reactive_flow AND state_synchronizer
      const partialPrereq = canUnlockSkill("server_action_warp", ["state_synchronizer"], 5);
      expect(partialPrereq.allowed).toBe(false);
      expect(partialPrereq.reason).toContain("reactive_flow");

      const fullChainPrereq = canUnlockSkill(
        "server_action_warp",
        ["reactive_flow", "state_synchronizer"],
        5
      );
      expect(fullChainPrereq.allowed).toBe(true);
    });

    it("enforces availablePoints check when provided and allows when omitted", () => {
      // lint_shield costs 2 points
      const withoutPoints = canUnlockSkill("lint_shield", [], 1);
      expect(withoutPoints.allowed).toBe(true);

      const deficit = canUnlockSkill("lint_shield", [], 1, 1);
      expect(deficit.allowed).toBe(false);
      expect(deficit.reason).toContain("Not enough skill points");

      const exact = canUnlockSkill("lint_shield", [], 1, 2);
      expect(exact.allowed).toBe(true);

      const surplus = canUnlockSkill("lint_shield", [], 1, 10);
      expect(surplus.allowed).toBe(true);

      const invalidPoints = canUnlockSkill("lint_shield", [], 1, NaN);
      expect(invalidPoints.allowed).toBe(false);

      const negativePoints = canUnlockSkill("lint_shield", [], 1, -2);
      expect(negativePoints.allowed).toBe(false);
    });
  });

  describe("calculateActiveStatBonuses & getSkillPointsSpent", () => {
    it("aggregates active stat bonuses with null, empty, and duplicate resilience", () => {
      expect(calculateActiveStatBonuses([])).toEqual([]);
      expect(calculateActiveStatBonuses(null as any)).toEqual([]);
      expect(calculateActiveStatBonuses(undefined as any)).toEqual([]);

      const single = calculateActiveStatBonuses(["lint_shield"]);
      expect(single).toEqual(["+1 Free Boss Strike Absorption"]);

      // Duplicates must be deduplicated
      const duplicates = calculateActiveStatBonuses(["lint_shield", "lint_shield", "  lint_shield  "]);
      expect(duplicates).toEqual(["+1 Free Boss Strike Absorption"]);

      // Multiple skills
      const multiple = calculateActiveStatBonuses(["lint_shield", "reactive_flow"]);
      expect(multiple).toEqual(["+1 Free Boss Strike Absorption", "+25% React Quest XP"]);

      // Ignores unknown IDs and empty strings
      const withUnknown = calculateActiveStatBonuses(["lint_shield", "fake_perk", "", "   "]);
      expect(withUnknown).toEqual(["+1 Free Boss Strike Absorption"]);
    });

    it("calculates spent skill points with null, empty, and duplicate resilience", () => {
      expect(getSkillPointsSpent([])).toBe(0);
      expect(getSkillPointsSpent(null as any)).toBe(0);
      expect(getSkillPointsSpent(undefined as any)).toBe(0);

      // lint_shield costs 2
      expect(getSkillPointsSpent(["lint_shield"])).toBe(2);

      // Duplicate skill IDs must be charged only once
      expect(getSkillPointsSpent(["lint_shield", "lint_shield", "lint_shield"])).toBe(2);

      // Multiple skills: lint_shield (2) + reactive_flow (3) = 5
      expect(getSkillPointsSpent(["lint_shield", "reactive_flow"])).toBe(5);

      // Ignores unknown IDs, nulls, and whitespace entries
      expect(getSkillPointsSpent(["lint_shield", "unknown_skill", "", "   ", null as any])).toBe(2);
    });
  });
});
