import { describe, it, expect } from "vitest";
import {
  BOSSES,
  BossPhase,
  getBossByRealmId,
  getBossById,
  getAllBosses,
  getTotalBossXp,
  validateBossPhaseAttempt,
  getBossTotalPhaseDamage,
  calculateBossTotalDamageToPlayer,
  getBossPhaseByNumber,
  validateAllBossIntegrity,
} from "../data/bosses";
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

describe("getBossTotalPhaseDamage", () => {
  it("calculates total phase damage dealt to boss by bossId", () => {
    expect(getBossTotalPhaseDamage("html_boss")).toBe(100);
    expect(getBossTotalPhaseDamage("final_boss")).toBe(150);
  });

  it("calculates total phase damage by realmId case-insensitively with trimming", () => {
    expect(getBossTotalPhaseDamage("html")).toBe(100);
    expect(getBossTotalPhaseDamage("  HTML  ")).toBe(100);
    expect(getBossTotalPhaseDamage("capstone")).toBe(150);
    expect(getBossTotalPhaseDamage("  CAPSTONE  ")).toBe(150);
  });

  it("resolves realm aliases properly", () => {
    expect(getBossTotalPhaseDamage("js")).toBe(100);
    expect(getBossTotalPhaseDamage("ts")).toBe(100);
    expect(getBossTotalPhaseDamage("db")).toBe(100);
    expect(getBossTotalPhaseDamage("database")).toBe(100);
  });

  it("returns 0 for unknown bossId or invalid inputs", () => {
    expect(getBossTotalPhaseDamage("unknown_boss")).toBe(0);
    expect(getBossTotalPhaseDamage("")).toBe(0);
    expect(getBossTotalPhaseDamage("   ")).toBe(0);
    expect(getBossTotalPhaseDamage(null as unknown as string)).toBe(0);
    expect(getBossTotalPhaseDamage(undefined as unknown as string)).toBe(0);
  });

  it("accounts for explicit damageDealt if defined on phases", () => {
    const htmlBoss = BOSSES.html;
    expect(htmlBoss).toBeDefined();
    const origDealt = htmlBoss.phases[0].damageDealt;
    try {
      htmlBoss.phases[0].damageDealt = 90;
      expect(getBossTotalPhaseDamage("html_boss")).toBe(140);
    } finally {
      htmlBoss.phases[0].damageDealt = origDealt;
    }
  });
});

describe("calculateBossTotalDamageToPlayer", () => {
  it("calculates total player damage across phases by bossId", () => {
    expect(calculateBossTotalDamageToPlayer("html_boss")).toBe(50);
    expect(calculateBossTotalDamageToPlayer("final_boss")).toBe(75);
  });

  it("calculates total player damage by realmId case-insensitively with trimming", () => {
    expect(calculateBossTotalDamageToPlayer("html")).toBe(50);
    expect(calculateBossTotalDamageToPlayer("  CSS  ")).toBe(50);
    expect(calculateBossTotalDamageToPlayer("capstone")).toBe(75);
  });

  it("resolves realm aliases for player damage", () => {
    expect(calculateBossTotalDamageToPlayer("js")).toBe(50);
    expect(calculateBossTotalDamageToPlayer("ts")).toBe(50);
    expect(calculateBossTotalDamageToPlayer("db")).toBe(50);
  });

  it("returns 0 for invalid, empty, or unknown bossId", () => {
    expect(calculateBossTotalDamageToPlayer("nonexistent")).toBe(0);
    expect(calculateBossTotalDamageToPlayer("")).toBe(0);
    expect(calculateBossTotalDamageToPlayer("   ")).toBe(0);
    expect(calculateBossTotalDamageToPlayer(null as unknown as string)).toBe(0);
    expect(calculateBossTotalDamageToPlayer(undefined as unknown as string)).toBe(0);
  });
});

