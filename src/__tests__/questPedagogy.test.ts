import { describe, it, expect } from "vitest";
import { QUESTS } from "../data/quests";
import { REALMS } from "../data/realms";
import {
  QUEST_DEEP_DIVES,
  REALM_WARMUP_DRILLS,
  generateQuestAssertions,
  BOSS_INCIDENT_POST_MORTEMS,
  getQuestDeepDive,
  getWarmUpDrill,
  getBossPostMortem,
  evaluateQuizAnswer,
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

        // Options should be unique
        const uniqueOptions = new Set(deepDive.quiz.options);
        expect(uniqueOptions.size).toBe(deepDive.quiz.options.length);
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

  it("ensures empty input fails validation safely across all warm-up drills", () => {
    for (const realm of REALMS) {
      const drill = REALM_WARMUP_DRILLS[realm.id];
      if (!drill) continue;

      expect(() => {
        const emptyResult = drill.validator("");
        expect(emptyResult.passed).toBe(false);
        expect(typeof emptyResult.message).toBe("string");
      }).not.toThrow();
    }
  });

  it("generates senior invariant assertions for HTML, Forms, and Async quests", () => {
    const htmlAssertions = generateQuestAssertions(
      "html_1_skeleton",
      "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body><h1>Hello World</h1></body></html>"
    );
    expect(htmlAssertions.length).toBe(4);
    expect(htmlAssertions.every((a) => a.passed)).toBe(true);

    const formsAssertions = generateQuestAssertions(
      "html_2_forms",
      "<form><label for='email'>Email:</label><input id='email' type='email'><label for='password'>Password:</label><input id='password' type='password'><button type='submit'>Register</button></form>"
    );
    expect(formsAssertions.length).toBe(3);
    expect(formsAssertions.every((a) => a.passed)).toBe(true);

    const asyncAssertions = generateQuestAssertions(
      "js_2_async",
      "async function load() { try { const res = await fetch('/api'); if (!res.ok) throw new Error(); return await res.json(); } catch (err) {} }"
    );
    expect(asyncAssertions.length).toBe(4);
    expect(asyncAssertions.every((a) => a.passed)).toBe(true);
  });

  it("handles broken or empty code in invariant assertions safely with failure states", () => {
    const failedHtml = generateQuestAssertions("html_1_skeleton", "<p>Not a skeleton</p>");
    expect(failedHtml.some((a) => !a.passed)).toBe(true);

    const failedAsync = generateQuestAssertions("js_2_async", "function syncLoad() {}");
    expect(failedAsync.some((a) => !a.passed)).toBe(true);
  });

  it("returns fallback invariants for other quests gracefully", () => {
    const fallbackAssertions = generateQuestAssertions(
      "ts_1_interfaces",
      "interface MatrixNode { id: string; active: boolean; }"
    );
    expect(fallbackAssertions.length).toBeGreaterThanOrEqual(2);
    expect(fallbackAssertions[0].name).toBe("Syntax Integrity Check");
    expect(fallbackAssertions[0].passed).toBe(true);
  });

  it("provides senior incident post-mortems for all 12 realm bosses", () => {
    const severities = new Set<string>();
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
      severities.add(postMortem.incidentSeverity);
    }
    expect(severities.size).toBeGreaterThanOrEqual(2);
  });

  it("generates senior invariant assertions for CSS flexbox and grid quests", () => {
    const flexAssertions = generateQuestAssertions(
      "css_1_flexbox",
      ".container { display: flex; justify-content: space-between; align-items: center; }"
    );
    expect(flexAssertions.length).toBe(3);
    expect(flexAssertions[0].name).toBe("Flex Container Context");
    expect(flexAssertions[0].passed).toBe(true);
    expect(flexAssertions[1].name).toBe("Main-Axis Alignment");
    expect(flexAssertions[1].passed).toBe(true);
    expect(flexAssertions[2].name).toBe("Cross-Axis Alignment");
    expect(flexAssertions[2].passed).toBe(true);

    const gridAssertions = generateQuestAssertions(
      "css_2_grid",
      ".grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }"
    );
    expect(gridAssertions.length).toBe(3);
    expect(gridAssertions[0].name).toBe("Grid Container Context");
    expect(gridAssertions[0].passed).toBe(true);
    expect(gridAssertions[1].name).toBe("Responsive Track Sizing");
    expect(gridAssertions[1].passed).toBe(true);
    expect(gridAssertions[2].name).toBe("Grid Cell Separation");
    expect(gridAssertions[2].passed).toBe(true);

    // Negative invariant failures
    const failedFlex = generateQuestAssertions("css_1_flexbox", "div { display: block; }");
    expect(failedFlex.some((a) => !a.passed)).toBe(true);
    expect(failedFlex[0].passed).toBe(false);

    const failedGrid = generateQuestAssertions("css_2_grid", "div { display: block; }");
    expect(failedGrid.some((a) => !a.passed)).toBe(true);
    expect(failedGrid[0].passed).toBe(false);
  });

  it("guards generateQuestAssertions safely against nullish or non-string inputs", () => {
    expect(() => generateQuestAssertions(null as any, null as any)).not.toThrow();
    expect(() => generateQuestAssertions(undefined as any, undefined as any)).not.toThrow();
    expect(() => generateQuestAssertions(123 as any, true as any)).not.toThrow();
    expect(() => generateQuestAssertions({} as any, [] as any)).not.toThrow();

    const nullResult = generateQuestAssertions(null as any, null as any);
    expect(nullResult.length).toBeGreaterThanOrEqual(2);
    expect(nullResult[0].name).toBe("Syntax Integrity Check");
    expect(nullResult[0].passed).toBe(false);

    const nullHtml = generateQuestAssertions("html_1_skeleton", null as any);
    expect(nullHtml.length).toBe(4);
    expect(nullHtml.every((a) => !a.passed)).toBe(true);

    const nullFlex = generateQuestAssertions("css_1_flexbox", undefined as any);
    expect(nullFlex.length).toBe(3);
    expect(nullFlex.every((a) => !a.passed)).toBe(true);

    const nullGrid = generateQuestAssertions("css_2_grid", null as any);
    expect(nullGrid.length).toBe(3);
    expect(nullGrid.every((a) => !a.passed)).toBe(true);
  });

  it("normalizes and retrieves pedagogy items via lookup helpers safely", () => {
    // getQuestDeepDive
    const htmlDeepDive = getQuestDeepDive("html_1_skeleton");
    expect(htmlDeepDive).toBeDefined();
    expect(htmlDeepDive?.quiz.question.length).toBeGreaterThan(10);
    // Case-insensitivity & whitespace trimming
    expect(getQuestDeepDive("  HTML_1_SKELETON  ")).toEqual(htmlDeepDive);
    expect(getQuestDeepDive("non_existent_quest")).toBeUndefined();
    expect(getQuestDeepDive(null as any)).toBeUndefined();
    expect(getQuestDeepDive(undefined as any)).toBeUndefined();
    expect(getQuestDeepDive(42 as any)).toBeUndefined();

    // getWarmUpDrill
    const cssDrill = getWarmUpDrill("css");
    expect(cssDrill).toBeDefined();
    expect(cssDrill?.id).toBe("warmup_css_centering");
    // Case-insensitivity & whitespace trimming
    expect(getWarmUpDrill("  CSS  ")).toEqual(cssDrill);
    expect(getWarmUpDrill("unknown_realm")).toBeUndefined();
    expect(getWarmUpDrill(null as any)).toBeUndefined();
    expect(getWarmUpDrill(undefined as any)).toBeUndefined();

    // getBossPostMortem
    const jsPostMortem = getBossPostMortem("javascript");
    expect(jsPostMortem).toBeDefined();
    expect(jsPostMortem?.incidentId).toBe("INC-JS-500");
    // Case-insensitivity & whitespace trimming
    expect(getBossPostMortem("  JavaScript  ")).toEqual(jsPostMortem);
    expect(getBossPostMortem("nonexistent_realm")).toBeUndefined();
    expect(getBossPostMortem(null as any)).toBeUndefined();
    expect(getBossPostMortem(undefined as any)).toBeUndefined();
  });

  it("evaluates quiz answers safely and handles edge cases gracefully", () => {
    // html_1_skeleton correctIndex is 1
    expect(evaluateQuizAnswer("html_1_skeleton", 1)).toBe(true);
    expect(evaluateQuizAnswer("  HTML_1_SKELETON  ", 1)).toBe(true);
    expect(evaluateQuizAnswer("html_1_skeleton", 0)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", 2)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", 3)).toBe(false);

    // Out-of-range indices
    expect(evaluateQuizAnswer("html_1_skeleton", -1)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", 4)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", 100)).toBe(false);

    // Non-integers / NaN / non-numbers
    expect(evaluateQuizAnswer("html_1_skeleton", NaN)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", 1.5)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", null as any)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", undefined as any)).toBe(false);
    expect(evaluateQuizAnswer("html_1_skeleton", "1" as any)).toBe(false);

    // Unknown quests or non-string questId
    expect(evaluateQuizAnswer("unknown_quest", 0)).toBe(false);
    expect(evaluateQuizAnswer(null as any, 1)).toBe(false);
    expect(evaluateQuizAnswer(undefined as any, 0)).toBe(false);
  });
});
