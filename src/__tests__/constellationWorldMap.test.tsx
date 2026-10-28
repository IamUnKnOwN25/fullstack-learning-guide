/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConstellationWorldMap } from "../components/ConstellationWorldMap";
import { REALMS } from "../data/realms";
import { QUESTS } from "../data/quests";
import { soundEngine } from "../lib/soundEngine";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ConstellationWorldMap Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
  });

  it("renders all 12 realm nodes with appropriate accessibility states", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html", "css"]}
        completedBosses={["html"]}
        completedQuests={["html-01", "html-02"]}
        level={3}
      />
    );

    // html is completedBoss => Mastered
    const htmlNode = screen.getByRole("button", { name: /html/i });
    expect(htmlNode).toBeDefined();
    expect(htmlNode.getAttribute("aria-label")).toContain("Mastered");

    // css is unlocked but boss not defeated => Unlocked
    const cssNode = screen.getByRole("button", { name: /css/i });
    expect(cssNode).toBeDefined();
    expect(cssNode.getAttribute("aria-label")).toContain("Unlocked");

    // capstone is locked => Sealed
    const capstoneNode = screen.getByRole("button", { name: /capstone/i });
    expect(capstoneNode).toBeDefined();
    expect(capstoneNode.getAttribute("aria-label")).toContain("Sealed");

    // All 12 realms rendered
    REALMS.forEach((realm) => {
      expect(screen.getByText(realm.realmName)).toBeDefined();
    });
  });

  it("handles clicking on a realm node to select it", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    const htmlNode = screen.getByRole("button", { name: /html/i });
    fireEvent.click(htmlNode);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(onSelectRealm).toHaveBeenCalledWith(
      expect.objectContaining({ id: "html" })
    );
  });

  it("handles keyboard Enter/Space activation on a realm node", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    const htmlNode = screen.getByRole("button", { name: /html/i });
    fireEvent.keyDown(htmlNode, { key: "Enter" });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(onSelectRealm).toHaveBeenCalledWith(
      expect.objectContaining({ id: "html" })
    );

    fireEvent.keyDown(htmlNode, { key: " " });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });

  it("handles double-click to launch quest or boss", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    const htmlNode = screen.getByRole("button", { name: /html/i });
    fireEvent.doubleClick(htmlNode);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/quest/html/"));
  });

  it("routes to boss on double-click if all quests in the realm are completed", () => {
    const onSelectRealm = vi.fn();
    const htmlQuestIds = (QUESTS["html"] || []).map((q) => q.id);

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={htmlQuestIds}
        level={5}
      />
    );

    const htmlNode = screen.getByRole("button", { name: /html/i });
    fireEvent.doubleClick(htmlNode);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");
    expect(mockPush).toHaveBeenCalledWith("/boss/html");
  });

  it("renders selected realm quick-launch bar with trial, boss, and guide links", () => {
    const onSelectRealm = vi.fn();
    const selectedRealm = REALMS.find((r) => r.id === "html")!;

    render(
      <ConstellationWorldMap
        selectedRealm={selectedRealm}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    expect(screen.getByText(new RegExp(`${selectedRealm.realmName}:`, "i"))).toBeDefined();

    // Check boss link
    const bossLink = screen.getByRole("link", {
      name: new RegExp(`Challenge Boss for ${selectedRealm.realmName}`, "i"),
    });
    expect(bossLink).toBeDefined();
    expect(bossLink.getAttribute("href")).toBe("/boss/html");

    // Check guide link
    const guideLink = screen.getByRole("link", {
      name: new RegExp(`View Curriculum Guide for ${selectedRealm.realmName}`, "i"),
    });
    expect(guideLink).toBeDefined();
    expect(guideLink.getAttribute("href")).toContain("/curriculum?file=");
  });

  it("applies dimmed styling to non-highlighted realms when filter is active", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html", "css"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
        highlightedRealmIds={["html"]}
      />
    );

    const htmlNode = screen.getByRole("button", { name: /html/i });
    const cssNode = screen.getByRole("button", { name: /css/i });

    expect(htmlNode.className).toContain("opacity-100");
    expect(cssNode.className).toContain("opacity-25");
  });

  it("renders quest progress pill for unlocked realms", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={["html_1_skeleton"]}
        level={1}
      />
    );

    expect(screen.getByText("1/2 Quests")).toBeDefined();
  });

  it("renders Crown icon for Capstone realm with mastered styling when boss cleared", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["capstone"]}
        completedBosses={["capstone"]}
        completedQuests={[]}
        level={50}
      />
    );

    const capstoneNode = screen.getByRole("button", { name: /capstone/i });
    expect(capstoneNode.getAttribute("aria-label")).toContain("Mastered");
    expect(capstoneNode.innerHTML).toContain("animate-bounce");
  });

  it("renders SVG active conduits with pulse animation for unlocked pathways", () => {
    const onSelectRealm = vi.fn();

    const { container } = render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html", "css"]}
        completedBosses={["html"]}
        completedQuests={[]}
        level={2}
      />
    );

    // Active conduit uses url(#activeConduit)
    const activeLines = container.querySelectorAll('line[stroke="url(#activeConduit)"]');
    expect(activeLines.length).toBeGreaterThan(0);

    // Pulse animations are rendered on active conduits
    const pulseCircles = container.querySelectorAll('circle.animate-pulse');
    expect(pulseCircles.length).toBeGreaterThan(0);
  });

  it("renders map legend indicators for Mastered, Active Trial, and Sealed states", () => {
    const onSelectRealm = vi.fn();

    render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    expect(screen.getByText("Mastered")).toBeDefined();
    expect(screen.getByText("Active Trial")).toBeDefined();
    expect(screen.getByText("Sealed")).toBeDefined();
  });

  it("triggers audio feedback when clicking quick-launch bar links", () => {
    const onSelectRealm = vi.fn();
    const htmlRealm = REALMS.find((r) => r.id === "html")!;

    render(
      <ConstellationWorldMap
        selectedRealm={htmlRealm}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    const trial1Link = screen.getByRole("link", { name: new RegExp(`Launch Trial 1 for ${htmlRealm.realmName}`, "i") });
    fireEvent.click(trial1Link);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");

    const bossLink = screen.getByRole("link", { name: new RegExp(`Challenge Boss for ${htmlRealm.realmName}`, "i") });
    fireEvent.click(bossLink);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("attack");

    const guideLink = screen.getByRole("link", { name: new RegExp(`View Curriculum Guide for ${htmlRealm.realmName}`, "i") });
    fireEvent.click(guideLink);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
  });
});
