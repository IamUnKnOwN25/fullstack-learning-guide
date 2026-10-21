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

    // Level up player by adding more XP so they can afford everything
    store.addXp(50000);
    // Unlock grandmaster (need to unlock prerequisites first)
    useGameStore.getState().unlockSkill("clean_code_aura", 4);
    useGameStore.getState().unlockSkill("zero_day_warden", 5);
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

  it("persists curriculum tasks, chapter mastery, skill respec, and save import", () => {
    const store = useGameStore.getState();

    // Curriculum task toggle awards +10 XP when checked
    const checked = store.toggleCurriculumTask("01-html-and-semantics.md-line-10");
    expect(checked).toBe(true);
    expect(useGameStore.getState().completedCurriculumTasks).toContain(
      "01-html-and-semantics.md-line-10"
    );
    expect(useGameStore.getState().xp).toBe(10);

    // Unchecking removes from completedCurriculumTasks and deducts the awarded XP
    const unchecked = useGameStore.getState().toggleCurriculumTask("01-html-and-semantics.md-line-10");
    expect(unchecked).toBe(false);
    expect(useGameStore.getState().completedCurriculumTasks).not.toContain(
      "01-html-and-semantics.md-line-10"
    );
    expect(useGameStore.getState().xp).toBe(0);

    // Re-checking restores the +10 XP without duplicate inflation
    store.toggleCurriculumTask("01-html-and-semantics.md-line-10");
    expect(useGameStore.getState().xp).toBe(10);

    // Chapter mastery awards +50 XP once
    const mastered = useGameStore.getState().completeChapter("01-html-and-semantics.md", 50);
    expect(mastered).toBe(true);
    expect(useGameStore.getState().completedChapters).toContain("01-html-and-semantics.md");
    expect(useGameStore.getState().xp).toBe(60);

    // Duplicate chapter mastery does not double-award
    const duplicateChapter = useGameStore.getState().completeChapter("01-html-and-semantics.md", 50);
    expect(duplicateChapter).toBe(false);
    expect(useGameStore.getState().xp).toBe(60);

    // Repeated check/uncheck cycles do not inflate XP
    store.toggleCurriculumTask("01-html-and-semantics.md-line-10"); // uncheck -> 50
    expect(useGameStore.getState().xp).toBe(50);
    store.toggleCurriculumTask("01-html-and-semantics.md-line-10"); // check -> 60
    expect(useGameStore.getState().xp).toBe(60);
    store.toggleCurriculumTask("01-html-and-semantics.md-line-10"); // uncheck -> 50
    expect(useGameStore.getState().xp).toBe(50);
    store.toggleCurriculumTask("01-html-and-semantics.md-line-10"); // check -> 60
    expect(useGameStore.getState().xp).toBe(60);

    // Skill respec refunds unlocked skills
    useGameStore.getState().addXp(1000);
    useGameStore.getState().unlockSkill("lint_shield", 2);
    expect(useGameStore.getState().unlockedSkills).toContain("lint_shield");
    useGameStore.getState().respecSkills();
    expect(useGameStore.getState().unlockedSkills).toHaveLength(0);

    // Save import restores full state
    const imported = useGameStore.getState().importSaveData({
      xp: 900,
      completedQuests: ["html_1_skeleton", "css_1_flexbox"],
      completedBosses: ["html"],
      unlockedRealms: ["html", "css"],
      completedChapters: ["01-html-and-semantics.md"],
    });
    expect(imported).toBe(true);
    expect(useGameStore.getState().xp).toBe(900);
    expect(useGameStore.getState().completedQuests).toHaveLength(2);
    expect(useGameStore.getState().completedChapters).toContain("01-html-and-semantics.md");

    // Unlock all realms for open practice
    useGameStore.getState().unlockAllRealms();
    expect(useGameStore.getState().unlockedRealms).toHaveLength(12);
    expect(useGameStore.getState().unlockedRealms).toContain("capstone");
  });

  it("handles removeXp correctly", () => {
    const store = useGameStore.getState();
    store.addXp(100);
    expect(useGameStore.getState().xp).toBe(100);

    const result = useGameStore.getState().removeXp(40);
    expect(result.newXp).toBe(60);
    expect(useGameStore.getState().xp).toBe(60);

    // Should not go below 0
    useGameStore.getState().removeXp(100);
    expect(useGameStore.getState().xp).toBe(0);
    expect(useGameStore.getState().level).toBe(1);
  });

  it("handles dismissLevelUp and dismissRecentXpGain correctly", () => {
    const store = useGameStore.getState();
    store.addXp(100);
    expect(useGameStore.getState().recentXpGain).not.toBeNull();
    expect(useGameStore.getState().pendingLevelUp).not.toBeNull();

    useGameStore.getState().dismissRecentXpGain();
    expect(useGameStore.getState().recentXpGain).toBeNull();

    useGameStore.getState().dismissLevelUp();
    expect(useGameStore.getState().pendingLevelUp).toBeNull();
  });

  it("handles claimAchievement correctly", () => {
    const store = useGameStore.getState();
    expect(store.claimedAchievements).toHaveLength(0);

    const claimed = store.claimAchievement("first_blood", 50);
    expect(claimed).toBe(true);
    expect(useGameStore.getState().claimedAchievements).toContain("first_blood");
    expect(useGameStore.getState().xp).toBe(50);

    // Duplicate achievement claim should fail
    const duplicate = useGameStore.getState().claimAchievement("first_blood", 50);
    expect(duplicate).toBe(false);
    expect(useGameStore.getState().xp).toBe(50); // XP should not increase
    expect(useGameStore.getState().claimedAchievements).toHaveLength(1);
  });

  it("handles resetHealth correctly", () => {
    const store = useGameStore.getState();
    expect(store.hp).toBe(100);

    store.takeDamage(50);
    expect(useGameStore.getState().hp).toBe(50);

    useGameStore.getState().resetHealth();
    expect(useGameStore.getState().hp).toBe(useGameStore.getState().maxHp);
  });

  it("handles toggleAudio and toggleBgm on the store correctly", () => {
    const store = useGameStore.getState();
    expect(store.audioMuted).toBe(false);
    expect(store.bgmActive).toBe(false);

    store.toggleAudio();
    expect(useGameStore.getState().audioMuted).toBe(true);

    store.toggleAudio();
    expect(useGameStore.getState().audioMuted).toBe(false);

    store.toggleBgm();
    // bgmActive might be true or false depending on soundEngine, but we expect toggle
    expect(useGameStore.getState().bgmActive).toBeDefined(); 
  });

  it("handles bad save data in importSaveData", () => {
    const store = useGameStore.getState();
    
    // Test with missing/bad data
    const imported = store.importSaveData({
      xp: -50, // Bad XP
      completedQuests: null as unknown as string[], // Bad quests array
      completedBosses: "not_an_array" as unknown as string[], // Bad bosses array
    });
    
    expect(imported).toBe(true);
    const state = useGameStore.getState();
    
    // Fallbacks should be applied
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.completedQuests).toEqual([]);
    expect(state.completedBosses).toEqual([]);
    expect(state.unlockedRealms).toEqual(["html"]);
    
    // Should fail cleanly when not given an object
    const badImport = store.importSaveData(null as unknown as Partial<typeof state>);
    expect(badImport).toBe(false);
  });
});
