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

export interface SaveInspectionResult {
  valid: boolean;
  version: number | null;
  level: number | null;
  xp: number | null;
  error?: string;
}

export function getStatsValidationFailureReason(obj: unknown): string | null {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return "Stats payload must be a non-null object";
  }

  const o = obj as Record<string, unknown>;

  if ("xp" in o && (typeof o.xp !== "number" || o.xp < 0 || !Number.isFinite(o.xp))) {
    return "Invalid xp: must be a non-negative finite number";
  }
  if ("level" in o && (typeof o.level !== "number" || o.level < 1 || !Number.isFinite(o.level))) {
    return "Invalid level: must be a finite number >= 1";
  }
  if ("hp" in o && (typeof o.hp !== "number" || !Number.isFinite(o.hp) || o.hp < 0)) {
    return "Invalid hp: must be a non-negative finite number";
  }
  if ("maxHp" in o && (typeof o.maxHp !== "number" || !Number.isFinite(o.maxHp) || o.maxHp <= 0)) {
    return "Invalid maxHp: must be a positive finite number";
  }
  if ("mana" in o && (typeof o.mana !== "number" || !Number.isFinite(o.mana) || o.mana < 0)) {
    return "Invalid mana: must be a non-negative finite number";
  }
  if ("maxMana" in o && (typeof o.maxMana !== "number" || !Number.isFinite(o.maxMana) || o.maxMana <= 0)) {
    return "Invalid maxMana: must be a positive finite number";
  }
  if ("streak" in o && (typeof o.streak !== "number" || !Number.isFinite(o.streak) || o.streak < 0)) {
    return "Invalid streak: must be a non-negative finite number";
  }
  if ("rankTitle" in o && typeof o.rankTitle !== "string") {
    return "Invalid rankTitle: must be a string";
  }

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
    if (field in o) {
      if (!Array.isArray(o[field])) {
        return `Invalid ${field}: must be an array`;
      }
      if (!(o[field] as unknown[]).every((i) => typeof i === "string")) {
        return `Invalid ${field}: elements must be strings`;
      }
    }
  }

  if ("stars" in o) {
    if (typeof o.stars !== "object" || o.stars === null || Array.isArray(o.stars)) {
      return "Invalid stars: must be an object dictionary";
    }
    if (!Object.values(o.stars as Record<string, unknown>).every((v) => typeof v === "number" && Number.isFinite(v))) {
      return "Invalid stars: all values must be finite numbers";
    }
  }

  if ("curriculumTaskAwards" in o) {
    if (typeof o.curriculumTaskAwards !== "object" || o.curriculumTaskAwards === null || Array.isArray(o.curriculumTaskAwards)) {
      return "Invalid curriculumTaskAwards: must be an object dictionary";
    }
    if (!Object.values(o.curriculumTaskAwards as Record<string, unknown>).every((v) => typeof v === "number" && Number.isFinite(v))) {
      return "Invalid curriculumTaskAwards: all values must be finite numbers";
    }
  }

  if ("audioMuted" in o && typeof o.audioMuted !== "boolean") {
    return "Invalid audioMuted: must be a boolean";
  }
  if ("bgmActive" in o && typeof o.bgmActive !== "boolean") {
    return "Invalid bgmActive: must be a boolean";
  }

  return null;
}

export function isValidStatsObject(obj: unknown): obj is Partial<PlayerStats> {
  return getStatsValidationFailureReason(obj) === null;
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
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf-8").toString("base64");
  }
  if (typeof btoa === "function") {
    const bytes = new TextEncoder().encode(json);
    const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return btoa(bin);
  }
  return "";
}

