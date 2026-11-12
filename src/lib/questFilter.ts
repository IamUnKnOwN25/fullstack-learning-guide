export type DifficultyLevel = "All" | "Beginner" | "Intermediate" | "Advanced";

export interface FilterableQuest {
  id: string;
  realmId: string;
  title: string;
  conceptSummary?: string;
  storyIntro?: string;
  xpReward?: number;
}

export function filterQuestsList<T extends FilterableQuest = FilterableQuest>(
  quests: (T | null | undefined)[] | null | undefined,
  searchQuery: string,
  realmId: string,
  difficultyLevel: DifficultyLevel
): T[] {
  if (!quests || !Array.isArray(quests)) {
    return [];
  }

  const query = (searchQuery || "").trim().toLowerCase();
  const normalizedRealm = (realmId || "All").trim();

  return quests.filter((q): q is T => {
    if (!q || typeof q !== "object") {
      return false;
    }

    // Search match
    const titleMatch = typeof q.title === "string" ? q.title.toLowerCase().includes(query) : false;
    const summaryMatch =
      typeof q.conceptSummary === "string" ? q.conceptSummary.toLowerCase().includes(query) : false;
    const introMatch =
      typeof q.storyIntro === "string" ? q.storyIntro.toLowerCase().includes(query) : false;

    const matchSearch = query === "" || titleMatch || summaryMatch || introMatch;

    // Realm match (case-insensitive for robust matching)
    const matchRealm =
      normalizedRealm === "All" ||
      (typeof q.realmId === "string" && q.realmId.toLowerCase() === normalizedRealm.toLowerCase());

    // Difficulty logic (mapping to XP reward bounds)
    let matchDifficulty = true;
    if (difficultyLevel !== "All") {
      const xp = Number.isFinite(q.xpReward) ? (q.xpReward as number) : 0;
      if (difficultyLevel === "Beginner" && xp > 25) matchDifficulty = false;
      if (difficultyLevel === "Intermediate" && (xp <= 25 || xp >= 75)) matchDifficulty = false;
      if (difficultyLevel === "Advanced" && xp < 75) matchDifficulty = false;
    }

    return matchSearch && matchRealm && matchDifficulty;
  });
}

export type QuestDifficulty = "beginner" | "intermediate" | "advanced" | "master";

/**
 * Classifies quest difficulty based on its XP reward:
 * - < 150: 'beginner'
 * - 150..299: 'intermediate'
 * - 300..499: 'advanced'
 * - >= 500: 'master'
 */
export function getQuestDifficulty(xpReward: number): QuestDifficulty {
  const xp = Number.isFinite(xpReward) ? xpReward : 0;
  if (xp < 150) return "beginner";
  if (xp < 300) return "intermediate";
  if (xp < 500) return "advanced";
  return "master";
}

export type QuestSortOption = "order" | "xp-asc" | "xp-desc" | "title";

/**
 * Sorts a list of quests by the specified sorting criteria without mutating the input array.
 */
export function sortQuestsList<
  T extends { id: string; title: string; xpReward: number; order?: number }
>(quests: T[], sortBy: "order" | "xp-asc" | "xp-desc" | "title"): T[] {
  if (!quests || !Array.isArray(quests)) {
    return [];
  }

  const copy = [...quests];

  return copy.sort((a, b) => {
    switch (sortBy) {
      case "order": {
        const orderA = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 0;
        const orderB = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 0;
        return orderA - orderB;
      }
      case "xp-asc": {
        const xpA = typeof a.xpReward === "number" && Number.isFinite(a.xpReward) ? a.xpReward : 0;
        const xpB = typeof b.xpReward === "number" && Number.isFinite(b.xpReward) ? b.xpReward : 0;
        return xpA - xpB;
      }
      case "xp-desc": {
        const xpA = typeof a.xpReward === "number" && Number.isFinite(a.xpReward) ? a.xpReward : 0;
        const xpB = typeof b.xpReward === "number" && Number.isFinite(b.xpReward) ? b.xpReward : 0;
        return xpB - xpA;
      }
      case "title": {
        const titleA = typeof a.title === "string" ? a.title : "";
        const titleB = typeof b.title === "string" ? b.title : "";
        return titleA.localeCompare(titleB);
      }
      default:
        return 0;
    }
  });
}

/**
 * Groups quests by their realmId into a record map.
 */
export function groupQuestsByRealm<T extends { realmId: string }>(
  quests: T[]
): Record<string, T[]> {
  if (!quests || !Array.isArray(quests)) {
    return {};
  }

  const grouped: Record<string, T[]> = {};

  for (const quest of quests) {
    if (!quest || typeof quest !== "object") {
      continue;
    }
    const realm = typeof quest.realmId === "string" ? quest.realmId : "unknown";
    if (!grouped[realm]) {
      grouped[realm] = [];
    }
    grouped[realm].push(quest);
  }

  return grouped;
}
