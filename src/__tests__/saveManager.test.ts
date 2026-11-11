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
  computeSaveChecksum,
  verifySaveChecksum,
  inspectSavePayload,
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
      expect(deserializeSaveData(JSON.stringify({ hp: -10 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ maxHp: 0 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ maxHp: -100 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ mana: -5 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ maxMana: 0 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ maxMana: -50 }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ streak: -1 }))).toBeNull();
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
      expect(deserializeSaveData(JSON.stringify({ stars: { html_1: NaN } }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ stars: { html_1: Infinity } }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ stars: { html_1: -Infinity } }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ curriculumTaskAwards: { task_1: NaN } }))).toBeNull();
      expect(deserializeSaveData(JSON.stringify({ curriculumTaskAwards: { task_1: Infinity } }))).toBeNull();
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

    it("should reject Infinity and -Infinity in numeric fields", () => {
      expect(isValidStatsObject({ xp: Infinity })).toBe(false);
      expect(isValidStatsObject({ xp: -Infinity })).toBe(false);
      expect(isValidStatsObject({ level: Infinity })).toBe(false);
      expect(isValidStatsObject({ hp: Infinity })).toBe(false);
      expect(isValidStatsObject({ maxHp: Infinity })).toBe(false);
      expect(isValidStatsObject({ mana: Infinity })).toBe(false);
      expect(isValidStatsObject({ maxMana: Infinity })).toBe(false);
      expect(isValidStatsObject({ streak: Infinity })).toBe(false);
      expect(deserializeSaveData(JSON.stringify({ xp: Infinity }))).toBeNull();
      expect(isValidStatsObject({ hp: -1 })).toBe(false);
      expect(isValidStatsObject({ maxHp: 0 })).toBe(false);
      expect(isValidStatsObject({ maxHp: -50 })).toBe(false);
      expect(isValidStatsObject({ mana: -1 })).toBe(false);
      expect(isValidStatsObject({ maxMana: 0 })).toBe(false);
      expect(isValidStatsObject({ maxMana: -25 })).toBe(false);
      expect(isValidStatsObject({ streak: -1 })).toBe(false);
      expect(isValidStatsObject({ hp: 0, maxHp: 1, mana: 0, maxMana: 1, streak: 0 })).toBe(true);
      expect(isValidStatsObject({ stars: { html_1: NaN } })).toBe(false);
      expect(isValidStatsObject({ stars: { html_1: Infinity } })).toBe(false);
      expect(isValidStatsObject({ curriculumTaskAwards: { task_1: NaN } })).toBe(false);
      expect(isValidStatsObject({ curriculumTaskAwards: { task_1: Infinity } })).toBe(false);
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

    it("sanitizes Infinity and populates complete finite defaults during migration", () => {
      const corrupted = {
        data: {
          xp: Infinity,
          level: -Infinity,
          hp: Infinity,
          maxHp: NaN,
          mana: Infinity,
          maxMana: -5,
          streak: -20,
        },
      };
      const migrated = migrateSaveData(corrupted as any);
      expect(migrated.data.xp).toBe(0);
      expect(migrated.data.level).toBe(1);
      expect(migrated.data.hp).toBe(100);
      expect(migrated.data.maxHp).toBe(100);
      expect(migrated.data.mana).toBe(50);
      expect(migrated.data.maxMana).toBe(50);
      expect(migrated.data.streak).toBe(0);
    });

    it("validates dictionary entries and drops or resets invalid entries during migration", () => {
      const corrupted = {
        data: {
          stars: {
            validQuest: 3,
            nanQuest: NaN,
            infQuest: Infinity,
            negInfQuest: -Infinity,
            strQuest: "bad" as any,
          },
          curriculumTaskAwards: {
            validTask: 50,
            nanTask: NaN,
            infTask: Infinity,
            strTask: "wrong" as any,
          },
        },
      };
      const migrated = migrateSaveData(corrupted as any);
      expect(migrated.data.stars).toEqual({ validQuest: 3 });
      expect(migrated.data.curriculumTaskAwards).toEqual({ validTask: 50 });

      const corruptedTypes = {
        data: {
          stars: "not-an-object",
          curriculumTaskAwards: [1, 2, 3],
        },
      };
      const migratedReset = migrateSaveData(corruptedTypes as any);
      expect(migratedReset.data.stars).toEqual({});
      expect(migratedReset.data.curriculumTaskAwards).toEqual({});
    });

    it("handles UTF-8 strings in base64 encoding without deprecated escape/unescape", () => {
      const statsWithEmoji = {
        ...mockStats,
        rankTitle: "Matrix 🚀 Dev 💻",
      };
      const b64 = encodeSaveToBase64(statsWithEmoji);
      const decoded = decodeSaveFromBase64(b64);
      expect(decoded?.rankTitle).toBe("Matrix 🚀 Dev 💻");
    });
  });

  describe("computeSaveChecksum & verifySaveChecksum", () => {
    it("computes a deterministic 8-char hex string for stats object", () => {
      const hash1 = computeSaveChecksum(mockStats);
      const hash2 = computeSaveChecksum(mockStats);
      expect(typeof hash1).toBe("string");
      expect(hash1).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash1)).toBe(true);
      expect(hash1).toBe(hash2);
    });

    it("ensures key-order invariance across root and nested objects", () => {
      const obj1 = {
        xp: 1500,
        level: 5,
        stars: { css_1: 2, html_1: 3 },
      };
      const obj2 = {
        stars: { html_1: 3, css_1: 2 },
        level: 5,
        xp: 1500,
      };

      const hash1 = computeSaveChecksum(obj1);
      const hash2 = computeSaveChecksum(obj2);
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe("00000000");
    });

    it("returns '00000000' on nullish or unserializable input", () => {
      expect(computeSaveChecksum(null)).toBe("00000000");
      expect(computeSaveChecksum(undefined)).toBe("00000000");
      expect(computeSaveChecksum(() => {})).toBe("00000000");
      expect(computeSaveChecksum(Symbol("test"))).toBe("00000000");
      expect(computeSaveChecksum(BigInt(42))).toBe("00000000");

      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      expect(computeSaveChecksum(circular)).toBe("00000000");
    });

    it("detects tampering when any property is changed", () => {
      const originalChecksum = computeSaveChecksum(mockStats);
      const tamperedStats = { ...mockStats, xp: 1501 };
      const tamperedChecksum = computeSaveChecksum(tamperedStats);

      expect(tamperedChecksum).not.toBe(originalChecksum);
      expect(verifySaveChecksum(tamperedStats, originalChecksum)).toBe(false);
      expect(verifySaveChecksum(mockStats, originalChecksum)).toBe(true);
    });

    it("verifies normalized hex checksums safely with case and prefix tolerance", () => {
      const checksum = computeSaveChecksum(mockStats);
      expect(verifySaveChecksum(mockStats, checksum)).toBe(true);
      expect(verifySaveChecksum(mockStats, checksum.toUpperCase())).toBe(true);
      expect(verifySaveChecksum(mockStats, `0x${checksum}`)).toBe(true);
      expect(verifySaveChecksum(mockStats, `  0x${checksum.toUpperCase()}  `)).toBe(true);

      // Rejections
      expect(verifySaveChecksum(mockStats, "invalid_hex")).toBe(false);
      expect(verifySaveChecksum(mockStats, checksum.slice(0, 7))).toBe(false);
      expect(verifySaveChecksum(mockStats, "")).toBe(false);
      expect(verifySaveChecksum(mockStats, null as unknown as string)).toBe(false);
      expect(verifySaveChecksum(mockStats, undefined as unknown as string)).toBe(false);
    });
  });

  describe("inspectSavePayload", () => {
    it("inspects a valid wrapped save payload correctly", () => {
      const json = serializeSaveData(mockStats);
      const result = inspectSavePayload(json);

      expect(result.valid).toBe(true);
      expect(result.version).toBe(1);
      expect(result.level).toBe(5);
      expect(result.xp).toBe(1500);
      expect(result.error).toBeUndefined();
    });

    it("inspects a valid legacy flat save payload correctly", () => {
      const json = JSON.stringify(mockStats);
      const result = inspectSavePayload(json);

      expect(result.valid).toBe(true);
      expect(result.version).toBeNull();
      expect(result.level).toBe(5);
      expect(result.xp).toBe(1500);
      expect(result.error).toBeUndefined();
    });

    it("inspects base64 encoded save strings", () => {
      const b64 = encodeSaveToBase64(mockStats);
      const result = inspectSavePayload(b64);

      expect(result.valid).toBe(true);
      expect(result.version).toBe(1);
      expect(result.level).toBe(5);
      expect(result.xp).toBe(1500);
      expect(result.error).toBeUndefined();
    });

    it("handles empty object payload with null stats and valid status", () => {
      const result = inspectSavePayload("{}");
      expect(result.valid).toBe(true);
      expect(result.version).toBeNull();
      expect(result.level).toBeNull();
      expect(result.xp).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it("reports diagnostic details on malformed JSON", () => {
      const result = inspectSavePayload("{ invalid: json ");
      expect(result.valid).toBe(false);
      expect(result.version).toBeNull();
      expect(result.level).toBeNull();
      expect(result.xp).toBeNull();
      expect(result.error).toContain("Malformed JSON");
    });

    it("reports diagnostic details when root payload is not an object", () => {
      expect(inspectSavePayload("").valid).toBe(false);
      expect(inspectSavePayload("   ").valid).toBe(false);
      expect(inspectSavePayload("12345").valid).toBe(false);
      expect(inspectSavePayload('"hello"').valid).toBe(false);
      expect(inspectSavePayload("true").valid).toBe(false);
      expect(inspectSavePayload("[]").valid).toBe(false);
      expect(inspectSavePayload("[1, 2, 3]").error).toContain("object");
    });

    it("reports diagnostic details on wrapped save schema failures", () => {
      const badWrapperData = JSON.stringify({
        version: "1.0.0",
        timestamp: Date.now(),
        data: "not an object",
      });
      const resData = inspectSavePayload(badWrapperData);
      expect(resData.valid).toBe(false);
      expect(resData.version).toBe(1);
      expect(resData.error).toContain("data");

      const badTimestamp = JSON.stringify({
        version: "1.0.0",
        timestamp: "invalid-time",
        data: { xp: 100 },
      });
      const resTime = inspectSavePayload(badTimestamp);
      expect(resTime.valid).toBe(false);
      expect(resTime.error).toContain("timestamp");
    });

    it("reports diagnostic details when player stats are invalid", () => {
      const negativeXp = JSON.stringify({ xp: -10, level: 5 });
      const resXp = inspectSavePayload(negativeXp);
      expect(resXp.valid).toBe(false);
      expect(resXp.level).toBe(5);
      expect(resXp.xp).toBe(-10);
      expect(resXp.error).toContain("xp");

      const invalidLevel = JSON.stringify({ xp: 200, level: 0 });
      const resLevel = inspectSavePayload(invalidLevel);
      expect(resLevel.valid).toBe(false);
      expect(resLevel.level).toBe(0);
      expect(resLevel.xp).toBe(200);
      expect(resLevel.error).toContain("level");

      const badArrayField = JSON.stringify({ completedQuests: [123] });
      const resArr = inspectSavePayload(badArrayField);
      expect(resArr.valid).toBe(false);
      expect(resArr.error).toContain("completedQuests");

      const badStars = JSON.stringify({ stars: { html_1: NaN } });
      const resStars = inspectSavePayload(badStars);
      expect(resStars.valid).toBe(false);
      expect(resStars.error).toContain("stars");
    });
  });
});
