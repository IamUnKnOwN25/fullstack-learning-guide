/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorldCampaignMap } from "../components/WorldCampaignMap";
import { useGameStore } from "../lib/gameStore";
import { soundEngine } from "../lib/soundEngine";

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
