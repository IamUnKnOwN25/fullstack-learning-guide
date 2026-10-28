import { describe, it, expect } from "vitest";
import {
  serializeSaveData,
  deserializeSaveData,
  generateSaveSummary,
  isValidStatsObject,
  encodeSaveToBase64,
  decodeSaveFromBase64,
  migrateSaveData,
  SAVE_FORMAT_VERSION,
} from "../lib/saveManager";
import type { PlayerStats } from "../lib/gameStore";

describe("saveManager", () => {
  const mockStats: Partial<PlayerStats> = {
    xp: 1500,
    level: 5,
    rankTitle: "Junior Dev",
    hp: 120,
    maxHp: 120,
    mana: 50,
    maxMana: 50,
    streak: 3,
    completedQuests: ["html_1", "css_1"],
    completedBosses: ["html_boss"],
    unlockedRealms: ["html", "css"],
    unlockedSkills: ["syntax_sense"],
    badges: ["html_master"],
    completedCurriculumTasks: ["task_1"],
    completedChapters: ["chapter_1"],
    claimedAchievements: ["first_blood_boss"],
    stars: { html_1: 3, css_1: 2 },
    curriculumTaskAwards: { task_1: 50 },
    audioMuted: false,
    bgmActive: true,
  };

  describe("serializeSaveData", () => {
    it("should serialize stats into a valid JSON string with wrapper", () => {
      const json = serializeSaveData(mockStats);
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(SAVE_FORMAT_VERSION);
      expect(typeof parsed.timestamp).toBe("number");
      expect(parsed.data).toEqual(mockStats);
    });
  });

  describe("deserializeSaveData", () => {
    it("should deserialize a valid wrapper format", () => {
      const json = serializeSaveData(mockStats);
      const deserialized = deserializeSaveData(json);

      expect(deserialized).toEqual(mockStats);
    });

    it("should deserialize legacy flat stats format (backwards compatibility)", () => {
      const legacyJson = JSON.stringify(mockStats);
      const deserialized = deserializeSaveData(legacyJson);

      expect(deserialized).toEqual(mockStats);
    });

    it("should reject corrupted JSON", () => {
      const corruptedJson = "{ xp: 1500, broken: ";
      expect(deserializeSaveData(corruptedJson)).toBeNull();
    });

    it("should reject non-object JSON primitives", () => {
      expect(deserializeSaveData("")).toBeNull();
      expect(deserializeSaveData("null")).toBeNull();
      expect(deserializeSaveData("12345")).toBeNull();
      expect(deserializeSaveData('"just a string"')).toBeNull();
      expect(deserializeSaveData("true")).toBeNull();
      expect(deserializeSaveData("[]")).toBeNull();
    });

    it("should reject invalid schema structures in wrapper", () => {
      const invalidSchema = JSON.stringify({
        version: "1.0.0",
        timestamp: 12345,
        data: "not an object"
      });
      expect(deserializeSaveData(invalidSchema)).toBeNull();

      const invalidVersion = JSON.stringify({
        version: 123,
        timestamp: 12345,
        data: { xp: 100 }
      });
      expect(deserializeSaveData(invalidVersion)).toBeNull();

      const invalidTimestamp = JSON.stringify({
        version: "1.0.0",
        timestamp: "not-a-number",
        data: { xp: 100 }
      });
      expect(deserializeSaveData(invalidTimestamp)).toBeNull();
    });

    it("should reject negative or out-of-bounds numerical values", () => {
      expect(deserializeSaveData(JSON.stringify({ xp: -50 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ level: 0 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ level: -1 }))).toBeNull();
    });

    it("should reject non-string items within string array fields", () => {
      const badQuests = JSON.stringify({ completedQuests: ["html_1", 123] });
      expect(deserializeSaveData(badQuests)).toBeNull();

      const badBadges = JSON.stringify({ badges: [null] });
      expect(deserializeSaveData(badBadges)).toBeNull();

      const badSkills = JSON.stringify({ unlockedSkills: [{}] });
      expect(deserializeSaveData(badSkills)).toBeNull();

      const badTasks = JSON.stringify({ completedCurriculumTasks: ["task_1", false] });
      expect(deserializeSaveData(badTasks)).toBeNull();
    });

    it("should reject invalid dictionary or boolean types", () => {
      expect(deserializeSaveData(JSON.stringify({ stars: "not-an-object" }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ stars: [1, 2, 3] }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ curriculumTaskAwards: "bad" }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ audioMuted: "false" }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ bgmActive: 1 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ rankTitle: 999 }))).toBeNull();
    });

    it("should drop invalid fields but keep valid ones in direct parsing mode", () => {
      const flatWithBadType = JSON.stringify({
        xp: "one thousand", // invalid type
        level: 5,
        rankTitle: "Junior Dev"
      });
      const deserialized = deserializeSaveData(flatWithBadType);
      expect(deserialized).toBeNull();
    });

    it("handles non-string and empty strings gracefully", () => {
      expect(deserializeSaveData("")).toBeNull();
      expect(deserializeSaveData("   ")).toBeNull();
      expect(deserializeSaveData(null as any)).toBeNull();
      expect(deserializeSaveData(undefined as any)).toBeNull();
    });
  });

  describe("generateSaveSummary & isValidStatsObject", () => {
    it("generates correct summaries from player stats", () => {
      const summary = generateSaveSummary({
        level: 15,
        xp: 12500,
        completedQuests: ["q1", "q2", "q3"],
        completedBosses: ["b1"],
        rankTitle: "Type Warden",
      });

      expect(summary.level).toBe(15);
      expect(summary.xp).toBe(12500);
      expect(summary.questsCompleted).toBe(3);
      expect(summary.bossesDefeated).toBe(1);
      expect(summary.rankTitle).toBe("Type Warden");
    });

    it("returns default summary values for null or empty stats", () => {
      const empty = generateSaveSummary(null);
      expect(empty.level).toBe(1);
      expect(empty.xp).toBe(0);
      expect(empty.questsCompleted).toBe(0);
      expect(empty.bossesDefeated).toBe(0);
      expect(empty.rankTitle).toBe("Novice Byte");
    });

    it("validates stats objects directly with isValidStatsObject", () => {
      expect(isValidStatsObject({ xp: 100, level: 2 })).toBe(true);
      expect(isValidStatsObject({ xp: -1 })).toBe(false);
      expect(isValidStatsObject("string")).toBe(false);
      expect(isValidStatsObject(null)).toBe(false);
    });
  });

  describe("Base64 Compression & Version Migration Suite", () => {
    it("encodes stats to base64 and decodes back identically", () => {
      const b64 = encodeSaveToBase64(mockStats);
      expect(typeof b64).toBe("string");
      expect(b64.length).toBeGreaterThan(20);

      const restored = decodeSaveFromBase64(b64);
      expect(restored).toEqual(mockStats);
    });

    it("allows deserializeSaveData to accept raw base64 save strings directly", () => {
      const b64 = encodeSaveToBase64(mockStats);
      const restored = deserializeSaveData(b64);
      expect(restored).toEqual(mockStats);
    });

    it("handles invalid or corrupted base64 gracefully", () => {
      expect(decodeSaveFromBase64("")).toBeNull();
      expect(decodeSaveFromBase64("not!valid@base64###")).toBeNull();
      expect(decodeSaveFromBase64("YWJj")).toBeNull(); // decodes to 'abc' which is not valid JSON
    });

    it("migrates partial save payload guaranteeing standard fields and versioning", () => {
      const partialSave = {
        version: "0.9.0",
        data: { xp: 500, level: 3 },
      };

      const migrated = migrateSaveData(partialSave as any);
      expect(migrated.version).toBe(SAVE_FORMAT_VERSION);
      expect(typeof migrated.timestamp).toBe("number");
      expect(migrated.data.xp).toBe(500);
      expect(migrated.data.level).toBe(3);
      expect(migrated.data.completedQuests).toEqual([]);
      expect(migrated.data.completedBosses).toEqual([]);
      expect(migrated.data.unlockedRealms).toEqual(["html"]);
      expect(migrated.data.unlockedSkills).toEqual([]);
      expect(migrated.data.badges).toEqual([]);
    });

    it("sanitizes invalid numbers during migration", () => {
      const corrupted = {
        data: { xp: -50, level: 0 },
      };
      const migrated = migrateSaveData(corrupted as any);
      expect(migrated.data.level).toBe(1);
      expect(migrated.data.xp).toBe(0);
    });
  });
});
