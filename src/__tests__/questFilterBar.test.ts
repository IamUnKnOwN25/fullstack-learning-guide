import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { filterQuestsList, DifficultyLevel, FilterableQuest } from "../lib/questFilter";

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
  });
});
