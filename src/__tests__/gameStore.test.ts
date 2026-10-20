import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

describe("DevQuest Game Store", () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress();
  });

  it("initializes with starting cadet stats", () => {
    const state = useGameStore.getState();
    expect(state.level).toBe(1);
    expect(state.xp).toBe(0);
    expect(state.hp).toBe(100);
    expect(state.rankTitle).toBe("Novice Byte");
    expect(state.unlockedRealms).toContain("html");
    expect(state.completedQuests).toHaveLength(0);
    expect(state.completedBosses).toHaveLength(0);
  });

  it("calculates level ups and increases max health", () => {
    const store = useGameStore.getState();
    // Adding 100 XP should level up to Level 3 (sqrt(100/25) + 1 = 3)
    const result = store.addXp(100);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(3);

    const updated = useGameStore.getState();
    expect(updated.level).toBe(3);
    expect(updated.rankTitle).toBe("Markup Apprentice");
    expect(updated.maxHp).toBe(120); // 100 + (3 - 1) * 10
  });

  it("tracks quest completions, rewards XP, stores star ratings, and awards speed_coder badge", () => {
    const store = useGameStore.getState();
    store.completeQuest("html_1_skeleton", "html", 3, 100);

    const state = useGameStore.getState();
    expect(state.completedQuests).toContain("html_1_skeleton");
    expect(state.stars["html_1_skeleton"]).toBe(3);
    expect(state.xp).toBe(100);
    expect(state.badges).toContain("speed_coder");

    // Duplicate completion should not award duplicate XP
    store.completeQuest("html_1_skeleton", "html", 2, 100);
    expect(useGameStore.getState().xp).toBe(100);
    // Highest star rating is preserved
    expect(useGameStore.getState().stars["html_1_skeleton"]).toBe(3);
  });

  it("unlocks the next realm upon boss defeat", () => {
    const store = useGameStore.getState();
    expect(store.unlockedRealms).not.toContain("css");

    store.defeatBoss("html", "slayer_of_divs", 350);

    const state = useGameStore.getState();
    expect(state.completedBosses).toContain("html");
    expect(state.badges).toContain("slayer_of_divs");
    expect(state.unlockedRealms).toContain("css");
    expect(state.xp).toBe(350);
  });

  it("awards master_of_the_matrix upon vanquishing all 12 realm guardians", () => {
    const store = useGameStore.getState();
    const realms = [
      "html", "css", "javascript", "typescript", "react", "backend",
      "databases", "devops", "testing", "cs", "security", "capstone"
    ];

    realms.forEach((r) => {
      store.defeatBoss(r, `slayer_${r}`, 100);
    });

    const state = useGameStore.getState();
    expect(state.completedBosses).toHaveLength(12);
    expect(state.badges).toContain("master_of_the_matrix");
  });

  it("handles damage, healing, and bounds", () => {
    const store = useGameStore.getState();
    const remainingHp = store.takeDamage(40);
    expect(remainingHp).toBe(60);
    expect(useGameStore.getState().hp).toBe(60);

    store.healPlayer(20);
    expect(useGameStore.getState().hp).toBe(80);

    // Cannot overheal beyond maxHp
    store.healPlayer(50);
    expect(useGameStore.getState().hp).toBe(store.maxHp);
  });

  it("guards skill point expenditure and prevents duplicate unlocks", () => {
    const store = useGameStore.getState();
    // Level 1 player has 0 or 1 point available, cannot afford 5 SP skill
    const success = store.unlockSkill("matrix_grandmaster", 5);
    expect(success).toBe(false);

    // Level up player by adding XP
    store.addXp(5000); // High level
    const state = useGameStore.getState();
    expect(state.level).toBeGreaterThanOrEqual(15);

    const affordable = state.unlockSkill("lint_shield", 2);
    expect(affordable).toBe(true);
    expect(useGameStore.getState().unlockedSkills).toContain("lint_shield");
    expect(useGameStore.getState().badges).toContain("skill_pioneer");

    // Duplicate unlock should fail and not double-spend or duplicate
    const duplicate = useGameStore.getState().unlockSkill("lint_shield", 2);
    expect(duplicate).toBe(false);
    expect(
      useGameStore.getState().unlockedSkills.filter((s) => s === "lint_shield")
    ).toHaveLength(1);

    // Unlock grandmaster
    const grandmaster = useGameStore.getState().unlockSkill("matrix_grandmaster", 5);
    expect(grandmaster).toBe(true);
    expect(useGameStore.getState().unlockedSkills).toContain("matrix_grandmaster");
    expect(useGameStore.getState().badges).toContain("grandmaster_matrix");
  });

  it("safely invokes all sound engine sound effects and BGM toggles in test environment", () => {
    const sfxTypes = [
      "click",
      "correct",
      "error",
      "attack",
      "boss-hit",
      "level-up",
      "victory",
      "skill-unlock",
      "badge-inspect",
      "heal",
    ] as const;

    sfxTypes.forEach((sfx) => {
      expect(() => soundEngine.playSfx(sfx)).not.toThrow();
    });

    expect(() => soundEngine.setMuted(true)).not.toThrow();
    expect(() => soundEngine.setVolume(0.5)).not.toThrow();
    expect(() => soundEngine.toggleBgm()).not.toThrow();
    expect(() => soundEngine.setMuted(false)).not.toThrow();
  });
});
