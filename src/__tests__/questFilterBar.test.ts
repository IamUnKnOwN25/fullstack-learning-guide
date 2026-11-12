import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  filterQuestsList,
  DifficultyLevel,
  FilterableQuest,
  getQuestDifficulty,
  sortQuestsList,
  groupQuestsByRealm,
} from "../lib/questFilter";

describe("QuestFilterBar", () => {
  it("enforces QuestFilterBar component UI rendering invariants", () => {
    const componentPath = path.join(process.cwd(), "src/components/QuestFilterBar.tsx");
    const componentContent = fs.readFileSync(componentPath, "utf-8");

    // Check for icons
    expect(componentContent).toContain("lucide-react");
    expect(componentContent).toContain("<Search");
    expect(componentContent).toContain("<Layers");
    expect(componentContent).toContain("<Zap");

    // Check for props
    expect(componentContent).toContain("searchQuery");
    expect(componentContent).toContain("setSearchQuery");
    expect(componentContent).toContain("selectedRealm");
    expect(componentContent).toContain("setSelectedRealm");
    expect(componentContent).toContain("difficulty");
    expect(componentContent).toContain("setDifficulty");

    // Check for input and selects
    expect(componentContent).toContain("<input");
    expect(componentContent).toContain("<select");
    expect(componentContent).toContain("REALMS.map");
  });

  describe("filterQuestsList", () => {
    const mockQuests: FilterableQuest[] = [
      { id: "q1", realmId: "html", title: "HTML Basics", conceptSummary: "Learn tags", xpReward: 10 },
      { id: "q2", realmId: "html", title: "Advanced Forms", conceptSummary: "Complex form logic", xpReward: 40 },
      { id: "q3", realmId: "css", title: "CSS Grid", storyIntro: "Layouts are fun", xpReward: 80 },
    ];

    it("filters by search query", () => {
      const result = filterQuestsList(mockQuests, "basics", "All", "All");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("q1");

      const result2 = filterQuestsList(mockQuests, "layout", "All", "All");
      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe("q3");
    });

    it("trims whitespace from search queries", () => {
      const trimmed = filterQuestsList(mockQuests, "   basics   ", "All", "All");
      expect(trimmed).toHaveLength(1);
      expect(trimmed[0].id).toBe("q1");

      const emptyAfterTrim = filterQuestsList(mockQuests, "    ", "All", "All");
      expect(emptyAfterTrim).toHaveLength(3);
    });

    it("filters by realmId and handles case-insensitivity", () => {
      const result = filterQuestsList(mockQuests, "", "css", "All");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("q3");

      const upperRealm = filterQuestsList(mockQuests, "", "CSS", "All");
      expect(upperRealm).toHaveLength(1);
      expect(upperRealm[0].id).toBe("q3");

      const result2 = filterQuestsList(mockQuests, "", "html", "All");
      expect(result2).toHaveLength(2);
      expect(result2.map((q) => q.id)).toEqual(["q1", "q2"]);
    });

    it("filters by difficulty", () => {
      const beginner = filterQuestsList(mockQuests, "", "All", "Beginner");
      expect(beginner).toHaveLength(1);
      expect(beginner[0].id).toBe("q1");

      const intermediate = filterQuestsList(mockQuests, "", "All", "Intermediate");
      expect(intermediate).toHaveLength(1);
      expect(intermediate[0].id).toBe("q2");

      const advanced = filterQuestsList(mockQuests, "", "All", "Advanced");
      expect(advanced).toHaveLength(1);
      expect(advanced[0].id).toBe("q3");
    });

    it("handles boundary XP values for difficulty tiers", () => {
      const boundaryQuests: FilterableQuest[] = [
        { id: "b0", realmId: "test", title: "Zero XP", xpReward: 0 },
        { id: "b25", realmId: "test", title: "Beginner Max", xpReward: 25 },
        { id: "b26", realmId: "test", title: "Intermediate Min", xpReward: 26 },
        { id: "b74", realmId: "test", title: "Intermediate Max", xpReward: 74 },
        { id: "b75", realmId: "test", title: "Advanced Min", xpReward: 75 },
        { id: "b100", realmId: "test", title: "Advanced High", xpReward: 100 },
      ];

      const beginners = filterQuestsList(boundaryQuests, "", "All", "Beginner");
      expect(beginners.map((q) => q.id)).toEqual(["b0", "b25"]);

      const intermediates = filterQuestsList(boundaryQuests, "", "All", "Intermediate");
      expect(intermediates.map((q) => q.id)).toEqual(["b26", "b74"]);

      const advanceds = filterQuestsList(boundaryQuests, "", "All", "Advanced");
      expect(advanceds.map((q) => q.id)).toEqual(["b75", "b100"]);
    });

    it("gracefully handles undefined or missing properties", () => {
      const sparseQuests: FilterableQuest[] = [
        { id: "s1", realmId: "html", title: "Bare Quest" },
        { id: "s2", realmId: "css", title: "No Summary", storyIntro: "Intro only", xpReward: 50 },
      ];

      const searchMatch = filterQuestsList(sparseQuests, "bare", "All", "All");
      expect(searchMatch).toHaveLength(1);
      expect(searchMatch[0].id).toBe("s1");

      // Default 0 XP matches Beginner
      const beginnerMatch = filterQuestsList(sparseQuests, "", "All", "Beginner");
      expect(beginnerMatch).toHaveLength(1);
      expect(beginnerMatch[0].id).toBe("s1");
    });

    it("combines filters correctly", () => {
      const result = filterQuestsList(mockQuests, "form", "html", "Intermediate");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("q2");

      const empty = filterQuestsList(mockQuests, "form", "css", "Intermediate");
      expect(empty).toHaveLength(0);
    });

    it("returns empty array when quests is null, undefined, or not an array", () => {
      expect(filterQuestsList(null, "basics", "All", "All")).toEqual([]);
      expect(filterQuestsList(undefined, "basics", "All", "All")).toEqual([]);
      expect(filterQuestsList("not-an-array" as any, "basics", "All", "All")).toEqual([]);
      expect(filterQuestsList(123 as any, "basics", "All", "All")).toEqual([]);
      expect(filterQuestsList({} as any, "basics", "All", "All")).toEqual([]);
    });

    it("skips nullish quest items in the input array", () => {
      const questsWithNulls = [
        null,
        undefined,
        { id: "q1", realmId: "html", title: "HTML Basics", xpReward: 10 },
        null,
      ];
      const result = filterQuestsList(questsWithNulls, "basics", "All", "All");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("q1");
    });

    it("treats NaN and non-finite xpReward as invalid, defaulting safely to 0 XP", () => {
      const nanQuests: FilterableQuest[] = [
        { id: "nan1", realmId: "html", title: "NaN Quest", xpReward: Number.NaN },
        { id: "inf1", realmId: "html", title: "Infinite Quest", xpReward: Number.POSITIVE_INFINITY },
        { id: "negInf", realmId: "html", title: "Neg Infinite Quest", xpReward: Number.NEGATIVE_INFINITY },
        { id: "valid", realmId: "html", title: "Valid Quest", xpReward: 50 },
      ];

      // With NaN/non-finite XP defaulting to 0, they match Beginner (xp <= 25)
      const beginner = filterQuestsList(nanQuests, "", "All", "Beginner");
      expect(beginner.map((q) => q.id)).toEqual(["nan1", "inf1", "negInf"]);

      // They should NOT match Intermediate (25 < xp < 75)
      const intermediate = filterQuestsList(nanQuests, "", "All", "Intermediate");
      expect(intermediate.map((q) => q.id)).toEqual(["valid"]);

      // They should NOT match Advanced (xp >= 75)
      const advanced = filterQuestsList(nanQuests, "", "All", "Advanced");
      expect(advanced).toHaveLength(0);
    });
  });

  describe("getQuestDifficulty", () => {
    it("classifies XP < 150 as beginner", () => {
      expect(getQuestDifficulty(0)).toBe("beginner");
      expect(getQuestDifficulty(50)).toBe("beginner");
      expect(getQuestDifficulty(149)).toBe("beginner");
    });

    it("classifies XP between 150 and 299 as intermediate", () => {
      expect(getQuestDifficulty(150)).toBe("intermediate");
      expect(getQuestDifficulty(200)).toBe("intermediate");
      expect(getQuestDifficulty(299)).toBe("intermediate");
    });

    it("classifies XP between 300 and 499 as advanced", () => {
      expect(getQuestDifficulty(300)).toBe("advanced");
      expect(getQuestDifficulty(400)).toBe("advanced");
      expect(getQuestDifficulty(499)).toBe("advanced");
    });

    it("classifies XP >= 500 as master", () => {
      expect(getQuestDifficulty(500)).toBe("master");
      expect(getQuestDifficulty(750)).toBe("master");
      expect(getQuestDifficulty(1200)).toBe("master");
    });

    it("handles negative numbers, NaN, and non-finite values safely", () => {
      expect(getQuestDifficulty(-50)).toBe("beginner");
      expect(getQuestDifficulty(Number.NaN)).toBe("beginner");
      expect(getQuestDifficulty(Number.NEGATIVE_INFINITY)).toBe("beginner");
      expect(getQuestDifficulty(Number.POSITIVE_INFINITY)).toBe("beginner");
    });
  });

  describe("sortQuestsList", () => {
    const sampleQuests = [
      { id: "q1", title: "Zebra Styling", xpReward: 300, order: 3 },
      { id: "q2", title: "Apple HTML", xpReward: 100, order: 1 },
      { id: "q3", title: "Medium Script", xpReward: 500, order: 2 },
    ];

    it("returns a new array and does not mutate the original input array", () => {
      const originalCopy = [...sampleQuests];
      const sorted = sortQuestsList(sampleQuests, "title");

      expect(sorted).not.toBe(sampleQuests);
      expect(sampleQuests).toEqual(originalCopy);
    });

    it("sorts by order ascending", () => {
      const sorted = sortQuestsList(sampleQuests, "order");
      expect(sorted.map((q) => q.id)).toEqual(["q2", "q3", "q1"]);
    });

    it("sorts by xp-asc ascending", () => {
      const sorted = sortQuestsList(sampleQuests, "xp-asc");
      expect(sorted.map((q) => q.id)).toEqual(["q2", "q1", "q3"]);
    });

    it("sorts by xp-desc descending", () => {
      const sorted = sortQuestsList(sampleQuests, "xp-desc");
      expect(sorted.map((q) => q.id)).toEqual(["q3", "q1", "q2"]);
    });

    it("sorts by title alphabetically", () => {
      const sorted = sortQuestsList(sampleQuests, "title");
      expect(sorted.map((q) => q.id)).toEqual(["q2", "q3", "q1"]);
    });

    it("handles missing or undefined order gracefully", () => {
      const questsWithoutOrder = [
        { id: "noOrder", title: "No Order Quest", xpReward: 200 },
        { id: "orderOne", title: "First Quest", xpReward: 150, order: 1 },
        { id: "orderTwo", title: "Second Quest", xpReward: 300, order: 2 },
      ];

      const sorted = sortQuestsList(questsWithoutOrder, "order");
      // order default 0 puts noOrder first (order: 0 < 1 < 2)
      expect(sorted[0].id).toBe("noOrder");
      expect(sorted[1].id).toBe("orderOne");
      expect(sorted[2].id).toBe("orderTwo");
    });

    it("returns empty array when input is null, undefined, or not an array", () => {
      expect(sortQuestsList(null as any, "order")).toEqual([]);
      expect(sortQuestsList(undefined as any, "title")).toEqual([]);
      expect(sortQuestsList("not-an-array" as any, "xp-asc")).toEqual([]);
    });
  });

  describe("groupQuestsByRealm", () => {
    it("groups quests by their realmId", () => {
      const quests = [
        { id: "q1", realmId: "html", title: "HTML Basics" },
        { id: "q2", realmId: "css", title: "CSS Grid" },
        { id: "q3", realmId: "html", title: "HTML Forms" },
        { id: "q4", realmId: "js", title: "JS Closures" },
      ];

      const grouped = groupQuestsByRealm(quests);
      expect(Object.keys(grouped).sort()).toEqual(["css", "html", "js"]);
      expect(grouped.html.map((q) => q.id)).toEqual(["q1", "q3"]);
      expect(grouped.css.map((q) => q.id)).toEqual(["q2"]);
      expect(grouped.js.map((q) => q.id)).toEqual(["q4"]);
    });

    it("preserves original array sequence within each group", () => {
      const quests = [
        { id: "h1", realmId: "html", title: "First HTML" },
        { id: "h2", realmId: "html", title: "Second HTML" },
        { id: "h3", realmId: "html", title: "Third HTML" },
      ];

      const grouped = groupQuestsByRealm(quests);
      expect(grouped.html.map((q) => q.id)).toEqual(["h1", "h2", "h3"]);
    });

    it("returns empty object when input is empty or invalid", () => {
      expect(groupQuestsByRealm([])).toEqual({});
      expect(groupQuestsByRealm(null as any)).toEqual({});
      expect(groupQuestsByRealm(undefined as any)).toEqual({});
      expect(groupQuestsByRealm("invalid" as any)).toEqual({});
    });

    it("handles missing or non-string realmId by placing in unknown group", () => {
      const quests = [
        { id: "q1", realmId: "html", title: "HTML" },
        { id: "q2", realmId: undefined as any, title: "Mystery" },
      ];

      const grouped = groupQuestsByRealm(quests);
      expect(grouped.html).toHaveLength(1);
      expect(grouped.unknown).toHaveLength(1);
      expect(grouped.unknown[0].id).toBe("q2");
    });
  });
});
