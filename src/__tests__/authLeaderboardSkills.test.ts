import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { useAuthStore, AVATAR_OPTIONS } from "../lib/authStore";
import { useGameStore } from "../lib/gameStore";
import {
  TOP_OPERATIVES,
  LeaderboardEntry,
  LeaderboardMetric,
  buildRankedLeaderboard,
  filterLeaderboardEntries,
  getOperativeById,
  getLeaderboardStats,
} from "../data/leaderboard";
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

    it("builds ranked leaderboard with default XP metric and 1-based sequential ranks", () => {
      const ranked = buildRankedLeaderboard();
      expect(ranked).toHaveLength(TOP_OPERATIVES.length);
      expect(ranked[0].rank).toBe(1);
      expect(ranked[0].id).toBe("op-1"); // neo_architect with 62500 XP
      expect(ranked[ranked.length - 1].rank).toBe(TOP_OPERATIVES.length);

      // Verify strict descending XP order
      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].xp).toBeGreaterThanOrEqual(ranked[i + 1].xp);
        expect(ranked[i].rank).toBe(i + 1);
      }
    });

    it("ranks by stars, bosses, and curriculum with XP and level tie-breaking", () => {
      const rankedByStars = buildRankedLeaderboard(undefined, "stars");
      expect(rankedByStars[0].stars).toBe(72);
      // Neo and Ada both have 72 stars, Neo has 62500 XP vs Ada's 57600 XP -> Neo is rank 1, Ada is rank 2
      expect(rankedByStars[0].id).toBe("op-1");
      expect(rankedByStars[1].id).toBe("op-2");

      const rankedByBosses = buildRankedLeaderboard(undefined, "bosses");
      expect(rankedByBosses[0].bossesSlain).toBe(12);

      const rankedByBossesSlain = buildRankedLeaderboard(undefined, "bossesSlain");
      expect(rankedByBossesSlain[0].bossesSlain).toBe(12);

      const rankedByCurriculum = buildRankedLeaderboard(undefined, "curriculum");
      expect(rankedByCurriculum[0].curriculumCompleted).toBe(113);
      expect(rankedByCurriculum[0].id).toBe("op-1");

      const rankedByCurriculumCompleted = buildRankedLeaderboard(undefined, "curriculumCompleted");
      expect(rankedByCurriculumCompleted[0].curriculumCompleted).toBe(113);
    });

    it("handles multi-level tie-breaking down to username localeCompare", () => {
      const tiedEntries: LeaderboardEntry[] = [
        {
          id: "cadet-z",
          rank: 0,
          username: "zeta_operative",
          displayName: "Zeta Operative",
          avatarEmoji: "🤖",
          avatarBg: "bg-void",
          avatarBorder: "border-void",
          title: "Cadet",
          level: 10,
          xp: 1000,
          stars: 10,
          bossesSlain: 2,
          curriculumCompleted: 5,
          countryCode: "US",
          badge: "Novice",
        },
        {
          id: "cadet-a",
          rank: 0,
          username: "alpha_operative",
          displayName: "Alpha Operative",
          avatarEmoji: "🤖",
          avatarBg: "bg-void",
          avatarBorder: "border-void",
          title: "Cadet",
          level: 10,
          xp: 1000,
          stars: 10,
          bossesSlain: 2,
          curriculumCompleted: 5,
          countryCode: "US",
          badge: "Novice",
        },
        {
          id: "cadet-b",
          rank: 0,
          username: "beta_operative",
          displayName: "Beta Operative",
          avatarEmoji: "🤖",
          avatarBg: "bg-void",
          avatarBorder: "border-void",
          title: "Cadet",
          level: 10,
          xp: 1000,
          stars: 10,
          bossesSlain: 2,
          curriculumCompleted: 5,
          countryCode: "US",
          badge: "Novice",
        },
      ];

      const ranked = buildRankedLeaderboard(tiedEntries, "stars");
      expect(ranked.map((e) => e.username)).toEqual([
        "alpha_operative",
        "beta_operative",
        "zeta_operative",
      ]);
      expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3]);
    });

    it("sanitizes NaN, nullish, and invalid numeric values during ranking", () => {
      const corruptEntries: any[] = [
        {
          id: "corrupt-1",
          username: "corrupt_operative",
          displayName: "Corrupt Operative",
          avatarEmoji: "👾",
          avatarBg: "bg-void",
          avatarBorder: "border-void",
          title: "Glitch",
          level: NaN,
          xp: NaN,
          stars: null,
          bossesSlain: undefined,
          curriculumCompleted: "not-a-number",
          countryCode: "XX",
          badge: "Glitch",
        },
        {
          id: "valid-1",
          username: "valid_operative",
          displayName: "Valid Operative",
          avatarEmoji: "⚡",
          avatarBg: "bg-void",
          avatarBorder: "border-void",
          title: "Cadet",
          level: 5,
          xp: 500,
          stars: 10,
          bossesSlain: 1,
          curriculumCompleted: 2,
          countryCode: "US",
          badge: "Novice",
        },
      ];

      const ranked = buildRankedLeaderboard(corruptEntries);
      expect(ranked[0].id).toBe("valid-1");
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].id).toBe("corrupt-1");
      expect(ranked[1].rank).toBe(2);
    });

    it("does not mutate the input array when ranking", () => {
      const input = [
        { ...TOP_OPERATIVES[9], rank: 0 },
        { ...TOP_OPERATIVES[0], rank: 0 },
      ];
      const copy = [...input];
      buildRankedLeaderboard(input);
      expect(input[0].id).toBe(copy[0].id);
      expect(input[1].id).toBe(copy[1].id);
    });

    it("returns empty array when buildRankedLeaderboard is given empty array", () => {
      expect(buildRankedLeaderboard([])).toEqual([]);
    });

    it("filters leaderboard entries case-insensitively by username, displayName, title, badge, and tier", () => {
      const ranked = buildRankedLeaderboard();

      // Username search
      const neoResults = filterLeaderboardEntries(ranked, "neo_architect");
      expect(neoResults).toHaveLength(1);
      expect(neoResults[0].username).toBe("neo_architect");

      // Case-insensitive display name
      const adaResults = filterLeaderboardEntries(ranked, "ADA");
      expect(adaResults.some((e) => e.displayName === "Ada Lovelace")).toBe(true);

      // Title search
      const grandmasters = filterLeaderboardEntries(ranked, "grandmaster");
      expect(grandmasters.length).toBeGreaterThanOrEqual(2);

      // Tier search
      const withCustomTier: LeaderboardEntry[] = [
        ...ranked,
        {
          id: "custom-elite",
          rank: 99,
          username: "elite_operative",
          displayName: "Elite Operative",
          avatarEmoji: "🌟",
          avatarBg: "bg-void",
          avatarBorder: "border-void",
          title: "Vanguard",
          level: 60,
          xp: 99999,
          stars: 100,
          bossesSlain: 20,
          curriculumCompleted: 150,
          countryCode: "LIVE",
          badge: "Vanguard Badge",
          tier: "Diamond Matrix",
        },
      ];
      const tierResults = filterLeaderboardEntries(withCustomTier, "diamond");
      expect(tierResults).toHaveLength(1);
      expect(tierResults[0].id).toBe("custom-elite");

      // Whitespace query
      const trimmedResults = filterLeaderboardEntries(ranked, "   grace   ");
      expect(trimmedResults.some((e) => e.username === "grace_hopper")).toBe(true);

      // Empty query returns all entries
      expect(filterLeaderboardEntries(ranked, "")).toHaveLength(ranked.length);
      expect(filterLeaderboardEntries(ranked, "   ")).toHaveLength(ranked.length);

      // Unmatched query returns empty
      expect(filterLeaderboardEntries(ranked, "xyz_not_found_404")).toHaveLength(0);
    });

    it("looks up operative by id via getOperativeById", () => {
      const op1 = getOperativeById("op-1");
      expect(op1).toBeDefined();
      expect(op1?.username).toBe("neo_architect");
      expect(op1?.rank).toBe(1);

      const op10 = getOperativeById("op-10");
      expect(op10).toBeDefined();
      expect(op10?.username).toBe("tim_hypertext");
      expect(op10?.rank).toBe(10);

      expect(getOperativeById("unknown-id")).toBeUndefined();
      expect(getOperativeById("")).toBeUndefined();
    });

    it("computes aggregate leaderboard stats accurately with getLeaderboardStats", () => {
      const stats = getLeaderboardStats();
      expect(stats.totalOperatives).toBe(TOP_OPERATIVES.length);
      expect(stats.topXp).toBe(62500);
      expect(stats.averageXp).toBe(26612.5);
      expect(stats.averageLevel).toBe(28.9);

      // Empty entries test
      const emptyStats = getLeaderboardStats([]);
      expect(emptyStats).toEqual({
        totalOperatives: 0,
        averageXp: 0,
        topXp: 0,
        averageLevel: 0,
      });

      // Sanitization with corrupt / missing values
      const customEntries: any[] = [
        { xp: 1000, level: 10 },
        { xp: NaN, level: undefined },
        { xp: 2000, level: 20 },
      ];
      const customStats = getLeaderboardStats(customEntries as LeaderboardEntry[]);
      expect(customStats.totalOperatives).toBe(3);
      expect(customStats.topXp).toBe(2000);
      expect(customStats.averageXp).toBe(1000); // (1000 + 0 + 2000) / 3
      expect(customStats.averageLevel).toBe(10); // (10 + 0 + 20) / 3
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

    it("restricts telemetry and progression details until user login across modals", () => {
      // ProfileModal classified gates
      const profilePath = path.join(process.cwd(), "src/components/ProfileModal.tsx");
      const profileContent = fs.readFileSync(profilePath, "utf-8");
      expect(profileContent).toContain("Classified Operative Dossier");
      expect(profileContent).toContain("REDACTED // Identity records and custom bio require cadet login");
      expect(profileContent).toContain("CLASSIFIED");
      expect(profileContent).toContain("Cloud save backup requires login");

      // LeaderboardModal classified gates
      const leaderboardPath = path.join(process.cwd(), "src/components/LeaderboardModal.tsx");
      const leaderboardContent = fs.readFileSync(leaderboardPath, "utf-8");
      expect(leaderboardContent).toContain("Operative Telemetry Restricted");
      expect(leaderboardContent).toContain("Classified Operative");
      expect(leaderboardContent).toContain("Guest Operative (Unranked)");
      expect(leaderboardContent).toContain("Sign In to Rank");

      // AchievementsModal classified gates
      const achievePath = path.join(process.cwd(), "src/components/AchievementsModal.tsx");
      const achieveContent = fs.readFileSync(achievePath, "utf-8");
      expect(achieveContent).toContain("Trophy Room Honors Restricted");
      expect(achieveContent).toContain("CLASSIFIED HONOR // Login to reveal requirements");
      expect(achieveContent).toContain("Sign In to Claim");

      // SkillTreeModal classified gates
      const skillPath = path.join(process.cwd(), "src/components/SkillTreeModal.tsx");
      const skillContent = fs.readFileSync(skillPath, "utf-8");
      expect(skillPath).toBeDefined();
      expect(skillContent).toContain("Cybernetic Passives Restricted");
      expect(skillContent).toContain("CLASSIFIED CYBERNETIC PERK // Login required to inspect & allocate");
      expect(skillContent).toContain("Sign In to Unlock Perk");
    });

    it("enforces Curriculum Knowledge Vault is gated behind login with classified vault view", () => {
      const curriculumPath = path.join(process.cwd(), "src/components/CurriculumViewer.tsx");
      const curriculumContent = fs.readFileSync(curriculumPath, "utf-8");

      expect(curriculumContent).toContain("useAuthStore");
      expect(curriculumContent).toContain("Sign In to Unlock Vault");
      expect(curriculumContent).toContain("Classified Curriculum Knowledge Vault");
      expect(curriculumContent).toContain("Restricted Access // Operative Authentication Required");
      expect(curriculumContent).toContain("13-Chapter Curriculum Syllabus");
      expect(curriculumContent).toContain("<AuthModal");
      expect(curriculumContent).toContain("CLASSIFIED CHAPTER // LOGIN REQUIRED");
    });
  });
});
