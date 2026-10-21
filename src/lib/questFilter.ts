export type DifficultyLevel = "All" | "Beginner" | "Intermediate" | "Advanced";

export function filterQuestsList(
  quests: any[],
  searchQuery: string,
  realmId: string,
  difficultyLevel: DifficultyLevel
) {
  return quests.filter((q) => {
    // Search match
    const query = searchQuery.toLowerCase();
    const matchSearch =
      query === "" ||
      q.title.toLowerCase().includes(query) ||
      (q.conceptSummary && q.conceptSummary.toLowerCase().includes(query)) ||
      (q.storyIntro && q.storyIntro.toLowerCase().includes(query));

    // Realm match
    const matchRealm = realmId === "All" || q.realmId === realmId;

    // Difficulty logic (mapping to XP/stars intuitively since there's no explicit difficulty property in Quest)
    let matchDifficulty = true;
    if (difficultyLevel !== "All") {
      // Assuming 10-25 XP = Beginner, 30-50 XP = Intermediate, > 50 XP = Advanced
      // Or we can map 'order' if it corresponds to difficulty, let's use xpReward.
      const xp = q.xpReward || 0;
      if (difficultyLevel === "Beginner" && xp > 25) matchDifficulty = false;
      if (difficultyLevel === "Intermediate" && (xp <= 25 || xp >= 75)) matchDifficulty = false;
      if (difficultyLevel === "Advanced" && xp < 75) matchDifficulty = false;
    }

    return matchSearch && matchRealm && matchDifficulty;
  });
}
