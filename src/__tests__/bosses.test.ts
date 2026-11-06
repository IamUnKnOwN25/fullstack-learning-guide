import { describe, it, expect } from "vitest";
import { BOSSES, BossPhase, getBossByRealmId, getBossById, getAllBosses, getTotalBossXp, validateBossPhaseAttempt } from "../data/bosses";
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

  it("verifies sequential phase numbering and non-empty hints and solution keywords", () => {
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      boss.phases.forEach((phase, idx) => {
        expect(phase.phaseNumber, `Phase number in ${boss.id}`).toBe(idx + 1);
        expect(phase.hint.trim().length, `Hint for ${boss.id} Phase ${phase.phaseNumber}`).toBeGreaterThan(5);
        expect(phase.solutionKeywords.length, `Solution keywords for ${boss.id} Phase ${phase.phaseNumber}`).toBeGreaterThan(0);
        for (const kw of phase.solutionKeywords) {
          expect(kw.trim().length).toBeGreaterThan(0);
        }
        expect(phase.damageToPlayer, `Player damage in ${boss.id}`).toBeLessThanOrEqual(50);
      });
    }
  });

  it("verifies all 12 realms have assigned boss sprite rendering targets", () => {
    const realmIds = [
      "html", "css", "javascript", "typescript", "react", "backend",
      "databases", "devops", "testing", "cs", "security", "capstone"
    ];
    for (const id of realmIds) {
      expect(REALMS.some((r) => r.id === id)).toBe(true);
      expect(BOSSES[id]).toBeDefined();
    }
  });
});


describe("getBossByRealmId lookup and alias normalization", () => {
  it("retrieves boss by canonical realm id", () => {
    const boss = getBossByRealmId("html");
    expect(boss).toBeDefined();
    expect(boss?.id).toBe("html_boss");
    expect(boss?.realmId).toBe("html");
  });

  it("normalizes whitespace and case-insensitive realm lookups", () => {
    const boss1 = getBossByRealmId("  HTML  ");
    const boss2 = getBossByRealmId("JaVaScRiPt");
    const boss3 = getBossByRealmId("  TYPESCRIPT  ");
    expect(boss1?.id).toBe("html_boss");
    expect(boss2?.id).toBe("js_boss");
    expect(boss3?.id).toBe("ts_boss");
  });

  it("resolves supported realm aliases correctly", () => {
    expect(getBossByRealmId("js")?.id).toBe("js_boss");
    expect(getBossByRealmId("  JS  ")?.id).toBe("js_boss");
    expect(getBossByRealmId("ts")?.id).toBe("ts_boss");
    expect(getBossByRealmId("TS")?.id).toBe("ts_boss");
    expect(getBossByRealmId("db")?.id).toBe("db_boss");
    expect(getBossByRealmId("DB")?.id).toBe("db_boss");
    expect(getBossByRealmId("database")?.id).toBe("db_boss");
    expect(getBossByRealmId("  DaTaBaSe  ")?.id).toBe("db_boss");
  });

  it("returns undefined for unknown, empty, or nullish realm inputs", () => {
    expect(getBossByRealmId("unknown_realm")).toBeUndefined();
    expect(getBossByRealmId("")).toBeUndefined();
    expect(getBossByRealmId("   ")).toBeUndefined();
    expect(getBossByRealmId(null)).toBeUndefined();
    expect(getBossByRealmId(undefined)).toBeUndefined();
    expect(getBossByRealmId(12345 as unknown as string)).toBeUndefined();
  });
});

describe("getBossById lookup", () => {
  it("retrieves boss by exact bossId", () => {
    const boss = getBossById("html_boss");
    expect(boss).toBeDefined();
    expect(boss?.realmId).toBe("html");
  });

  it("handles case-insensitive and trimmed bossId lookups", () => {
    const boss = getBossById("  FINAL_BOSS  ");
    expect(boss).toBeDefined();
    expect(boss?.id).toBe("final_boss");
    expect(boss?.realmId).toBe("capstone");
  });

  it("returns undefined for unknown or nullish bossId inputs", () => {
    expect(getBossById("non_existent_boss")).toBeUndefined();
    expect(getBossById("")).toBeUndefined();
    expect(getBossById("   ")).toBeUndefined();
    expect(getBossById(null)).toBeUndefined();
    expect(getBossById(undefined)).toBeUndefined();
  });
});

describe("getAllBosses and getTotalBossXp aggregate utilities", () => {
  it("returns all 12 bosses registered in the matrix", () => {
    const all = getAllBosses();
    expect(all).toHaveLength(12);
    expect(all.map((b) => b.id)).toContain("html_boss");
    expect(all.map((b) => b.id)).toContain("final_boss");
  });

  it("calculates correct total boss XP across all realms", () => {
    const totalXp = getTotalBossXp();
    const expectedXp = Object.values(BOSSES).reduce((sum, b) => sum + b.xpReward, 0);
    expect(totalXp).toBe(expectedXp);
    expect(totalXp).toBe(9050);
  });
});

