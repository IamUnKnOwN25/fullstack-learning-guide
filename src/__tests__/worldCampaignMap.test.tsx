/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorldCampaignMap } from "../components/WorldCampaignMap";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";
import { REALMS } from "../data/realms";
import { QUESTS } from "../data/quests";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("WorldCampaignMap Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      unlockedRealms: ["html", "css"],
      completedQuests: ["html-01"],
      completedBosses: ["html"],
      completedChapters: ["html"],
      stars: { "html-01": 3 },
      level: 5,
      rankTitle: "Junior Operative",
    });
  });

  it("renders campaign title, overview lore, and player progress stats", () => {
    render(<WorldCampaignMap />);

    expect(screen.getByText("The Web Matrix Campaign Map")).toBeDefined();
    expect(screen.getByText("Realms: 1/12 Cleared")).toBeDefined();
    expect(screen.getByText("Quests: 1/24 Mastered")).toBeDefined();
    expect(screen.getByText("Stars: 3/72 ★")).toBeDefined();
    expect(screen.getByText("Chapters: 1/13 Mastered")).toBeDefined();

    expect(screen.getByText("Online Matrix IDE")).toBeDefined();
    expect(screen.getByText("Curriculum Vault")).toBeDefined();
  });

  it("switches between Constellation and Grid views", () => {
    render(<WorldCampaignMap />);

    const gridBtn = screen.getByRole("button", { name: /switch to grid view/i });
    expect(gridBtn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(gridBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(gridBtn.getAttribute("aria-pressed")).toBe("true");

    // In grid view, realm cards are displayed as level 3 headings
    expect(
      screen.getByRole("heading", { name: "CSS, Flexbox & Grid", level: 3 })
    ).toBeDefined();

    const constellationBtn = screen.getByRole("button", {
      name: /switch to constellation view/i,
    });
    fireEvent.click(constellationBtn);
    expect(constellationBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("filters realms by category pill", () => {
    render(<WorldCampaignMap />);

    // Switch to grid view to inspect visible cards
    const gridBtn = screen.getByRole("button", { name: /switch to grid view/i });
    fireEvent.click(gridBtn);

    const backendFilter = screen.getByRole("button", { name: /backend & db/i });
    fireEvent.click(backendFilter);

    expect(backendFilter.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("heading", { name: "Node.js & Server Architecture", level: 3 })
    ).toBeDefined();
    expect(
      screen.queryByRole("heading", { name: "CSS, Flexbox & Grid", level: 3 })
    ).toBeNull();
  });

  it("filters realms via search input", () => {
    render(<WorldCampaignMap />);

    const gridBtn = screen.getByRole("button", { name: /switch to grid view/i });
    fireEvent.click(gridBtn);

    const searchInput = screen.getByRole("textbox", {
      name: /search realms and skills/i,
    });
    fireEvent.change(searchInput, { target: { value: "sanctuary" } });

    expect(
      screen.getByRole("heading", { name: "Strict TypeScript & Contracts", level: 3 })
    ).toBeDefined();
    expect(
      screen.queryByRole("heading", { name: "CSS, Flexbox & Grid", level: 3 })
    ).toBeNull();
  });

  it("displays empty state when search finds no matches and allows resetting filters", () => {
    render(<WorldCampaignMap />);

    const gridBtn = screen.getByRole("button", { name: /switch to grid view/i });
    fireEvent.click(gridBtn);

    const searchInput = screen.getByRole("textbox", {
      name: /search realms and skills/i,
    });
    fireEvent.change(searchInput, { target: { value: "non_existent_search_query_xyz" } });

    expect(screen.getByText("No realms found")).toBeDefined();
    expect(
      screen.getByText(/No campaign realms match “non_existent_search_query_xyz”/i)
    ).toBeDefined();

    // Reset filters
    const resetBtn = screen.getByRole("button", { name: /reset search filters/i });
    fireEvent.click(resetBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect((searchInput as HTMLInputElement).value).toBe("");
    expect(
      screen.getByRole("heading", { name: "HTML5 & Web Semantics", level: 3 })
    ).toBeDefined();
  });

  it("opens, inspects, and closes the realm inspector", () => {
    render(<WorldCampaignMap />);

    // By default, HTML (first realm) is selected in inspector (h2)
    expect(
      screen.getByRole("heading", { name: "HTML5 & Web Semantics", level: 2 })
    ).toBeDefined();
    expect(screen.getByText("Warm-Up Drill")).toBeDefined();
    expect(screen.getByText("Open IDE")).toBeDefined();

    // Close the inspector
    const closeBtn = screen.getByRole("button", { name: /close realm inspector/i });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByRole("heading", { name: "HTML5 & Web Semantics", level: 2 })
    ).toBeNull();
  });

  it("selects a realm in inspector when clicked in grid view", () => {
    render(<WorldCampaignMap />);

    const gridBtn = screen.getByRole("button", { name: /switch to grid view/i });
    fireEvent.click(gridBtn);

    const cssCard = screen.getByRole("heading", { name: "CSS, Flexbox & Grid", level: 3 });
    fireEvent.click(cssCard);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(
      screen.getByRole("heading", { name: "CSS, Flexbox & Grid", level: 2 })
    ).toBeDefined();
  });

  it("displays target recommender for next uncompleted quest", () => {
    useGameStore.setState({
      completedQuests: ["html_1_skeleton"], // html_2_forms is next
      completedBosses: [],
    });

    render(<WorldCampaignMap />);

    const htmlQuests = QUESTS["html"];
    const nextQuest = htmlQuests[1];
    expect(screen.getByText(`Continue: ${nextQuest.title}`)).toBeDefined();
  });

  it("displays target recommender for boss when all realm quests are completed", () => {
    const htmlQuests = QUESTS["html"].map((q) => q.id);
    useGameStore.setState({
      completedQuests: htmlQuests,
      completedBosses: [], // Boss is not yet defeated
    });

    render(<WorldCampaignMap />);

    expect(screen.getByText(/Boss Ready: The Malformed Tag Abomination/i)).toBeDefined();
  });

  it("shows grandmaster banner with victory fanfare when all 12 bosses are defeated", () => {
    useGameStore.setState({
      completedBosses: [
        "html", "css", "javascript", "typescript", "react", "backend",
        "databases", "devops", "testing", "cs", "security", "capstone",
      ],
    });

    render(<WorldCampaignMap />);

    expect(screen.getByText("Full-Stack Matrix Restored!")).toBeDefined();
    const victoryBtn = screen.getByRole("button", { name: /play victory fanfare/i });
    fireEvent.click(victoryBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("victory");
  });
});
