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
    it("preserves HUD and NavigationHud aliased re-exports", () => {
      expect(AliasedHUD).toBeDefined();
      expect(ReexportedNavHud).toBeDefined();
      expect(NavigationHud).toBeDefined();
      expect(AliasedHUD).toBe(NavigationHud);
      expect(ReexportedNavHud).toBe(NavigationHud);
    });

    it("preserves InventoryModal and AchievementsModal aliased re-exports", () => {
      expect(AliasedInventoryModal).toBeDefined();
      expect(ReexportedAchievementsModal).toBeDefined();
      expect(AchievementsModal).toBeDefined();
      expect(AliasedInventoryModal).toBe(AchievementsModal);
      expect(ReexportedAchievementsModal).toBe(AchievementsModal);
    });

    it("preserves QuestMap and WorldCampaignMap aliased re-exports", () => {
      expect(AliasedQuestMap).toBeDefined();
      expect(ReexportedWorldMap).toBeDefined();
      expect(WorldCampaignMap).toBeDefined();
      expect(AliasedQuestMap).toBe(WorldCampaignMap);
      expect(ReexportedWorldMap).toBe(WorldCampaignMap);
    });

    it("preserves DualPaneWorkspace and QuestCodingWorkspace aliased re-exports", () => {
      expect(AliasedDualPane).toBeDefined();
      expect(ReexportedCodingWorkspace).toBeDefined();
      expect(QuestCodingWorkspace).toBeDefined();
      expect(AliasedDualPane).toBe(QuestCodingWorkspace);
      expect(ReexportedCodingWorkspace).toBe(QuestCodingWorkspace);
    });
  });

  describe("Library Re-exports", () => {
    it("preserves audio.ts re-export of soundEngine singleton", () => {
      expect(AudioLib.soundEngine).toBeDefined();
      expect(SoundEngineLib.soundEngine).toBeDefined();
      expect(AudioLib.soundEngine).toBe(SoundEngineLib.soundEngine);
    });

    it("preserves store.ts re-export of gameStore utilities", () => {
      expect(StoreLib.useGameStore).toBeDefined();
      expect(GameStoreLib.useGameStore).toBeDefined();
      expect(StoreLib.useGameStore).toBe(GameStoreLib.useGameStore);
      expect(StoreLib.calculateLevel).toBe(GameStoreLib.calculateLevel);
      expect(StoreLib.calculateRank).toBe(GameStoreLib.calculateRank);
      expect(StoreLib.RANKS).toBe(GameStoreLib.RANKS);
    });
  });
});
