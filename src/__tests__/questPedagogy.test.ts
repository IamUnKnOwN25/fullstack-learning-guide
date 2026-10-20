import { describe, it, expect } from "vitest";
import { QUESTS } from "../data/quests";
import { REALMS } from "../data/realms";
import {
  QUEST_DEEP_DIVES,
  REALM_WARMUP_DRILLS,
  generateQuestAssertions,
  BOSS_INCIDENT_POST_MORTEMS,
} from "../data/questPedagogy";

describe("Pedagogical Deep Dives & Concept Checks", () => {
  it("provides comprehensive deep-dives and quizzes for all 24 quests", () => {
    let checkedCount = 0;
    for (const realm of REALMS) {
      const realmQuests = QUESTS[realm.id] || [];
      for (const quest of realmQuests) {
        checkedCount++;
        const deepDive = QUEST_DEEP_DIVES[quest.id];
        expect(deepDive, `Missing deep dive for quest ${quest.id}`).toBeDefined();
        expect(deepDive.whyItWorks.length).toBeGreaterThan(30);
        expect(deepDive.productionGotchas.length).toBeGreaterThanOrEqual(1);
        expect(deepDive.seniorAdvice.length).toBeGreaterThan(20);

        // Quiz verification
        expect(deepDive.quiz.question.length).toBeGreaterThan(15);
        expect(deepDive.quiz.options.length).toBeGreaterThanOrEqual(2);
        expect(deepDive.quiz.correctIndex).toBeGreaterThanOrEqual(0);
        expect(deepDive.quiz.correctIndex).toBeLessThan(deepDive.quiz.options.length);
        expect(deepDive.quiz.explanation.length).toBeGreaterThan(15);
      }
    }
    expect(checkedCount).toBe(24);
  });

  it("provides warm-up drills for all 12 curriculum realms", () => {
    for (const realm of REALMS) {
      const drill = REALM_WARMUP_DRILLS[realm.id];
      expect(drill, `Missing warm-up drill for realm ${realm.id}`).toBeDefined();
      if (!drill) continue;

      expect(drill.title.length).toBeGreaterThan(5);
      expect(drill.prompt.length).toBeGreaterThan(20);
      expect(drill.starterCode.length).toBeGreaterThan(5);
      expect(drill.solutionSnippet.length).toBeGreaterThan(5);
      expect(drill.hint.length).toBeGreaterThan(10);

      // Verify that the solution snippet actually passes the validator!
      const valResult = drill.validator(drill.solutionSnippet);
      expect(
        valResult.passed,
        `Solution snippet for drill '${drill.title}' failed validation: ${valResult.message}`
      ).toBe(true);
    }
  });

  it("generates senior invariant assertions for HTML, Forms, and Async quests", () => {
    const htmlAssertions = generateQuestAssertions(
      "html_1_skeleton",
      "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body><h1>Hello World</h1></body></html>"
    );
    expect(htmlAssertions.length).toBe(4);
    expect(htmlAssertions.every((a) => a.passed)).toBe(true);

    const asyncAssertions = generateQuestAssertions(
      "js_2_async",
      "async function load() { try { const res = await fetch('/api'); if (!res.ok) throw new Error(); return await res.json(); } catch (err) {} }"
    );
    expect(asyncAssertions.length).toBe(4);
    expect(asyncAssertions.every((a) => a.passed)).toBe(true);
  });

  it("returns fallback invariants for other quests gracefully", () => {
    const fallbackAssertions = generateQuestAssertions(
      "css_1_flexbox",
      ".container { display: flex; justify-content: center; align-items: center; }"
    );
    expect(fallbackAssertions.length).toBeGreaterThanOrEqual(2);
    expect(fallbackAssertions[0].name).toBe("Syntax Integrity Check");
    expect(fallbackAssertions[0].passed).toBe(true);
  });

  it("provides senior incident post-mortems for all 12 realm bosses", () => {
    for (const realm of REALMS) {
      const postMortem = BOSS_INCIDENT_POST_MORTEMS[realm.id];
      expect(postMortem, `Missing incident post-mortem for boss of realm ${realm.id}`).toBeDefined();
      expect(postMortem.incidentId).toMatch(/^INC-[A-Z]+-[0-9]+/);
      expect(postMortem.incidentSeverity).toMatch(/^P[0-2]/);
      expect(postMortem.title.length).toBeGreaterThan(10);
      expect(postMortem.rootCause.length).toBeGreaterThan(30);
      expect(postMortem.productionImpact.length).toBeGreaterThan(30);
      expect(postMortem.seniorMitigation.length).toBeGreaterThan(30);
      expect(postMortem.metricAlert.length).toBeGreaterThan(20);
    }
  });
});
