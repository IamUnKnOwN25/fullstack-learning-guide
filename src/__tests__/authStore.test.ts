import { describe, it, expect, beforeEach } from "vitest";
import {
  useAuthStore,
  getAvatarById,
  validateUsername,
  validatePassphrase,
  hashPassword,
  DEFAULT_GUEST_USER,
  AVATAR_OPTIONS,
} from "../lib/authStore";
import { useGameStore } from "../lib/gameStore";

describe("useAuthStore & Auth Utilities", () => {
  beforeEach(() => {
    // Reset stores to default clean state
    useAuthStore.setState({
      currentUser: { ...DEFAULT_GUEST_USER },
      accounts: {},
      isAuthenticated: false,
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

  describe("getAvatarById", () => {
    it("returns the corresponding avatar when valid id is passed", () => {
      const ninja = getAvatarById("cyber-ninja");
      expect(ninja.id).toBe("cyber-ninja");
      expect(ninja.name).toBe("Cyber Ninja");

      const hacker = getAvatarById("neon-hacker");
      expect(hacker.id).toBe("neon-hacker");
    });

    it("falls back to default first avatar when id is unknown, empty, or nullish", () => {
      const defaultAvatar = AVATAR_OPTIONS[0];
      expect(getAvatarById("unknown-cyber-avatar")).toEqual(defaultAvatar);
      expect(getAvatarById("")).toEqual(defaultAvatar);
      expect(getAvatarById(null)).toEqual(defaultAvatar);
      expect(getAvatarById(undefined)).toEqual(defaultAvatar);
    });
  });

  describe("validateUsername", () => {
    it("rejects empty or whitespace-only inputs", () => {
      expect(validateUsername("").valid).toBe(false);
      expect(validateUsername("   ").valid).toBe(false);
    });

    it("rejects usernames shorter than 3 alphanumeric characters", () => {
      expect(validateUsername("ab").valid).toBe(false);
      expect(validateUsername("a").valid).toBe(false);
      expect(validateUsername("  z  ").valid).toBe(false);
    });

    it("rejects strings containing only symbols after sanitization", () => {
      expect(validateUsername("!@#$%^&*()").valid).toBe(false);
    });

    it("accepts valid alphanumeric usernames with underscores", () => {
      expect(validateUsername("neo_matrix").valid).toBe(true);
      expect(validateUsername("cadet101").valid).toBe(true);
      expect(validateUsername("Agent_007").valid).toBe(true);
    });
  });

  describe("validatePassphrase", () => {
    it("rejects empty or shorter than 4 characters", () => {
      expect(validatePassphrase("").valid).toBe(false);
      expect(validatePassphrase("abc").valid).toBe(false);
      expect(validatePassphrase("12").valid).toBe(false);
    });

    it("accepts passphrases with 4 or more characters", () => {
      expect(validatePassphrase("pass").valid).toBe(true);
      expect(validatePassphrase("super_secure_key_123").valid).toBe(true);
    });
  });

  describe("hashPassword", () => {
    it("returns deterministic hashes prefixed with hash_", () => {
      const h1 = hashPassword("secret123");
      const h2 = hashPassword("secret123");
      expect(h1).toBe(h2);
      expect(h1.startsWith("hash_")).toBe(true);
    });

    it("returns different hashes for different inputs", () => {
      expect(hashPassword("keyA")).not.toBe(hashPassword("keyB"));
    });
  });

  describe("useAuthStore Core Workflows", () => {
    it("initializes with guest credentials", () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentUser.isGuest).toBe(true);
      expect(state.currentUser.username).toBe("cadet_guest");
    });

    it("prevents signup with invalid username or password", () => {
      const res1 = useAuthStore.getState().signup("ab", "Shorty", "secret123");
      expect(res1.success).toBe(false);

      const res2 = useAuthStore.getState().signup("neo_hacker", "Neo", "12");
      expect(res2.success).toBe(false);
    });

    it("successfully creates a new operative account and authenticates", () => {
      useGameStore.setState({ xp: 500, badges: ["first_byte"] });

      const res = useAuthStore.getState().signup("trinity", "Trinity Operator", "zionPass123", "code-mage");
      expect(res.success).toBe(true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.currentUser.username).toBe("trinity");
      expect(state.currentUser.displayName).toBe("Trinity Operator");
      expect(state.currentUser.avatarId).toBe("code-mage");
      expect(state.currentUser.isGuest).toBe(false);

      // Account saved with game stats snapshot
      expect(state.accounts["trinity"]).toBeDefined();
      expect(state.accounts["trinity"].gameStatsSnapshot?.xp).toBe(500);
    });

    it("prevents duplicate username registration", () => {
      useAuthStore.getState().signup("morpheus", "Morpheus", "nebuchadnezzar1");
      const duplicateRes = useAuthStore.getState().signup("morpheus", "Morpheus 2", "otherpass");
      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.message).toContain("already exists");
    });

    it("handles login failure for missing account or wrong passphrase", () => {
      const notFoundRes = useAuthStore.getState().login("ghost_user", "somepass");
      expect(notFoundRes.success).toBe(false);
      expect(notFoundRes.message).toContain("not found");

      useAuthStore.getState().signup("cypher", "Cypher", "steakpass");
      useAuthStore.getState().logout();

      const wrongPassRes = useAuthStore.getState().login("cypher", "wrongpass");
      expect(wrongPassRes.success).toBe(false);
      expect(wrongPassRes.message).toContain("Incorrect");
    });

    it("logs in successfully and restores operative game snapshot", () => {
      // Setup account with high XP
      useGameStore.setState({ xp: 1250, completedQuests: ["html-01", "css-01"] });
      useAuthStore.getState().signup("switch", "Switch", "white_suit_12");
      useAuthStore.getState().logout();

      // Reset game store as if another user or guest played
      useGameStore.setState({ xp: 50, completedQuests: [] });

      const loginRes = useAuthStore.getState().login("switch", "white_suit_12");
      expect(loginRes.success).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().currentUser.username).toBe("switch");

      // Verify game store was restored
      expect(useGameStore.getState().xp).toBe(1250);
      expect(useGameStore.getState().completedQuests).toContain("html-01");
    });

    it("updates profile and syncs back to accounts registry", () => {
      useAuthStore.getState().signup("tank", "Tank Operator", "matrixOperator");
      useAuthStore.getState().updateProfile({
        displayName: "Tank Prime",
        customBio: "Operator of the Nebuchadnezzar broadcast systems.",
      });

      const state = useAuthStore.getState();
      expect(state.currentUser.displayName).toBe("Tank Prime");
      expect(state.accounts["tank"].profile.displayName).toBe("Tank Prime");
    });

    it("switches accounts seamlessly between saved profiles", () => {
      useAuthStore.getState().signup("operator1", "Op One", "pass111");
      useAuthStore.getState().signup("operator2", "Op Two", "pass222");

      expect(useAuthStore.getState().currentUser.username).toBe("operator2");

      const switched = useAuthStore.getState().switchAccount("operator1");
      expect(switched).toBe(true);
      expect(useAuthStore.getState().currentUser.username).toBe("operator1");

      const failedSwitch = useAuthStore.getState().switchAccount("nonexistent");
      expect(failedSwitch).toBe(false);
    });

    it("logout snapshots latest game progress and resets to guest state", () => {
      useAuthStore.getState().signup("dozer", "Dozer", "passDozer");
      useGameStore.setState({ xp: 999 });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentUser.isGuest).toBe(true);
      expect(state.accounts["dozer"].gameStatsSnapshot?.xp).toBe(999);
    });

    it("continueAsGuest resets authentication state safely", () => {
      useAuthStore.getState().signup("apoc", "Apoc", "apocPass");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().continueAsGuest();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().currentUser.isGuest).toBe(true);
    });
  });
});