describe("validateBossPhaseAttempt diagnostics", () => {
  it("validates successful attempt using phase hint solution", () => {
    const boss = getBossByRealmId("html")!;
    const phase = boss.phases[0];
    const result = validateBossPhaseAttempt(phase, phase.hint);

    expect(result.passed).toBe(true);
    expect(result.keywordsMissing).toHaveLength(0);
    expect(result.keywordsFound.length).toBe(phase.solutionKeywords.length);
    for (const kw of phase.solutionKeywords) {
      expect(result.keywordsFound).toContain(kw);
    }
  });

  it("detects missing keywords and failed attempt with initialCode", () => {
    const boss = getBossByRealmId("css")!;
    const phase = boss.phases[0];
    const result = validateBossPhaseAttempt(phase, phase.initialCode);

    expect(result.passed).toBe(false);
    expect(result.keywordsMissing.length).toBeGreaterThan(0);
  });

  it("evaluates keyword diagnostics case-insensitively", () => {
    const boss = getBossByRealmId("javascript")!;
    const phase = boss.phases[0];
    const upperCaseCode = `
      TRY {
        const res = AWAIT FETCH('https://api.example.com/users/1');
        return AWAIT res.JSON();
      } CATCH (err) {
        throw err;
      }
    `;
    const result = validateBossPhaseAttempt(phase, upperCaseCode);
    expect(result.keywordsMissing).toHaveLength(0);
    expect(result.keywordsFound).toEqual(phase.solutionKeywords);
    expect(result.passed).toBe(true);
  });

  it("correctly partitions partial keywords into found and missing", () => {
    const boss = getBossByRealmId("databases")!;
    const phase = boss.phases[1];
    const partialCode = `
      await client.query('BEGIN');
      // incomplete transaction block
    `;
    const result = validateBossPhaseAttempt(phase, partialCode);
    expect(result.passed).toBe(false);
    expect(result.keywordsFound).toContain("BEGIN");
    expect(result.keywordsMissing).toContain("COMMIT");
    expect(result.keywordsMissing).toContain("ROLLBACK");
  });

  it("safely handles nullish, empty, and non-string inputs", () => {
    const boss = getBossByRealmId("capstone")!;
    const phase = boss.phases[0];

    const emptyRes = validateBossPhaseAttempt(phase, "");
    expect(emptyRes.passed).toBe(false);
    expect(emptyRes.keywordsFound).toHaveLength(0);
    expect(emptyRes.keywordsMissing).toEqual(phase.solutionKeywords);

    const nullCodeRes = validateBossPhaseAttempt(phase, null);
    expect(nullCodeRes.passed).toBe(false);
    expect(nullCodeRes.keywordsFound).toHaveLength(0);
    expect(nullCodeRes.keywordsMissing).toEqual(phase.solutionKeywords);

    const numCodeRes = validateBossPhaseAttempt(phase, 42 as unknown as string);
    expect(numCodeRes.passed).toBe(false);
    expect(numCodeRes.keywordsMissing).toEqual(phase.solutionKeywords);

    const nullPhaseRes = validateBossPhaseAttempt(null, "some code");
    expect(nullPhaseRes.passed).toBe(false);
    expect(nullPhaseRes.keywordsFound).toEqual([]);
    expect(nullPhaseRes.keywordsMissing).toEqual([]);

    const undefPhaseRes = validateBossPhaseAttempt(undefined, "some code");
    expect(undefPhaseRes.passed).toBe(false);
    expect(undefPhaseRes.keywordsFound).toEqual([]);
    expect(undefPhaseRes.keywordsMissing).toEqual([]);
  });

  it("falls back to keyword-based evaluation when testCondition is absent", () => {
    const syntheticPhase = {
      phaseNumber: 1,
      phaseTitle: "Custom Test",
      bossDialogue: "...",
      prompt: "...",
      initialCode: "...",
      language: "typescript",
      solutionKeywords: ["alpha", "beta"],
      hint: "alpha beta",
      damageToBoss: 50,
      damageToPlayer: 25,
    };

    const passRes = validateBossPhaseAttempt(syntheticPhase as unknown as BossPhase, "alpha and beta are here");
    expect(passRes.passed).toBe(true);
    expect(passRes.keywordsMissing).toHaveLength(0);

    const failRes = validateBossPhaseAttempt(syntheticPhase as unknown as BossPhase, "only alpha");
    expect(failRes.passed).toBe(false);
    expect(failRes.keywordsMissing).toEqual(["beta"]);
  });
});