export function decodeSaveFromBase64(base64Str: string): Partial<PlayerStats> | null {
  if (typeof base64Str !== "string" || !base64Str.trim()) return null;
  try {
    let json: string;
    if (typeof Buffer !== "undefined") {
      json = Buffer.from(base64Str.trim(), "base64").toString("utf-8");
    } else if (typeof atob === "function") {
      const bin = atob(base64Str.trim());
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } else {
      return null;
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
  if (typeof rawData.level !== "number" || rawData.level < 1 || !Number.isFinite(rawData.level)) rawData.level = 1;
  if (typeof rawData.xp !== "number" || rawData.xp < 0 || !Number.isFinite(rawData.xp)) rawData.xp = 0;
  if (typeof rawData.hp !== "number" || !Number.isFinite(rawData.hp) || rawData.hp < 0) rawData.hp = 100;
  if (typeof rawData.maxHp !== "number" || !Number.isFinite(rawData.maxHp) || rawData.maxHp <= 0) rawData.maxHp = 100;
  if (typeof rawData.mana !== "number" || !Number.isFinite(rawData.mana) || rawData.mana < 0) rawData.mana = 50;
  if (typeof rawData.maxMana !== "number" || !Number.isFinite(rawData.maxMana) || rawData.maxMana <= 0) rawData.maxMana = 50;
  if (typeof rawData.streak !== "number" || !Number.isFinite(rawData.streak) || rawData.streak < 0) rawData.streak = 0;
  if (typeof rawData.stars !== "object" || rawData.stars === null || Array.isArray(rawData.stars)) {
    rawData.stars = {};
  } else {
    const cleanStars: Record<string, number> = {};
    for (const [key, val] of Object.entries(rawData.stars)) {
      if (typeof val === "number" && Number.isFinite(val)) {
        cleanStars[key] = val;
      }
    }
    rawData.stars = cleanStars;
  }
  if (rawData.curriculumTaskAwards !== undefined) {
    if (
      typeof rawData.curriculumTaskAwards !== "object" ||
      rawData.curriculumTaskAwards === null ||
      Array.isArray(rawData.curriculumTaskAwards)
    ) {
      rawData.curriculumTaskAwards = {};
    } else {
      const cleanAwards: Record<string, number> = {};
      for (const [key, val] of Object.entries(rawData.curriculumTaskAwards)) {
        if (typeof val === "number" && Number.isFinite(val)) {
          cleanAwards[key] = val;
        }
      }
      rawData.curriculumTaskAwards = cleanAwards;
    }
  }

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

function canonicalize(data: unknown, stack = new Set<object>()): unknown {
  if (data === null || typeof data !== "object") {
    return data;
  }
  if (stack.has(data)) {
    throw new Error("Circular reference detected");
  }
  stack.add(data);
  try {
    if (Array.isArray(data)) {
      return data.map((item) => canonicalize(item, stack));
    }
    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(data).sort();
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (val !== undefined && typeof val !== "function" && typeof val !== "symbol") {
        sortedObj[key] = canonicalize(val, stack);
      }
    }
    return sortedObj;
  } finally {
    stack.delete(data);
  }
}

export function computeSaveChecksum(data: unknown): string {
  if (data === null || data === undefined) {
    return "00000000";
  }
  try {
    if (typeof data === "function" || typeof data === "symbol" || typeof data === "bigint") {
      return "00000000";
    }
    const canonical = canonicalize(data);
    const str = JSON.stringify(canonical);
    if (typeof str !== "string") {
      return "00000000";
    }
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  } catch {
    return "00000000";
  }
}

export function verifySaveChecksum(data: unknown, expectedChecksum: string): boolean {
  if (typeof expectedChecksum !== "string") {
    return false;
  }
  const cleanExpected = expectedChecksum.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{8}$/.test(cleanExpected)) {
    return false;
  }
  const computed = computeSaveChecksum(data);
  return computed === cleanExpected;
}

export function inspectSavePayload(rawJson: string): SaveInspectionResult {
  if (typeof rawJson !== "string" || !rawJson.trim()) {
    return {
      valid: false,
      version: null,
      level: null,
      xp: null,
      error: "Empty or invalid save payload string",
    };
  }

  let json = rawJson.trim();
  if (!json.startsWith("{") && !json.startsWith("[")) {
    try {
      if (typeof Buffer !== "undefined") {
        const decoded = Buffer.from(json, "base64").toString("utf-8");
        if (decoded.trim().startsWith("{") || decoded.trim().startsWith("[")) {
          json = decoded.trim();
        }
      } else if (typeof atob === "function") {
        const bin = atob(json);
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        const decoded = new TextDecoder().decode(bytes);
        if (decoded.trim().startsWith("{") || decoded.trim().startsWith("[")) {
          json = decoded.trim();
        }
      }
    } catch {
      // Proceed with original string if base64 decoding fails
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    return {
      valid: false,
      version: null,
      level: null,
      xp: null,
      error: `Malformed JSON payload: ${(err as Error).message}`,
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      valid: false,
      version: null,
      level: null,
      xp: null,
      error: "Save payload root must be an object",
    };
  }

  const obj = parsed as Record<string, unknown>;
  const isWrapped = "version" in obj || "timestamp" in obj || "data" in obj;

  let version: number | null = null;
  let statsCandidate: unknown = obj;

  if (isWrapped) {
    if (typeof obj.version === "number" && Number.isFinite(obj.version)) {
      version = obj.version;
    } else if (typeof obj.version === "string") {
      const parsedV = parseFloat(obj.version);
      if (Number.isFinite(parsedV)) {
        version = parsedV;
      }
    }

    if (typeof obj.version !== "string" && typeof obj.version !== "number") {
      return {
        valid: false,
        version: null,
        level: null,
        xp: null,
        error: "Missing or invalid version in wrapped save file",
      };
    }

    if (typeof obj.timestamp !== "number" || !Number.isFinite(obj.timestamp)) {
      return {
        valid: false,
        version,
        level: null,
        xp: null,
        error: "Invalid or missing timestamp in wrapped save file",
      };
    }

    if (!obj.data || typeof obj.data !== "object" || Array.isArray(obj.data)) {
      return {
        valid: false,
        version,
        level: null,
        xp: null,
        error: "Wrapped save data must be an object",
      };
    }

    statsCandidate = obj.data;
  } else if ("version" in obj) {
    if (typeof obj.version === "number" && Number.isFinite(obj.version)) {
      version = obj.version;
    } else if (typeof obj.version === "string") {
      const parsedV = parseFloat(obj.version);
      if (Number.isFinite(parsedV)) {
        version = parsedV;
      }
    }
  }

  const stats = statsCandidate as Record<string, unknown>;
  const level = typeof stats.level === "number" && Number.isFinite(stats.level) ? stats.level : null;
  const xp = typeof stats.xp === "number" && Number.isFinite(stats.xp) ? stats.xp : null;

  const failureReason = getStatsValidationFailureReason(statsCandidate);
  if (failureReason) {
    return {
      valid: false,
      version,
      level,
      xp,
      error: failureReason,
    };
  }

  return {
    valid: true,
    version,
    level,
    xp,
  };
}
