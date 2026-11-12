/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConstellationWorldMap, getRealmNodeStatus } from "../components/ConstellationWorldMap";
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

  it("provides role='region' with an accessible name on the outer map container", () => {
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

    const region = screen.getByRole("region", {
      name: "Interactive Realm Constellation Map",
    });
    expect(region).toBeDefined();
  });

  it("marks decorative background grid and conduit SVG as aria-hidden", () => {
    const onSelectRealm = vi.fn();

    const { container } = render(
      <ConstellationWorldMap
        selectedRealm={null}
        onSelectRealm={onSelectRealm}
        unlockedRealms={["html"]}
        completedBosses={[]}
        completedQuests={[]}
        level={1}
      />
    );

    const conduitsSvg = container.querySelector("svg");
    expect(conduitsSvg).toBeDefined();
    expect(conduitsSvg?.getAttribute("aria-hidden")).toBe("true");

    const gridOverlay = container.querySelector('div[style*="background-image"]');
    expect(gridOverlay).toBeDefined();
    expect(gridOverlay?.getAttribute("aria-hidden")).toBe("true");
  });

  it("sets aria-pressed and aria-disabled attributes according to selection and unlock status", () => {
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

    // Selected and unlocked node
    const htmlNode = screen.getByRole("button", { name: /html/i });
    expect(htmlNode.getAttribute("aria-pressed")).toBe("true");
    expect(htmlNode.getAttribute("aria-disabled")).toBe("false");

    // Unselected and locked node
    const capstoneNode = screen.getByRole("button", { name: /capstone/i });
    expect(capstoneNode.getAttribute("aria-pressed")).toBe("false");
    expect(capstoneNode.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders status legend with role='group' and quick-launch actions with navigation/toolbar landmarks", () => {
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

    // Legend container has role="group" with accessible name
    const legendGroup = screen.getByRole("group", { name: "Realm status legend" });
    expect(legendGroup).toBeDefined();

    // Selected realm actions landmark navigation
    const actionNav = screen.getByRole("navigation", { name: "Selected realm actions" });
    expect(actionNav).toBeDefined();

    // Selected realm actions toolbar
    const actionToolbar = screen.getByRole("toolbar", { name: "Realm launch actions" });
    expect(actionToolbar).toBeDefined();
  });

  describe("getRealmNodeStatus helper", () => {
    it("returns 'locked' when realm is not unlocked regardless of quest progression", () => {
      expect(getRealmNodeStatus(false, 0, 2)).toBe("locked");
      expect(getRealmNodeStatus(false, 1, 2)).toBe("locked");
      expect(getRealmNodeStatus(false, 2, 2)).toBe("locked");
    });

    it("returns 'available' when unlocked but no quests have been completed", () => {
      expect(getRealmNodeStatus(true, 0, 2)).toBe("available");
      expect(getRealmNodeStatus(true, 0, 0)).toBe("available");
    });

    it("returns 'in-progress' when unlocked and some but not all quests are completed", () => {
      expect(getRealmNodeStatus(true, 1, 2)).toBe("in-progress");
      expect(getRealmNodeStatus(true, 2, 3)).toBe("in-progress");
    });

    it("returns 'completed' when unlocked and all quests are completed or exceeded", () => {
      expect(getRealmNodeStatus(true, 2, 2)).toBe("completed");
      expect(getRealmNodeStatus(true, 3, 2)).toBe("completed");
    });

    it("assigns matching data-status attributes to rendered realm nodes", () => {
      const onSelectRealm = vi.fn();

      render(
        <ConstellationWorldMap
          selectedRealm={null}
          onSelectRealm={onSelectRealm}
          unlockedRealms={["html", "css"]}
          completedBosses={[]}
          completedQuests={["html_1_skeleton", "html_2_forms", "css_1_flexbox"]}
          level={1}
        />
      );

      // html has completed all 2 quests => completed
      const htmlNode = screen.getByRole("button", { name: /html/i });
      expect(htmlNode.getAttribute("data-status")).toBe("completed");

      // css has completed 1 out of 2 quests => in-progress
      const cssNode = screen.getByRole("button", { name: /css/i });
      expect(cssNode.getAttribute("data-status")).toBe("in-progress");

      // javascript is locked => locked
      const jsNode = screen.getByRole("button", { name: /javascript/i });
      expect(jsNode.getAttribute("data-status")).toBe("locked");
    });
  });

  describe("Escape key deselect behavior", () => {
    it("clears selection by calling onSelectRealm(null) when Escape is pressed on window", () => {
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

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onSelectRealm).toHaveBeenCalledTimes(1);
      expect(onSelectRealm).toHaveBeenCalledWith(null);
    });

    it("does not call onSelectRealm when non-Escape keys are pressed on window", () => {
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

      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.keyDown(window, { key: "ArrowDown" });
      expect(onSelectRealm).not.toHaveBeenCalled();
    });

    it("does not attach Escape listener when selectedRealm is null", () => {
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

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onSelectRealm).not.toHaveBeenCalled();
    });

    it("cleans up the keydown listener when unmounted", () => {
      const onSelectRealm = vi.fn();
      const htmlRealm = REALMS.find((r) => r.id === "html")!;

      const { unmount } = render(
        <ConstellationWorldMap
          selectedRealm={htmlRealm}
          onSelectRealm={onSelectRealm}
          unlockedRealms={["html"]}
          completedBosses={[]}
          completedQuests={[]}
          level={1}
        />
      );

      unmount();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onSelectRealm).not.toHaveBeenCalled();
    });
  });

  describe("Decorative icon accessibility", () => {
    it("ensures all Lucide icons carry aria-hidden='true'", () => {
      const onSelectRealm = vi.fn();
      const htmlRealm = REALMS.find((r) => r.id === "html")!;

      const { container } = render(
        <ConstellationWorldMap
          selectedRealm={htmlRealm}
          onSelectRealm={onSelectRealm}
          unlockedRealms={["html", "capstone"]}
          completedBosses={["capstone"]}
          completedQuests={[]}
          level={50}
        />
      );

      // Query all SVG elements that have lucide classes (lucide or lucide-*)
      const lucideIcons = container.querySelectorAll("svg.lucide");
      expect(lucideIcons.length).toBeGreaterThan(0);
      lucideIcons.forEach((icon) => {
        expect(icon.getAttribute("aria-hidden")).toBe("true");
      });
    });
  });
});
