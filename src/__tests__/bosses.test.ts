import { describe, it, expect } from "vitest";
import { BOSSES } from "../data/bosses";
import { REALMS } from "../data/realms";

describe("DevQuest Bosses Matrix", () => {
  it("has a boss battle encounter registered for every realm in REALMS", () => {
    for (const realm of REALMS) {
      const boss = BOSSES[realm.id];
      expect(boss, `Realm ${realm.id} (${realm.realmName}) must have a boss encounter`).toBeDefined();
      expect(boss.realmId).toBe(realm.id);
      expect(boss.id).toBe(realm.bossId);
    }
  });

  it("ensures each boss has valid RPG stats, lore, and badges", () => {
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      expect(boss.name.trim().length, `Boss ${boss.id} name`).toBeGreaterThan(3);
      expect(boss.title.trim().length, `Boss ${boss.id} title`).toBeGreaterThan(3);
      expect(boss.maxHp, `Boss ${boss.id} maxHp`).toBeGreaterThanOrEqual(100);
      expect(boss.xpReward, `Boss ${boss.id} xpReward`).toBeGreaterThanOrEqual(250);
      expect(boss.introLore.trim().length, `Boss ${boss.id} introLore`).toBeGreaterThan(15);
      expect(boss.defeatQuote.trim().length, `Boss ${boss.id} defeatQuote`).toBeGreaterThan(10);
      
      expect(boss.badge.id.length).toBeGreaterThan(2);
      expect(boss.badge.name.length).toBeGreaterThan(2);
      expect(boss.badge.description.length).toBeGreaterThan(10);
    }
  });

  it("ensures all boss phases have valid combat requirements", () => {
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      expect(boss.phases.length, `Boss ${boss.id} phases count`).toBeGreaterThanOrEqual(2);

      let totalBossDamage = 0;
      for (const phase of boss.phases) {
        expect(phase.phaseTitle.length).toBeGreaterThan(3);
        expect(phase.prompt.length).toBeGreaterThan(10);
        expect(phase.initialCode.length).toBeGreaterThan(0);
        expect(phase.damageToBoss, `Phase damage to boss in ${boss.id}`).toBeGreaterThan(0);
        expect(phase.damageToPlayer, `Phase damage to player in ${boss.id}`).toBeGreaterThan(0);
        totalBossDamage += phase.damageToBoss;
      }

      expect(
        totalBossDamage,
        `Total phase damage for ${boss.id} must be sufficient to defeat boss`
      ).toBeGreaterThanOrEqual(boss.maxHp);
    }
  });

  it("handles empty input in boss phase testConditions without throwing", () => {
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      for (const phase of boss.phases) {
        expect(() => {
          const res = phase.testCondition("");
          expect(res.passed).toBe(false);
          expect(typeof res.message).toBe("string");
        }).not.toThrow();
      }
    }
  });

  it("ensures boss initialCode requires code changes and does not pass immediately", () => {
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      for (const phase of boss.phases) {
        const result = phase.testCondition(phase.initialCode);
        expect(
          result.passed,
          `Initial code for ${boss.id} Phase ${phase.phaseNumber} must not pass immediately`
        ).toBe(false);
      }
    }
  });
});
