import { describe, it, expect } from "vitest";

// Component re-exports
import { HUD as AliasedHUD, NavigationHud as ReexportedNavHud } from "../components/HUD";
import { NavigationHud } from "../components/NavigationHud";

import {
  InventoryModal as AliasedInventoryModal,
  AchievementsModal as ReexportedAchievementsModal,
} from "../components/InventoryModal";
import { AchievementsModal } from "../components/AchievementsModal";

import {
  QuestMap as AliasedQuestMap,
  WorldCampaignMap as ReexportedWorldMap,
} from "../components/QuestMap";
import { WorldCampaignMap } from "../components/WorldCampaignMap";

import {
  DualPaneWorkspace as AliasedDualPane,
  QuestCodingWorkspace as ReexportedCodingWorkspace,
} from "../components/DualPaneWorkspace";
import { QuestCodingWorkspace } from "../components/QuestCodingWorkspace";

// Lib re-exports
import * as AudioLib from "../lib/audio";
import * as SoundEngineLib from "../lib/soundEngine";

import * as StoreLib from "../lib/store";
import * as GameStoreLib from "../lib/gameStore";

describe("Aliased Component & Module Re-exports", () => {
  describe("Component Aliases", () => {
    it("preserves HUD and NavigationHud aliased re-exports with strict identity", () => {
      expect(AliasedHUD).toBeDefined();
      expect(ReexportedNavHud).toBeDefined();
      expect(NavigationHud).toBeDefined();
      expect(AliasedHUD).toBe(NavigationHud);
      expect(ReexportedNavHud).toBe(NavigationHud);
      expect(AliasedHUD === NavigationHud).toBe(true);
      expect(ReexportedNavHud === NavigationHud).toBe(true);
    });

    it("preserves InventoryModal and AchievementsModal aliased re-exports with strict identity", () => {
      expect(AliasedInventoryModal).toBeDefined();
      expect(ReexportedAchievementsModal).toBeDefined();
      expect(AchievementsModal).toBeDefined();
      expect(AliasedInventoryModal).toBe(AchievementsModal);
      expect(ReexportedAchievementsModal).toBe(AchievementsModal);
      expect(AliasedInventoryModal === AchievementsModal).toBe(true);
      expect(ReexportedAchievementsModal === AchievementsModal).toBe(true);
    });

    it("preserves QuestMap and WorldCampaignMap aliased re-exports with strict identity", () => {
      expect(AliasedQuestMap).toBeDefined();
      expect(ReexportedWorldMap).toBeDefined();
      expect(WorldCampaignMap).toBeDefined();
      expect(AliasedQuestMap).toBe(WorldCampaignMap);
      expect(ReexportedWorldMap).toBe(WorldCampaignMap);
      expect(AliasedQuestMap === WorldCampaignMap).toBe(true);
      expect(ReexportedWorldMap === WorldCampaignMap).toBe(true);
    });

    it("preserves DualPaneWorkspace and QuestCodingWorkspace aliased re-exports with strict identity", () => {
      expect(AliasedDualPane).toBeDefined();
      expect(ReexportedCodingWorkspace).toBeDefined();
      expect(QuestCodingWorkspace).toBeDefined();
      expect(AliasedDualPane).toBe(QuestCodingWorkspace);
      expect(ReexportedCodingWorkspace).toBe(QuestCodingWorkspace);
      expect(AliasedDualPane === QuestCodingWorkspace).toBe(true);
      expect(ReexportedCodingWorkspace === QuestCodingWorkspace).toBe(true);
    });
  });

  describe("Library Re-exports", () => {
    it("preserves audio.ts re-export of soundEngine singleton and isValidSfxType helper", () => {
      expect(AudioLib.soundEngine).toBeDefined();
      expect(SoundEngineLib.soundEngine).toBeDefined();
      expect(AudioLib.soundEngine).toBe(SoundEngineLib.soundEngine);
      expect(AudioLib.soundEngine === SoundEngineLib.soundEngine).toBe(true);

      // Verify isValidSfxType helper strict identity
      expect(AudioLib.isValidSfxType).toBeDefined();
      expect(SoundEngineLib.isValidSfxType).toBeDefined();
      expect(AudioLib.isValidSfxType).toBe(SoundEngineLib.isValidSfxType);
      expect(AudioLib.isValidSfxType === SoundEngineLib.isValidSfxType).toBe(true);

      // Verify VALID_SFX_TYPES constant and SoundEngine class identity
      expect(AudioLib.VALID_SFX_TYPES).toBe(SoundEngineLib.VALID_SFX_TYPES);
      expect(AudioLib.VALID_SFX_TYPES === SoundEngineLib.VALID_SFX_TYPES).toBe(true);
      expect(AudioLib.SoundEngine).toBe(SoundEngineLib.SoundEngine);
      expect(AudioLib.SoundEngine === SoundEngineLib.SoundEngine).toBe(true);

      // Verify functional behavior of re-exported isValidSfxType helper
      expect(AudioLib.isValidSfxType("click")).toBe(true);
      expect(AudioLib.isValidSfxType("correct")).toBe(true);
      expect(AudioLib.isValidSfxType("error")).toBe(true);
      expect(AudioLib.isValidSfxType("attack")).toBe(true);
      expect(AudioLib.isValidSfxType("boss-hit")).toBe(true);
      expect(AudioLib.isValidSfxType("level-up")).toBe(true);
      expect(AudioLib.isValidSfxType("victory")).toBe(true);
      expect(AudioLib.isValidSfxType("skill-unlock")).toBe(true);
      expect(AudioLib.isValidSfxType("badge-inspect")).toBe(true);
      expect(AudioLib.isValidSfxType("heal")).toBe(true);
      expect(AudioLib.isValidSfxType("unknown-sfx")).toBe(false);
      expect(AudioLib.isValidSfxType("")).toBe(false);
      expect(AudioLib.isValidSfxType(null)).toBe(false);
      expect(AudioLib.isValidSfxType(undefined)).toBe(false);
      expect(AudioLib.isValidSfxType(123)).toBe(false);
    });

    it("preserves store.ts re-export of gameStore utilities with strict identity", () => {
      expect(StoreLib.useGameStore).toBeDefined();
      expect(GameStoreLib.useGameStore).toBeDefined();
      expect(StoreLib.useGameStore).toBe(GameStoreLib.useGameStore);
      expect(StoreLib.useGameStore === GameStoreLib.useGameStore).toBe(true);

      expect(StoreLib.calculateLevel).toBe(GameStoreLib.calculateLevel);
      expect(StoreLib.calculateLevel === GameStoreLib.calculateLevel).toBe(true);

      expect(StoreLib.calculateRank).toBe(GameStoreLib.calculateRank);
      expect(StoreLib.calculateRank === GameStoreLib.calculateRank).toBe(true);

      expect(StoreLib.RANKS).toBe(GameStoreLib.RANKS);
      expect(StoreLib.RANKS === GameStoreLib.RANKS).toBe(true);
    });

    it("verifies all module exports in audio.ts strictly match soundEngine.ts", () => {
      const audioKeys = Object.keys(AudioLib).sort();
      const soundEngineKeys = Object.keys(SoundEngineLib).sort();
      expect(audioKeys).toEqual(soundEngineKeys);
      for (const key of audioKeys) {
        expect((AudioLib as Record<string, unknown>)[key]).toBe(
          (SoundEngineLib as Record<string, unknown>)[key]
        );
        expect(
          (AudioLib as Record<string, unknown>)[key] === (SoundEngineLib as Record<string, unknown>)[key]
        ).toBe(true);
      }
    });

    it("verifies all module exports in store.ts strictly match gameStore.ts", () => {
      const storeKeys = Object.keys(StoreLib).sort();
      const gameStoreKeys = Object.keys(GameStoreLib).sort();
      expect(storeKeys).toEqual(gameStoreKeys);
      for (const key of storeKeys) {
        expect((StoreLib as Record<string, unknown>)[key]).toBe(
          (GameStoreLib as Record<string, unknown>)[key]
        );
        expect(
          (StoreLib as Record<string, unknown>)[key] === (GameStoreLib as Record<string, unknown>)[key]
        ).toBe(true);
      }
    });
  });
});
