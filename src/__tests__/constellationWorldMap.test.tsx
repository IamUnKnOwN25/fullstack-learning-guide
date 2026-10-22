/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConstellationWorldMap } from "../components/ConstellationWorldMap";
import { REALMS } from "../data/realms";
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
});
