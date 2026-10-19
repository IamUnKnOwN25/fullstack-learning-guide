import { describe, it, expect } from "vitest";
import { QUESTS } from "../data/quests";
import { REALMS } from "../data/realms";

describe("DevQuest Quests Matrix", () => {
  it("has quests registered for every realm in REALMS", () => {
    for (const realm of REALMS) {
      const realmQuests = QUESTS[realm.id];
      expect(
        realmQuests,
        `Realm ${realm.id} (${realm.realmName}) should have quests registered`
      ).toBeDefined();
      expect(
        realmQuests.length,
        `Realm ${realm.id} should have at least 2 quests`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("guarantees unique IDs across all quests", () => {
    const allIds = new Set<string>();
    let totalCount = 0;

    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        totalCount++;
        expect(allIds.has(quest.id), `Quest ID '${quest.id}' must be unique`).toBe(false);
        allIds.add(quest.id);
      }
    }

    expect(totalCount).toBeGreaterThanOrEqual(24);
  });

  it("ensures each quest has valid metadata, tasks, and reward structure", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        expect(quest.title.trim().length, `Quest ${quest.id} title`).toBeGreaterThan(3);
        expect(quest.storyIntro.trim().length, `Quest ${quest.id} storyIntro`).toBeGreaterThan(10);
        expect(quest.conceptSummary.trim().length, `Quest ${quest.id} conceptSummary`).toBeGreaterThan(10);
        expect(quest.starterCode.trim().length, `Quest ${quest.id} starterCode`).toBeGreaterThan(5);
        expect(quest.tasks.length, `Quest ${quest.id} tasks count`).toBeGreaterThanOrEqual(1);
        expect(quest.hints.length, `Quest ${quest.id} hints count`).toBeGreaterThanOrEqual(1);
        expect(quest.xpReward, `Quest ${quest.id} xpReward`).toBeGreaterThanOrEqual(50);
        expect(quest.realmId).toBe(realmId);
      }
    }
  });

  it("handles empty or corrupt input safely in test runners without throwing", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        expect(() => {
          const res = quest.testRunner("");
          expect(res.passed).toBe(false);
          expect(typeof res.message).toBe("string");
        }).not.toThrow();

        expect(() => {
          const res = quest.testRunner("// Random junk input with no syntax match");
          expect(res.passed).toBe(false);
        }).not.toThrow();
      }
    }
  });

  it("ensures starterCode does not pass immediately before user changes it", () => {
    for (const realmId in QUESTS) {
      for (const quest of QUESTS[realmId]) {
        const result = quest.testRunner(quest.starterCode);
        expect(
          result.passed,
          `Quest starterCode for '${quest.id}' should require user input and not pass immediately`
        ).toBe(false);
      }
    }
  });
});
