import type { PlayerStats } from "./gameStore";

export const SAVE_FORMAT_VERSION = "1.0.0";

export interface SaveFile {
  version: string;
  timestamp: number;
  data: Partial<PlayerStats>;
}

function isValidStatsObject(obj: unknown): obj is Partial<PlayerStats> {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return false;
  }

  const o = obj as Record<string, unknown>;

  if ("xp" in o && (typeof o.xp !== "number" || o.xp < 0 || isNaN(o.xp))) return false;
  if ("level" in o && (typeof o.level !== "number" || o.level < 1 || isNaN(o.level))) return false;
  if ("hp" in o && (typeof o.hp !== "number" || isNaN(o.hp))) return false;
  if ("maxHp" in o && (typeof o.maxHp !== "number" || isNaN(o.maxHp))) return false;
  if ("mana" in o && (typeof o.mana !== "number" || isNaN(o.mana))) return false;
  if ("maxMana" in o && (typeof o.maxMana !== "number" || isNaN(o.maxMana))) return false;
  if ("streak" in o && (typeof o.streak !== "number" || isNaN(o.streak))) return false;
  if ("rankTitle" in o && typeof o.rankTitle !== "string") return false;

  const arrayFields = [
    "completedQuests",
    "completedBosses",
    "unlockedRealms",
    "unlockedSkills",
    "badges",
    "completedCurriculumTasks",
    "completedChapters",
    "claimedAchievements",
  ] as const;

  for (const field of arrayFields) {
    if (
      field in o &&
      (!Array.isArray(o[field]) ||
        !(o[field] as unknown[]).every((i) => typeof i === "string"))
    ) {
      return false;
    }
  }

  if (
    "stars" in o &&
    (typeof o.stars !== "object" || o.stars === null || Array.isArray(o.stars))
  )
    return false;
  if (
    "curriculumTaskAwards" in o &&
    (typeof o.curriculumTaskAwards !== "object" ||
      o.curriculumTaskAwards === null ||
      Array.isArray(o.curriculumTaskAwards))
  )
    return false;
  if ("audioMuted" in o && typeof o.audioMuted !== "boolean") return false;
  if ("bgmActive" in o && typeof o.bgmActive !== "boolean") return false;

  return true;
}

export function serializeSaveData(stats: Partial<PlayerStats>): string {
  const savePayload: SaveFile = {
    version: SAVE_FORMAT_VERSION,
    timestamp: Date.now(),
    data: stats,
  };
  return JSON.stringify(savePayload, null, 2);
}

export function deserializeSaveData(
  jsonString: string
): Partial<PlayerStats> | null {
  try {
    const rawData = JSON.parse(jsonString);
    if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
      return null;
    }

    // Wrapped save file format: { version, timestamp, data }
    if ("version" in rawData || "timestamp" in rawData || "data" in rawData) {
      if (
        typeof rawData.version === "string" &&
        typeof rawData.timestamp === "number" &&
        isValidStatsObject(rawData.data)
      ) {
        return rawData.data;
      }
      return null;
    }

    // Legacy flat format
    if (isValidStatsObject(rawData)) {
      return rawData;
    }

    return null;
  } catch {
    return null;
  }
}
