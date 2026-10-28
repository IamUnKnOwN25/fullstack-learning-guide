import type { PlayerStats } from "./gameStore";

export const SAVE_FORMAT_VERSION = "1.0.0";

export interface SaveFile {
  version: string;
  timestamp: number;
  data: Partial<PlayerStats>;
}

export interface SaveSummary {
  level: number;
  xp: number;
  questsCompleted: number;
  bossesDefeated: number;
  rankTitle: string;
}

export function isValidStatsObject(obj: unknown): obj is Partial<PlayerStats> {
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

export function generateSaveSummary(stats: Partial<PlayerStats> | null): SaveSummary {
  if (!stats || typeof stats !== "object") {
    return {
      level: 1,
      xp: 0,
      questsCompleted: 0,
      bossesDefeated: 0,
      rankTitle: "Novice Byte",
    };
  }
  return {
    level: Number.isFinite(stats.level) ? Math.max(1, Math.floor(stats.level!)) : 1,
    xp: Number.isFinite(stats.xp) ? Math.max(0, Math.floor(stats.xp!)) : 0,
    questsCompleted: Array.isArray(stats.completedQuests) ? stats.completedQuests.length : 0,
    bossesDefeated: Array.isArray(stats.completedBosses) ? stats.completedBosses.length : 0,
    rankTitle: typeof stats.rankTitle === "string" && stats.rankTitle ? stats.rankTitle : "Novice Byte",
  };
}

export function serializeSaveData(stats: Partial<PlayerStats>): string {
  const savePayload: SaveFile = {
    version: SAVE_FORMAT_VERSION,
    timestamp: Date.now(),
    data: stats,
  };
  return JSON.stringify(savePayload, null, 2);
}

export function encodeSaveToBase64(stats: Partial<PlayerStats>): string {
  const json = serializeSaveData(stats);
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf-8").toString("base64");
}

export function decodeSaveFromBase64(base64Str: string): Partial<PlayerStats> | null {
  if (typeof base64Str !== "string" || !base64Str.trim()) return null;
  try {
    let json: string;
    if (typeof atob === "function") {
      json = decodeURIComponent(escape(atob(base64Str.trim())));
    } else {
      json = Buffer.from(base64Str.trim(), "base64").toString("utf-8");
    }
    return deserializeSaveDataDirect(json);
  } catch {
    return null;
  }
}

export function migrateSaveData(save: Partial<SaveFile>): SaveFile {
  const rawData = (save && typeof save.data === "object" && save.data !== null) ? { ...save.data } : {};
  if (!Array.isArray(rawData.completedQuests)) rawData.completedQuests = [];
  if (!Array.isArray(rawData.completedBosses)) rawData.completedBosses = [];
  if (!Array.isArray(rawData.unlockedRealms)) rawData.unlockedRealms = ["html"];
  if (!Array.isArray(rawData.unlockedSkills)) rawData.unlockedSkills = [];
  if (!Array.isArray(rawData.badges)) rawData.badges = [];
  if (typeof rawData.level !== "number" || rawData.level < 1 || isNaN(rawData.level)) rawData.level = 1;
  if (typeof rawData.xp !== "number" || rawData.xp < 0 || isNaN(rawData.xp)) rawData.xp = 0;

  return {
    version: SAVE_FORMAT_VERSION,
    timestamp: Date.now(),
    data: rawData,
  };
}

function deserializeSaveDataDirect(
  jsonString: string
): Partial<PlayerStats> | null {
  if (typeof jsonString !== "string" || !jsonString.trim()) {
    return null;
  }

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

export function deserializeSaveData(
  jsonString: string
): Partial<PlayerStats> | null {
  if (typeof jsonString !== "string" || !jsonString.trim()) {
    return null;
  }

  const directResult = deserializeSaveDataDirect(jsonString);
  if (directResult) return directResult;

  // Attempt base64 decode fallback
  return decodeSaveFromBase64(jsonString);
}