describe("getBossPhaseByNumber", () => {
  it("retrieves 1-indexed boss phases correctly", () => {
    const phase1 = getBossPhaseByNumber("html_boss", 1);
    const phase2 = getBossPhaseByNumber("html_boss", 2);

    expect(phase1).toBeDefined();
    expect(phase1?.phaseNumber).toBe(1);
    expect(phase1?.phaseTitle).toContain("Strike 1");

    expect(phase2).toBeDefined();
    expect(phase2?.phaseNumber).toBe(2);
    expect(phase2?.phaseTitle).toContain("Strike 2");
  });

  it("retrieves phases by realmId and aliases case-insensitively", () => {
    const jsPhase1 = getBossPhaseByNumber("js", 1);
    expect(jsPhase1).toBeDefined();
    expect(jsPhase1?.phaseNumber).toBe(1);

    const capstonePhase2 = getBossPhaseByNumber("  CAPSTONE  ", 2);
    expect(capstonePhase2).toBeDefined();
    expect(capstonePhase2?.phaseNumber).toBe(2);
  });

  it("returns undefined for out-of-bounds phase numbers", () => {
    expect(getBossPhaseByNumber("html_boss", 3)).toBeUndefined();
    expect(getBossPhaseByNumber("html_boss", 99)).toBeUndefined();
  });

  it("returns undefined for invalid, non-positive, or non-integer phase numbers", () => {
    expect(getBossPhaseByNumber("html_boss", 0)).toBeUndefined();
    expect(getBossPhaseByNumber("html_boss", -1)).toBeUndefined();
    expect(getBossPhaseByNumber("html_boss", 1.5)).toBeUndefined();
    expect(getBossPhaseByNumber("html_boss", NaN)).toBeUndefined();
    expect(getBossPhaseByNumber("html_boss", Infinity)).toBeUndefined();
  });

  it("returns undefined for unknown bossId or nullish inputs", () => {
    expect(getBossPhaseByNumber("unknown_boss", 1)).toBeUndefined();
    expect(getBossPhaseByNumber("", 1)).toBeUndefined();
    expect(getBossPhaseByNumber(null as unknown as string, 1)).toBeUndefined();
  });
});

describe("validateAllBossIntegrity", () => {
  it("validates that all bosses in the real catalog pass integrity checks", () => {
    const result = validateAllBossIntegrity();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("ensures every boss satisfies non-empty id, name, realmId, positive maxHp, and phases", () => {
    for (const realmId in BOSSES) {
      const boss = BOSSES[realmId];
      expect(boss.id.trim().length).toBeGreaterThan(0);
      expect(boss.name.trim().length).toBeGreaterThan(0);
      expect(boss.realmId.trim().length).toBeGreaterThan(0);
      expect(boss.maxHp).toBeGreaterThan(0);
      expect(boss.phases.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("reports descriptive errors when boss entries violate integrity rules", () => {
    const dummyBosses = {
      bad1: { id: "", name: "", realmId: "", maxHp: -10, phases: [] },
      bad2: null,
    };
    const errors: string[] = [];
    for (const [key, b] of Object.entries(dummyBosses)) {
      const boss = b as unknown as { id?: string; name?: string; realmId?: string; maxHp?: number; phases?: unknown[] };
      const label = boss?.id || key;
      if (!boss) {
        errors.push(`Boss '${key}' is missing or invalid.`);
        continue;
      }
      if (!boss.id?.trim()) errors.push(`Boss '${label}' has empty or invalid id.`);
      if (!boss.name?.trim()) errors.push(`Boss '${label}' has empty or invalid name.`);
      if (!boss.realmId?.trim()) errors.push(`Boss '${label}' has empty or invalid realmId.`);
      if (!boss.maxHp || boss.maxHp <= 0) errors.push(`Boss '${label}' must have positive maxHp.`);
      if (!boss.phases || boss.phases.length === 0) errors.push(`Boss '${label}' must have at least 1 phase.`);
    }
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
