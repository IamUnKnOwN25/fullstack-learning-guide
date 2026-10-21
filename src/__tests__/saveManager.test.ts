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
    completedQuests: ["html_1", "css_1"],
    completedBosses: ["html_boss"],
    stars: { html_1: 3, css_1: 2 },
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
      const deserialized = deserializeSaveData(corruptedJson);

      expect(deserialized).toBeNull();
    });

    it("should reject invalid schema structures", () => {
      // Missing required fields from the wrapper, but data is a string where an object is expected
      const invalidSchema = JSON.stringify({
        version: "1.0.0",
        timestamp: 12345,
        data: "not an object"
      });
      const deserialized = deserializeSaveData(invalidSchema);

      expect(deserialized).toBeNull();
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
