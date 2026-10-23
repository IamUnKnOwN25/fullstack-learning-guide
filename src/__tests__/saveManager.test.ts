import { describe, it, expect } from "vitest";
import { serializeSaveData, deserializeSaveData, SAVE_FORMAT_VERSION } from "../lib/saveManager";
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
  });
});
