/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../app/page";
import MapPage from "../app/map/page";
import WorldMapPage from "../app/world-map/page";
import IdePage from "../app/ide/page";
import BossPage from "../app/boss/[realmId]/page";
import QuestPage from "../app/quest/[realmId]/[questId]/page";
import CurriculumPage from "../app/curriculum/page";
import { soundEngine } from "../lib/soundEngine";
import { useGameStore } from "../lib/gameStore";
import { useAuthStore } from "../lib/authStore";

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  notFound: () => mockNotFound(),
}));

describe("App Router Page Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      level: 5,
      xp: 1200,
      streak: 2,
      unlockedSkills: ["html_semantics"],
      unlockedRealms: ["html", "css", "javascript", "typescript", "databases"],
      completedQuests: ["html_1_skeleton"],
      completedBosses: ["html"],
      completedChapters: ["00-curriculum-overview.md"],
      stars: { html_1_skeleton: 3 },
      completedCurriculumTasks: [],
    });

    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: {
        id: "test-user-1",
        username: "cyber_operative",
        displayName: "Cyber Operative",
        avatarId: "matrix-architect",
        customBio: "Matrix Specialist",
        title: "Senior Operative",
        showcaseBadgeId: "",
        isGuest: false,
        joinedAt: "2026-01-01",
      },
    });
  });

  describe("World Map & Home Pages", () => {
    it("renders HomePage successfully", () => {
      render(<HomePage />);
      expect(screen.getByText("The Web Matrix Campaign Map")).toBeDefined();
      expect(screen.getByText(/journey through the twelve realms/i)).toBeDefined();
    });

    it("renders MapPage successfully", () => {
      render(<MapPage />);
      expect(screen.getByText("The Web Matrix Campaign Map")).toBeDefined();
    });

    it("renders WorldMapPage successfully", () => {
      render(<WorldMapPage />);
      expect(screen.getByText("The Web Matrix Campaign Map")).toBeDefined();
    });
  });

  describe("IDE Page", () => {
    it("renders IdePage without initial searchParams", async () => {
      const pageJsx = await IdePage({ searchParams: Promise.resolve({}) });
      render(pageJsx);
      expect(screen.getByLabelText("Matrix studio code editor")).toBeDefined();
    });

    it("renders IdePage with initial quest searchParam", async () => {
      const pageJsx = await IdePage({
        searchParams: Promise.resolve({ quest: "html_1_skeleton" }),
      });
      render(pageJsx);
      expect(screen.getByLabelText("Matrix studio code editor")).toBeDefined();
    });

    it("handles array quest searchParam by selecting the first element", async () => {
      const pageJsx = await IdePage({
        searchParams: Promise.resolve({ quest: ["html_1_skeleton", "css_1_flexbox"] }),
      });
      render(pageJsx);
      expect(screen.getByLabelText("Matrix studio code editor")).toBeDefined();
    });

    it("trims whitespace on quest searchParam", async () => {
      const pageJsx = await IdePage({
        searchParams: Promise.resolve({ quest: "  html_1_skeleton  " }),
      });
      render(pageJsx);
      expect(screen.getByLabelText("Matrix studio code editor")).toBeDefined();
    });
  });

  describe("Boss Page", () => {
    it("renders BossBattleArena for a valid realmId", async () => {
      const pageJsx = await BossPage({
        params: Promise.resolve({ realmId: "html" }),
      });
      render(pageJsx);
      expect(screen.getByText("The Malformed Tag Abomination")).toBeDefined();
      expect(screen.getByText(/lord of broken semantics/i)).toBeDefined();
    });

    it("resolves uppercase realm routes (e.g. /boss/HTML)", async () => {
      const pageJsx = await BossPage({
        params: Promise.resolve({ realmId: "HTML" }),
      });
      render(pageJsx);
      expect(screen.getByText("The Malformed Tag Abomination")).toBeDefined();
    });

    it("resolves shorthand alias realm routes (e.g. /boss/js, /boss/ts, /boss/db)", async () => {
      const jsJsx = await BossPage({
        params: Promise.resolve({ realmId: "js" }),
      });
      const { unmount: unmountJs } = render(jsJsx);
      expect(screen.getByText("The Callback Kraken")).toBeDefined();
      unmountJs();

      const tsJsx = await BossPage({
        params: Promise.resolve({ realmId: "ts" }),
      });
      const { unmount: unmountTs } = render(tsJsx);
      expect(screen.getByText("The Any-Demon")).toBeDefined();
      unmountTs();

      const dbJsx = await BossPage({
        params: Promise.resolve({ realmId: "db" }),
      });
      render(dbJsx);
      expect(screen.getByText("The SQL Injection Behemoth")).toBeDefined();
    });

    it("triggers notFound for an invalid realmId", async () => {
      await expect(
        BossPage({
          params: Promise.resolve({ realmId: "unknown-realm" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });
  });

  describe("Quest Page", () => {
    it("renders QuestCodingWorkspace for valid realmId and direct questId", async () => {
      const pageJsx = await QuestPage({
        params: Promise.resolve({ realmId: "html", questId: "html_1_skeleton" }),
      });
      render(pageJsx);
      expect(screen.getByText("Awaken the Page Skeleton")).toBeDefined();
    });

    it("resolves quest by numeric order fallback (e.g. quest-1)", async () => {
      const pageJsx = await QuestPage({
        params: Promise.resolve({ realmId: "html", questId: "quest-1" }),
      });
      render(pageJsx);
      expect(screen.getByText("Awaken the Page Skeleton")).toBeDefined();
    });

    it("resolves uppercase realm routes and encoded questId", async () => {
      const pageJsx = await QuestPage({
        params: Promise.resolve({ realmId: "HTML", questId: "html%5F1%5Fskeleton" }),
      });
      render(pageJsx);
      expect(screen.getByText("Awaken the Page Skeleton")).toBeDefined();
    });

    it("resolves shorthand alias realm routes (e.g. /quest/js/js-1, /quest/ts/ts-1, /quest/db/db-1)", async () => {
      const jsJsx = await QuestPage({
        params: Promise.resolve({ realmId: "js", questId: "js-1" }),
      });
      const { unmount: unmountJs } = render(jsJsx);
      expect(screen.getByText("Awaken the Reactive Core")).toBeDefined();
      unmountJs();

      const tsJsx = await QuestPage({
        params: Promise.resolve({ realmId: "ts", questId: "ts-1" }),
      });
      const { unmount: unmountTs } = render(tsJsx);
      expect(screen.getByText("The Ironclad Type Contract")).toBeDefined();
      unmountTs();

      const dbJsx = await QuestPage({
        params: Promise.resolve({ realmId: "db", questId: "db-1" }),
      });
      render(dbJsx);
      expect(screen.getByText("Architecting the Relational Schema")).toBeDefined();
    });

    it("safely handles malformed percent-encoding in questId without uncaught error", async () => {
      await expect(
        QuestPage({
          params: Promise.resolve({ realmId: "html", questId: "%E0%A4%A" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it("triggers notFound for unknown realmId", async () => {
      await expect(
        QuestPage({
          params: Promise.resolve({ realmId: "invalid-realm", questId: "html_1_skeleton" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it("triggers notFound for unknown questId in valid realm", async () => {
      await expect(
        QuestPage({
          params: Promise.resolve({ realmId: "html", questId: "nonexistent-quest" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });
  });

  describe("Curriculum Page", () => {
    it("loads markdown curriculum files and renders CurriculumViewer", async () => {
      const pageJsx = await CurriculumPage({});
      render(pageJsx);
      expect(
        screen.getByRole("heading", { name: "Curriculum Knowledge Vault", level: 1 })
      ).toBeDefined();
    });

    it("resolves legacy file aliases in searchParams", async () => {
      const pageJsx = await CurriculumPage({
        searchParams: Promise.resolve({ file: "00-README.md" }),
      });
      render(pageJsx);
      expect(
        screen.getByRole("heading", { name: "Curriculum Knowledge Vault", level: 1 })
      ).toBeDefined();
    });

    it("falls back to the default first doc file when file searchParam is unrecognized", async () => {
      const pageJsx = await CurriculumPage({
        searchParams: Promise.resolve({ file: "unknown-file.md" }),
      });
      render(pageJsx);
      expect(
        screen.getByRole("heading", { name: "Curriculum Knowledge Vault", level: 1 })
      ).toBeDefined();
    });

    it("handles array file searchParam with fallback when unrecognized", async () => {
      const pageJsx = await CurriculumPage({
        searchParams: Promise.resolve({ file: ["invalid-chapter.md"] }),
      });
      render(pageJsx);
      expect(
        screen.getByRole("heading", { name: "Curriculum Knowledge Vault", level: 1 })
      ).toBeDefined();
    });

    it("handles array file searchParam when first element resolves to a valid doc file", async () => {
      const pageJsx = await CurriculumPage({
        searchParams: Promise.resolve({ file: ["01-html.md", "02-css.md"] }),
      });
      render(pageJsx);
      expect(
        screen.getByRole("heading", { name: "Curriculum Knowledge Vault", level: 1 })
      ).toBeDefined();
    });
  });
});
