import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { REALMS } from "../data/realms";
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
