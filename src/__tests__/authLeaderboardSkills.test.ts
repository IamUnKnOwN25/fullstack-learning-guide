import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { useAuthStore, AVATAR_OPTIONS } from "../lib/authStore";
import { useGameStore } from "../lib/gameStore";
import { TOP_OPERATIVES, LeaderboardEntry } from "../data/leaderboard";
import { SKILL_TREE, SkillCategory } from "../data/skills";
import { ACHIEVEMENTS, RARITY_CONFIG } from "../data/achievements";

describe("RPG Progression Systems: Auth, Leaderboard, Skills & Achievements", () => {
  beforeEach(() => {
    // Reset stores to default state
    useAuthStore.setState({
      currentUser: {
        id: "guest-player",
        username: "guest_cadet",
        displayName: "Guest Operative",
        avatarId: "neon-hacker",
        customBio: "Unauthenticated guest operative traversing the matrix.",
        title: "Matrix Cadet",
        joinedAt: new Date().toISOString(),
        isGuest: true,
        showcaseBadgeId: "first_byte",
      },
      isAuthenticated: false,
      accounts: {},
    });

    useGameStore.setState({
      xp: 0,
      level: 1,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      streak: 1,
      unlockedSkills: [],
      badges: [],
      claimedAchievements: [],
      completedQuests: [],
      completedBosses: [],
      stars: {},
      completedCurriculumTasks: [],
    });
  });

  describe("Authentication Vault & Profile Store", () => {
    it("starts in guest mode by default with valid avatar and profile", () => {
      const { currentUser, isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(currentUser.isGuest).toBe(true);
      expect(currentUser.displayName).toBe("Guest Operative");
      expect(AVATAR_OPTIONS.some((a) => a.id === currentUser.avatarId)).toBe(true);
    });

    it("rejects sign-up attempts with short or blank credentials", () => {
      const { signup } = useAuthStore.getState();

      const shortUser = signup("ab", "Alice", "secretpass123", "cyber-ninja");
      expect(shortUser.success).toBe(false);
      expect(shortUser.message).toContain("at least 3");

      const shortPass = signup("alice_matrix", "Alice", "123", "cyber-ninja");
      expect(shortPass.success).toBe(false);
      expect(shortPass.message).toContain("at least 4");
    });

    it("successfully creates an authenticated account and logs in", () => {
      const { signup } = useAuthStore.getState();

      const res = signup("neo_cadet", "Neo", "zion2026", "matrix-architect");
      expect(res.success).toBe(true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.currentUser.username).toBe("neo_cadet");
      expect(state.currentUser.displayName).toBe("Neo");
      expect(state.currentUser.avatarId).toBe("matrix-architect");
      expect(state.currentUser.isGuest).toBe(false);
      expect(state.accounts["neo_cadet"]).toBeDefined();
    });

    it("prevents duplicate usernames during sign-up", () => {
      const { signup } = useAuthStore.getState();
      signup("trinity", "Trinity", "matrix123", "cyber-ninja");

      const duplicate = signup("trinity", "Trinity Two", "matrix456", "synth-ai");
      expect(duplicate.success).toBe(false);
      expect(duplicate.message).toContain("already exists");
    });

    it("handles login with wrong password and successful login", () => {
      const { signup, logout, login } = useAuthStore.getState();
      signup("morpheus", "Morpheus", "redpill123", "cyber-ninja");

      // Log out back to guest
      logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Wrong pass
      const wrong = login("morpheus", "bluepill");
      expect(wrong.success).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Right pass
      const ok = login("morpheus", "redpill123");
      expect(ok.success).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().currentUser.username).toBe("morpheus");
    });

    it("allows updating profile attributes (bio, displayName, avatarId)", () => {
      const { updateProfile } = useAuthStore.getState();
      updateProfile({
        displayName: "Agent Smith",
        customBio: "Purpose is the inevitable destiny.",
        avatarId: "code-mage",
      });

      const updated = useAuthStore.getState().currentUser;
      expect(updated.displayName).toBe("Agent Smith");
      expect(updated.customBio).toBe("Purpose is the inevitable destiny.");
      expect(updated.avatarId).toBe("code-mage");
    });
  });

  describe("Global Matrix Leaderboard", () => {
    it("contains simulated top operatives with realistic stats", () => {
      expect(TOP_OPERATIVES.length).toBeGreaterThanOrEqual(8);

      TOP_OPERATIVES.forEach((op) => {
        expect(op.username).toBeTruthy();
        expect(op.displayName).toBeTruthy();
        expect(op.level).toBeGreaterThan(0);
        expect(op.xp).toBeGreaterThan(0);
        expect(op.stars).toBeGreaterThan(0);
        expect(op.bossesSlain).toBeGreaterThanOrEqual(0);
        expect(op.curriculumCompleted).toBeGreaterThanOrEqual(0);
        expect(op.avatarEmoji).toBeTruthy();
      });
    });

    it("correctly sorts operatives across leaderboard categories", () => {
      const pool = [...TOP_OPERATIVES];

      const byXp = [...pool].sort((a, b) => b.xp - a.xp);
      expect(byXp[0].xp).toBeGreaterThanOrEqual(byXp[1].xp);

      const byStars = [...pool].sort((a, b) => b.stars - a.stars);
      expect(byStars[0].stars).toBeGreaterThanOrEqual(byStars[1].stars);

      const byBosses = [...pool].sort((a, b) => b.bossesSlain - a.bossesSlain);
      expect(byBosses[0].bossesSlain).toBeGreaterThanOrEqual(byBosses[1].bossesSlain);

      const byCurriculum = [...pool].sort(
        (a, b) => b.curriculumCompleted - a.curriculumCompleted
      );
      expect(byCurriculum[0].curriculumCompleted).toBeGreaterThanOrEqual(
        byCurriculum[1].curriculumCompleted
      );
    });
  });

  describe("Expanded Cybernetic Skill Tree", () => {
    it("features exactly 15 skills across 5 distinct branches", () => {
      expect(SKILL_TREE.length).toBe(15);

      const categories: SkillCategory[] = [
        "foundations",
        "frontend",
        "backend",
        "devops",
        "mastery",
      ];

      categories.forEach((cat) => {
        const branchSkills = SKILL_TREE.filter((s) => s.category === cat);
        expect(branchSkills.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("ensures all skill prerequisite references exist in the skill tree", () => {
      const skillIds = new Set(SKILL_TREE.map((s) => s.id));

      SKILL_TREE.forEach((skill) => {
        if (skill.prerequisiteId) {
          expect(skillIds.has(skill.prerequisiteId)).toBe(true);
        }
        expect([1, 2, 3]).toContain(skill.tier);
        expect(skill.statBonus).toBeDefined();
      });
    });
  });

  describe("Trophy & Achievement System", () => {
    it("features 18 achievements across 4 categories and valid rarity tags", () => {
      expect(ACHIEVEMENTS.length).toBe(18);

      ACHIEVEMENTS.forEach((ach) => {
        expect(ach.id).toBeTruthy();
        expect(ach.name).toBeTruthy();
        expect(ach.description).toBeTruthy();
        expect(ach.xpReward).toBeGreaterThan(0);
        expect(RARITY_CONFIG[ach.rarity]).toBeDefined();
      });
    });

    it("evaluates achievement progress and unlock conditions dynamically", () => {
      const bossAch = ACHIEVEMENTS.find((a) => a.id === "first_blood_boss");
      expect(bossAch).toBeDefined();

      const emptyProgress = bossAch!.checkProgress(useGameStore.getState());
      expect(emptyProgress.isUnlocked).toBe(false);
      expect(emptyProgress.current).toBe(0);

      // Slay HTML boss
      useGameStore.setState({ completedBosses: ["html"] });
      const completedProgress = bossAch!.checkProgress(useGameStore.getState());
      expect(completedProgress.isUnlocked).toBe(true);
      expect(completedProgress.current).toBe(1);
    });

    it("claims achievement rewards only once per achievement", () => {
      const { claimAchievement } = useGameStore.getState();

      const initialXp = useGameStore.getState().xp;
      const claimedFirst = claimAchievement("first_blood_boss", 100);
      expect(claimedFirst).toBe(true);
      expect(useGameStore.getState().xp).toBe(initialXp + 100);
      expect(useGameStore.getState().claimedAchievements).toContain("first_blood_boss");

      // Duplicate claim must fail
      const claimedSecond = claimAchievement("first_blood_boss", 100);
      expect(claimedSecond).toBe(false);
      expect(useGameStore.getState().xp).toBe(initialXp + 100);
    });
  });

  describe("UI Layout & Modal Containment Invariants", () => {
    it("enforces human-proportioned max widths on Profile, Auth, and Leaderboard modals", () => {
      const profilePath = path.join(process.cwd(), "src/components/ProfileModal.tsx");
      const authPath = path.join(process.cwd(), "src/components/AuthModal.tsx");
      const leaderboardPath = path.join(process.cwd(), "src/components/LeaderboardModal.tsx");

      const profileContent = fs.readFileSync(profilePath, "utf-8");
      expect(profileContent).toContain("max-w-2xl");
      expect(profileContent).not.toContain("max-w-[1920px]");

      const authContent = fs.readFileSync(authPath, "utf-8");
      expect(authContent).toContain("max-w-lg");
      expect(authContent).not.toContain("max-w-[1920px]");

      const leaderboardContent = fs.readFileSync(leaderboardPath, "utf-8");
      expect(leaderboardContent).toContain("max-w-3xl");
      expect(leaderboardContent).not.toContain("max-w-[1920px]");
    });

    it("enforces NavigationHud connects Profile, Auth, and Leaderboard modals with responsive triggers", () => {
      const hudPath = path.join(process.cwd(), "src/components/NavigationHud.tsx");
      const hudContent = fs.readFileSync(hudPath, "utf-8");

      expect(hudContent).toContain("<ProfileModal");
      expect(hudContent).toContain("<AuthModal");
      expect(hudContent).toContain("<LeaderboardModal");
      expect(hudContent).toContain("Operative Dossier");
      expect(hudContent).toContain("Global Matrix Leaderboards");
      expect(hudContent).toContain("Ranks");
    });

    it("strictly follows React Rules of Hooks in LeaderboardModal by calling all hooks before early return", () => {
      const leaderboardPath = path.join(process.cwd(), "src/components/LeaderboardModal.tsx");
      const content = fs.readFileSync(leaderboardPath, "utf-8");

      const ifNotOpenIndex = content.indexOf("if (!isOpen) return null;");
      const firstUseMemoIndex = content.indexOf("useMemo(");
      const lastUseMemoIndex = content.lastIndexOf("useMemo(");

      expect(firstUseMemoIndex).toBeGreaterThan(0);
      expect(lastUseMemoIndex).toBeGreaterThan(0);
      expect(ifNotOpenIndex).toBeGreaterThan(0);

      // All useMemo calls must precede 'if (!isOpen) return null;'
      expect(firstUseMemoIndex).toBeLessThan(ifNotOpenIndex);
      expect(lastUseMemoIndex).toBeLessThan(ifNotOpenIndex);
    });

    it("ensures modal category tabs wrap cleanly without horizontal scrollbars or clipping", () => {
      const achievePath = path.join(process.cwd(), "src/components/AchievementsModal.tsx");
      const achieveContent = fs.readFileSync(achievePath, "utf-8");
      expect(achieveContent).toContain("flex flex-wrap items-center gap-1.5 sm:gap-2");
      expect(achieveContent).not.toContain("overflow-x-auto scrollbar-none whitespace-nowrap");

      const cssPath = path.join(process.cwd(), "src/app/globals.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain(".scrollbar-none::-webkit-scrollbar");
      expect(cssContent).toContain("scrollbar-width: none !important;");
    });
  });
});
