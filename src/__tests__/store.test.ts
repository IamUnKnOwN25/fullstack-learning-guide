import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "../lib/store";

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

  it("tracks quest completions, rewards XP, and stores star ratings", () => {
    const store = useGameStore.getState();
    store.completeQuest("html_1_skeleton", "html", 3, 100);

    const state = useGameStore.getState();
    expect(state.completedQuests).toContain("html_1_skeleton");
    expect(state.stars["html_1_skeleton"]).toBe(3);
    expect(state.xp).toBe(100);

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

  it("guards skill point expenditure", () => {
    const store = useGameStore.getState();
    // Level 1 player has 0 or 1 point available, cannot afford 5 SP skill
    const success = store.unlockSkill("matrix_grandmaster", 5);
    expect(success).toBe(false);

    // Level up player by adding XP
    store.addXp(2500); // High level
    const affordable = useGameStore.getState().unlockSkill("lint_shield", 2);
    expect(affordable).toBe(true);
    expect(useGameStore.getState().unlockedSkills).toContain("lint_shield");
  });
});
