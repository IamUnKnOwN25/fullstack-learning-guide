import { z } from "zod";
import type { PlayerStats } from "./gameStore";

export const SAVE_FORMAT_VERSION = "1.0.0";

const playerStatsSchema = z.object({
  xp: z.number().min(0).optional(),
  level: z.number().min(1).optional(),
  hp: z.number().optional(),
  maxHp: z.number().optional(),
  mana: z.number().optional(),
  maxMana: z.number().optional(),
  streak: z.number().optional(),
  rankTitle: z.string().optional(),
  completedQuests: z.array(z.string()).optional(),
  completedBosses: z.array(z.string()).optional(),
  unlockedRealms: z.array(z.string()).optional(),
  stars: z.record(z.string(), z.number()).optional(),
  unlockedSkills: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  completedCurriculumTasks: z.array(z.string()).optional(),
  curriculumTaskAwards: z.record(z.string(), z.number()).optional(),
  completedChapters: z.array(z.string()).optional(),
  claimedAchievements: z.array(z.string()).optional(),
  audioMuted: z.boolean().optional(),
  bgmActive: z.boolean().optional(),
});

export const saveFileSchema = z.object({
  version: z.string().default(SAVE_FORMAT_VERSION),
  timestamp: z.number(),
  data: playerStatsSchema,
});

export type SaveFile = z.infer<typeof saveFileSchema>;

export function serializeSaveData(stats: Partial<PlayerStats>): string {
  const savePayload: SaveFile = {
    version: SAVE_FORMAT_VERSION,
    timestamp: Date.now(),
    data: stats,
  };
  return JSON.stringify(savePayload, null, 2);
}

export function deserializeSaveData(jsonString: string): Partial<PlayerStats> | null {
  try {
    const rawData = JSON.parse(jsonString);

    // For backwards compatibility, if it's not wrapped in our save format,
    // try to parse it directly as stats.
    if (rawData && typeof rawData === 'object' && !('version' in rawData) && !('data' in rawData)) {
       const directParse = playerStatsSchema.safeParse(rawData);
       if (directParse.success) {
           return directParse.data as Partial<PlayerStats>;
       }
    }

    const parsed = saveFileSchema.safeParse(rawData);
    if (!parsed.success) {
      console.error("Save file validation failed:", parsed.error);
      return null;
    }

    // Example of version check logic if we introduce breaking changes in the future
    // if (parsed.data.version !== SAVE_FORMAT_VERSION) {
    //   console.warn("Migrating save file from older version...");
    // }

    return parsed.data.data as Partial<PlayerStats>;
  } catch (error) {
    console.error("Failed to parse save file JSON:", error);
    return null;
  }
}
