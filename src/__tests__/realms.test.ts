import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  REALMS,
  resolveRealmAlias,
  getRealmById,
  getRealmByOrder,
  getNextRealm,
  getPreviousRealm,
  isRealmUnlocked,
  getCampaignProgression,
  filterRealmsByMaxLevel,
  getRealmByBossId,
  getRealmNavigationContext,
  normalizeRealmId,
} from "../data/realms";
import { BOSSES } from "../data/bosses";
import { QUESTS } from "../data/quests";

describe("Campaign Realms Data Integrity", () => {
  it("contains exactly 12 campaign realms in continuous order from 1 to 12", () => {
    expect(REALMS).toHaveLength(12);
    REALMS.forEach((realm, index) => {
      expect(realm.order).toBe(index + 1);
    });
  });

  it("ensures every realm has unique identifiers, names, and ascending level requirements", () => {
    const ids = new Set<string>();
    const names = new Set<string>();
    let previousLevel = 0;

    REALMS.forEach((realm) => {
      expect(ids.has(realm.id)).toBe(false);
      ids.add(realm.id);

      expect(names.has(realm.realmName)).toBe(false);
      names.add(realm.realmName);

      expect(realm.requiredLevel).toBeGreaterThanOrEqual(previousLevel);
      previousLevel = realm.requiredLevel;
    });
  });

  it("verifies that each realm fileRef points to an existing markdown curriculum document on disk", () => {
    REALMS.forEach((realm) => {
      const filePath = path.join(process.cwd(), realm.fileRef);
      expect(fs.existsSync(filePath)).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(100);
    });
  });

  it("verifies that each realm corresponds to a valid boss encounter in BOSSES", () => {
    REALMS.forEach((realm) => {
      const boss = BOSSES[realm.id];
      expect(boss).toBeDefined();
      expect(boss.realmId).toBe(realm.id);
      expect(boss.name.length).toBeGreaterThan(0);
      expect(boss.phases.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("verifies that each realm has active quests defined in QUESTS", () => {
    REALMS.forEach((realm) => {
      const quests = QUESTS[realm.id];
      expect(quests).toBeDefined();
      expect(quests.length).toBeGreaterThanOrEqual(1);
      quests.forEach((q) => {
        expect(q.realmId).toBe(realm.id);
        expect(q.starterCode.length).toBeGreaterThan(10);
        expect(q.xpReward).toBeGreaterThan(0);
      });
    });
  });

  it("validates that all realms have complete styling, icons, lore, and descriptive summaries", () => {
    REALMS.forEach((realm) => {
      expect(realm.title.trim()).not.toBe("");
      expect(realm.description.length).toBeGreaterThan(20);
      expect(realm.lore.length).toBeGreaterThan(20);
      expect(realm.themeColor).toContain("border-");
      expect(realm.borderGlow).toContain("shadow-");
      expect(realm.icon.length).toBeGreaterThan(0);
    });
  });
});


describe("Realm Query, Progression, and Unlock Helpers", () => {
  describe("resolveRealmAlias", () => {
    it("maps common shorthand aliases to canonical realm ids", () => {
      expect(resolveRealmAlias("js")).toBe("javascript");
      expect(resolveRealmAlias("ts")).toBe("typescript");
      expect(resolveRealmAlias("db")).toBe("databases");
      expect(resolveRealmAlias("database")).toBe("databases");
    });

    it("normalizes case and surrounding whitespace", () => {
      expect(resolveRealmAlias("  JS  ")).toBe("javascript");
      expect(resolveRealmAlias("  Ts ")).toBe("typescript");
      expect(resolveRealmAlias("DB")).toBe("databases");
      expect(resolveRealmAlias("  DATABASE  ")).toBe("databases");
      expect(resolveRealmAlias(" HTML ")).toBe("html");
      expect(resolveRealmAlias("REACT")).toBe("react");
    });

    it("returns empty string for empty, whitespace-only, nullish, or non-string inputs", () => {
      expect(resolveRealmAlias("")).toBe("");
      expect(resolveRealmAlias("   ")).toBe("");
      // @ts-expect-error test non-string defensive runtime handling
      expect(resolveRealmAlias(null)).toBe("");
      // @ts-expect-error test non-string defensive runtime handling
      expect(resolveRealmAlias(undefined)).toBe("");
      // @ts-expect-error test non-string defensive runtime handling
      expect(resolveRealmAlias(123)).toBe("");
      // @ts-expect-error test non-string defensive runtime handling
      expect(resolveRealmAlias({})).toBe("");
    });

    it("preserves canonical or unknown realm ids in lowercase trimmed format", () => {
      expect(resolveRealmAlias("devops")).toBe("devops");
      expect(resolveRealmAlias("  custom-realm  ")).toBe("custom-realm");
    });
  });

  describe("getRealmById", () => {
    it("finds realm by exact canonical identifier", () => {
      const realm = getRealmById("html");
      expect(realm).toBeDefined();
      expect(realm?.id).toBe("html");
      expect(realm?.order).toBe(1);
    });

    it("finds realm by shorthand alias and case-insensitive whitespace variants", () => {
      expect(getRealmById("  JS ")?.id).toBe("javascript");
      expect(getRealmById("TS")?.id).toBe("typescript");
      expect(getRealmById("db")?.id).toBe("databases");
      expect(getRealmById("DATABASE")?.id).toBe("databases");
    });

    it("returns undefined for unknown realm ids or invalid inputs", () => {
      expect(getRealmById("unknown-realm")).toBeUndefined();
      expect(getRealmById("")).toBeUndefined();
      // @ts-expect-error test defensive runtime handling
      expect(getRealmById(null)).toBeUndefined();
      // @ts-expect-error test defensive runtime handling
      expect(getRealmById(undefined)).toBeUndefined();
    });
  });

  describe("getRealmByOrder", () => {
    it("retrieves the correct realm for valid 1-based order indices", () => {
      expect(getRealmByOrder(1)?.id).toBe("html");
      expect(getRealmByOrder(6)?.id).toBe("backend");
      expect(getRealmByOrder(12)?.id).toBe("capstone");
    });

    it("safely handles boundary, negative, out-of-range, and NaN values", () => {
      expect(getRealmByOrder(0)).toBeUndefined();
      expect(getRealmByOrder(13)).toBeUndefined();
      expect(getRealmByOrder(-1)).toBeUndefined();
      expect(getRealmByOrder(NaN)).toBeUndefined();
      expect(getRealmByOrder(Infinity)).toBeUndefined();
      expect(getRealmByOrder(1.5)).toBeUndefined();
      // @ts-expect-error test defensive runtime handling
      expect(getRealmByOrder("1")).toBeUndefined();
      // @ts-expect-error test defensive runtime handling
      expect(getRealmByOrder(null)).toBeUndefined();
    });
  });

  describe("getNextRealm", () => {
    it("returns the next realm in progression order", () => {
      const next = getNextRealm("html");
      expect(next?.id).toBe("css");
      expect(next?.order).toBe(2);
    });

    it("resolves aliases when determining the current realm", () => {
      const next = getNextRealm("js");
      expect(next?.id).toBe("typescript");
      expect(next?.order).toBe(4);
    });

    it("returns undefined at the progression boundary (last realm)", () => {
      expect(getNextRealm("capstone")).toBeUndefined();
    });

    it("returns undefined for non-existent or invalid realm ids", () => {
      expect(getNextRealm("void")).toBeUndefined();
      expect(getNextRealm("")).toBeUndefined();
    });
  });

  describe("getPreviousRealm", () => {
    it("returns the previous realm in progression order", () => {
      const prev = getPreviousRealm("css");
      expect(prev?.id).toBe("html");
      expect(prev?.order).toBe(1);
    });

    it("returns the previous realm for the capstone", () => {
      const prev = getPreviousRealm("capstone");
      expect(prev?.id).toBe("security");
      expect(prev?.order).toBe(11);
    });

    it("returns undefined at the progression boundary (first realm)", () => {
      expect(getPreviousRealm("html")).toBeUndefined();
    });

    it("returns undefined for non-existent or invalid realm ids", () => {
      expect(getPreviousRealm("nonexistent")).toBeUndefined();
      expect(getPreviousRealm("")).toBeUndefined();
    });
  });

  describe("isRealmUnlocked", () => {
    it("returns true when player meets or exceeds realm required level", () => {
      expect(isRealmUnlocked("html", 1)).toBe(true);
      expect(isRealmUnlocked("html", 5)).toBe(true);
      expect(isRealmUnlocked("javascript", 4)).toBe(true);
      expect(isRealmUnlocked("javascript", 10)).toBe(true);
      expect(isRealmUnlocked("capstone", 32)).toBe(true);
    });

    it("returns false when player is below realm required level", () => {
      expect(isRealmUnlocked("html", 0)).toBe(false);
      expect(isRealmUnlocked("javascript", 3)).toBe(false);
      expect(isRealmUnlocked("capstone", 31)).toBe(false);
    });

    it("guards safely against NaN, negative, or invalid player levels", () => {
      expect(isRealmUnlocked("html", NaN)).toBe(false);
      expect(isRealmUnlocked("html", -5)).toBe(false);
      // @ts-expect-error test non-number level
      expect(isRealmUnlocked("html", null)).toBe(false);
    });

    it("returns true if realm is explicitly unlocked regardless of player level", () => {
      expect(isRealmUnlocked("javascript", 1, ["javascript"])).toBe(true);
      expect(isRealmUnlocked("capstone", 1, ["capstone"])).toBe(true);
    });

    it("normalizes aliases, case, and whitespace in unlockedRealms list and realmId", () => {
      // Shorthand alias in unlockedRealms
      expect(isRealmUnlocked("javascript", 1, ["js"])).toBe(true);
      // Case and whitespace in unlockedRealms
      expect(isRealmUnlocked("typescript", 1, ["  TS  "])).toBe(true);
      expect(isRealmUnlocked("databases", 1, ["DATABASE"])).toBe(true);
      // Alias passed as realmId
      expect(isRealmUnlocked("js", 1, ["javascript"])).toBe(true);
      expect(isRealmUnlocked("  JS  ", 4)).toBe(true);
    });

    it("returns false if unlockedRealms does not include the target realm and level is insufficient", () => {
      expect(isRealmUnlocked("javascript", 1, ["html", "css"])).toBe(false);
    });

    it("returns false for non-existent realm even if present in unlockedRealms", () => {
      expect(isRealmUnlocked("mythical-realm", 100, ["mythical-realm"])).toBe(false);
    });
  });
});


describe("Campaign Progression, Filtering, Boss Lookup, and Navigation Context Helpers", () => {
  describe("getCampaignProgression", () => {
    it("returns zero counts and percentage for empty completed realm list", () => {
      const result = getCampaignProgression([]);
      expect(result).toEqual({
        completedCount: 0,
        totalCount: 12,
        percentage: 0,
      });
    });

    it("correctly calculates progress and rounds percentage for partial completion", () => {
      // 1 realm: 1/12 = 8.33% -> 8%
      expect(getCampaignProgression(["html"])).toEqual({
        completedCount: 1,
        totalCount: 12,
        percentage: 8,
      });

      // 2 realms: 2/12 = 16.67% -> 17%
      expect(getCampaignProgression(["html", "css"])).toEqual({
        completedCount: 2,
        totalCount: 12,
        percentage: 17,
      });

      // 6 realms: 6/12 = 50%
      expect(
        getCampaignProgression(["html", "css", "javascript", "typescript", "react", "backend"])
      ).toEqual({
        completedCount: 6,
        totalCount: 12,
        percentage: 50,
      });
    });

    it("returns 100% when all realms are completed", () => {
      const allIds = REALMS.map((r) => r.id);
      expect(getCampaignProgression(allIds)).toEqual({
        completedCount: 12,
        totalCount: 12,
        percentage: 100,
      });
    });

    it("deduplicates identical realm identifiers", () => {
      const result = getCampaignProgression(["html", "html", "html"]);
      expect(result).toEqual({
        completedCount: 1,
        totalCount: 12,
        percentage: 8,
      });
    });

    it("normalizes shorthand aliases and prevents double-counting aliases of the same realm", () => {
      const result = getCampaignProgression(["js", "javascript", "ts", "typescript", "db", "databases"]);
      expect(result).toEqual({
        completedCount: 3,
        totalCount: 12,
        percentage: 25,
      });
    });

    it("ignores unrecognized, whitespace-only, or invalid realm IDs", () => {
      const result = getCampaignProgression(["html", "unknown_realm", "   ", ""]);
      expect(result).toEqual({
        completedCount: 1,
        totalCount: 12,
        percentage: 8,
      });
    });

    it("handles non-array inputs defensively at runtime", () => {
      // @ts-expect-error test non-array input
      expect(getCampaignProgression(null)).toEqual({
        completedCount: 0,
        totalCount: 12,
        percentage: 0,
      });
      // @ts-expect-error test non-array input
      expect(getCampaignProgression(undefined)).toEqual({
        completedCount: 0,
        totalCount: 12,
        percentage: 0,
      });
    });
  });

  describe("filterRealmsByMaxLevel", () => {
    it("returns realms whose requiredLevel is less than or equal to player level", () => {
      const level1Realms = filterRealmsByMaxLevel(1);
      expect(level1Realms.map((r) => r.id)).toEqual(["html"]);

      const level2Realms = filterRealmsByMaxLevel(2);
      expect(level2Realms.map((r) => r.id)).toEqual(["html", "css"]);

      const level6Realms = filterRealmsByMaxLevel(6);
      expect(level6Realms.map((r) => r.id)).toEqual(["html", "css", "javascript", "typescript"]);
    });

    it("floors floating-point player levels", () => {
      const realms = filterRealmsByMaxLevel(2.9);
      expect(realms.map((r) => r.id)).toEqual(["html", "css"]);
    });

    it("returns all 12 realms if player level meets or exceeds max realm requirement", () => {
      const realms = filterRealmsByMaxLevel(35);
      expect(realms).toHaveLength(12);
      expect(realms.map((r) => r.id)).toEqual(REALMS.map((r) => r.id));
    });

    it("returns an empty array for playerLevel < 1", () => {
      expect(filterRealmsByMaxLevel(0)).toEqual([]);
      expect(filterRealmsByMaxLevel(-5)).toEqual([]);
    });

    it("returns an empty array for non-finite or non-number values", () => {
      expect(filterRealmsByMaxLevel(NaN)).toEqual([]);
      expect(filterRealmsByMaxLevel(Infinity)).toEqual([]);
      expect(filterRealmsByMaxLevel(-Infinity)).toEqual([]);
      // @ts-expect-error test non-number level
      expect(filterRealmsByMaxLevel("5")).toEqual([]);
      // @ts-expect-error test non-number level
      expect(filterRealmsByMaxLevel(null)).toEqual([]);
    });
  });

  describe("getRealmByBossId", () => {
    it("finds realm by exact boss identifier", () => {
      const realm = getRealmByBossId("html_boss");
      expect(realm).toBeDefined();
      expect(realm?.id).toBe("html");
      expect(realm?.bossId).toBe("html_boss");
    });

    it("matches bossId case-insensitively and trims whitespace", () => {
      expect(getRealmByBossId("HTML_BOSS")?.id).toBe("html");
      expect(getRealmByBossId("  css_boss  ")?.id).toBe("css");
      expect(getRealmByBossId("Js_BoSs")?.id).toBe("javascript");
      expect(getRealmByBossId("FINAL_BOSS")?.id).toBe("capstone");
    });

    it("returns undefined for non-existent boss IDs or empty strings", () => {
      expect(getRealmByBossId("nonexistent_boss")).toBeUndefined();
      expect(getRealmByBossId("")).toBeUndefined();
      expect(getRealmByBossId("   ")).toBeUndefined();
      // @ts-expect-error test non-string input
      expect(getRealmByBossId(null)).toBeUndefined();
      // @ts-expect-error test non-string input
      expect(getRealmByBossId(123)).toBeUndefined();
    });
  });

  describe("getRealmNavigationContext", () => {
    it("returns navigation context for the first realm (HTML)", () => {
      const context = getRealmNavigationContext("html");
      expect(context.prev).toBeNull();
      expect(context.current?.id).toBe("html");
      expect(context.next?.id).toBe("css");
    });

    it("returns navigation context for a middle realm (CSS)", () => {
      const context = getRealmNavigationContext("css");
      expect(context.prev?.id).toBe("html");
      expect(context.current?.id).toBe("css");
      expect(context.next?.id).toBe("javascript");
    });

    it("returns navigation context for the last realm (Capstone)", () => {
      const context = getRealmNavigationContext("capstone");
      expect(context.prev?.id).toBe("security");
      expect(context.current?.id).toBe("capstone");
      expect(context.next).toBeNull();
    });

    it("supports realm shorthand aliases and case/whitespace normalization", () => {
      const context = getRealmNavigationContext("  JS ");
      expect(context.prev?.id).toBe("css");
      expect(context.current?.id).toBe("javascript");
      expect(context.next?.id).toBe("typescript");
    });

    it("returns all nulls if the realm cannot be found", () => {
      const context = getRealmNavigationContext("invalid_realm");
      expect(context).toEqual({
        prev: null,
        current: null,
        next: null,
      });

      expect(getRealmNavigationContext("")).toEqual({
        prev: null,
        current: null,
        next: null,
      });

      // @ts-expect-error test non-string input
      expect(getRealmNavigationContext(null)).toEqual({
        prev: null,
        current: null,
        next: null,
      });
    });
  });

  describe("normalizeRealmId", () => {
    it("aliases resolveRealmAlias identically", () => {
      expect(normalizeRealmId).toBe(resolveRealmAlias);
      expect(normalizeRealmId("js")).toBe("javascript");
      expect(normalizeRealmId("ts")).toBe("typescript");
    });
  });
});
