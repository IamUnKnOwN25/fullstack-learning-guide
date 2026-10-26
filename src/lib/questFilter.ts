export type DifficultyLevel = "All" | "Beginner" | "Intermediate" | "Advanced";

export interface FilterableQuest {
  id: string;
  realmId: string;
  title: string;
  conceptSummary?: string;
  storyIntro?: string;
  xpReward?: number;
}

export function filterQuestsList<T extends FilterableQuest>(
  quests: T[],
  searchQuery: string,
  realmId: string,
  difficultyLevel: DifficultyLevel
): T[] {
  const query = (searchQuery || "").trim().toLowerCase();
  const normalizedRealm = (realmId || "All").trim();

  return quests.filter((q) => {
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
      const xp = typeof q.xpReward === "number" ? q.xpReward : 0;
      if (difficultyLevel === "Beginner" && xp > 25) matchDifficulty = false;
      if (difficultyLevel === "Intermediate" && (xp <= 25 || xp >= 75)) matchDifficulty = false;
      if (difficultyLevel === "Advanced" && xp < 75) matchDifficulty = false;
    }

    return matchSearch && matchRealm && matchDifficulty;
  });
}
