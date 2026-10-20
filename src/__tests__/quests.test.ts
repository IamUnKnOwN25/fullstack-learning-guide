import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
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

  it("verifies all 12 realms have interactive concept visualizers configured and valid curriculum fileRefs on disk", () => {
    const realms = [
      "html", "css", "javascript", "typescript", "react", "backend",
      "databases", "devops", "testing", "cs", "security", "capstone"
    ];
    const visualizerSource = fs.readFileSync(
      path.join(process.cwd(), "src/components/RealmConceptVisualizer.tsx"),
      "utf-8"
    );
    for (const r of realms) {
      const realm = REALMS.find((item) => item.id === r);
      expect(realm).toBeDefined();
      expect(
        visualizerSource.includes(`case "${r}":`),
        `RealmConceptVisualizer must implement interactive case "${r}":`
      ).toBe(true);
      const filePath = path.join(process.cwd(), realm!.fileRef);
      expect(
        fs.existsSync(filePath),
        `Curriculum file '${realm!.fileRef}' for realm '${r}' must exist on disk`
      ).toBe(true);
    }
  });

  it("verifies both canonical modules and HMR-safe compatibility shims exist on disk", () => {
    const requiredFiles = [
      "src/components/QuestCodingWorkspace.tsx",
      "src/components/DualPaneWorkspace.tsx",
      "src/components/NavigationHud.tsx",
      "src/components/HUD.tsx",
      "src/components/AchievementsModal.tsx",
      "src/components/InventoryModal.tsx",
      "src/components/WorldCampaignMap.tsx",
      "src/components/QuestMap.tsx",
      "src/lib/gameStore.ts",
      "src/lib/store.ts",
      "src/lib/soundEngine.ts",
      "src/lib/audio.ts",
    ];
    for (const relPath of requiredFiles) {
      expect(
        fs.existsSync(path.join(process.cwd(), relPath)),
        `Required module '${relPath}' must exist on disk to prevent Webpack HMR errors`
      ).toBe(true);
    }
  });
});
