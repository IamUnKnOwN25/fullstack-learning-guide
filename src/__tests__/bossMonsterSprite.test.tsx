/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BossMonsterSprite, resolveBossRealmId } from "../components/BossMonsterSprite";

describe("BossMonsterSprite Component", () => {
  it("renders with accessibility attributes and normal BOSS badge", () => {
    const { container } = render(<BossMonsterSprite realmId="html" isHit={false} bossHpPercent={100} />);

    const sprite = screen.getByTestId("boss-monster-sprite");
    expect(sprite).toBeDefined();
    expect(sprite.getAttribute("role")).toBe("img");
    expect(sprite.getAttribute("aria-label")).toContain("Boss Guardian (html)");
    expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (html) - Calm (100% HP)");
    expect(screen.getByText("BOSS")).toBeDefined();
    expect(screen.queryByText("ENRAGED")).toBeNull();

    // Verify aria-hidden on inner decorative elements
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    const badge = screen.getByText("BOSS");
    expect(badge.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders ENRAGED badge when boss HP drops below 40%", () => {
    const { container } = render(<BossMonsterSprite realmId="css" isHit={false} bossHpPercent={35} />);

    const sprite = screen.getByTestId("boss-monster-sprite");
    expect(sprite.getAttribute("aria-label")).toContain("Boss Guardian (css)");
    expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (css) - Enraged (35% HP)");
    expect(screen.getByText("ENRAGED")).toBeDefined();
    expect(screen.queryByText("BOSS")).toBeNull();

    const badge = screen.getByText("ENRAGED");
    expect(badge.getAttribute("aria-hidden")).toBe("true");
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies hit animation styles when isHit is true", () => {
    render(<BossMonsterSprite realmId="js" isHit={true} bossHpPercent={80} />);

    const sprite = screen.getByTestId("boss-monster-sprite");
    expect(sprite.className).toContain("animate-shake");
    expect(sprite.className).toContain("brightness-200");
  });

  it("renders unique SVG sprite for all 12 curriculum realms with aria-hidden", () => {
    const realms = [
      "html",
      "css",
      "js",
      "ts",
      "react",
      "backend",
      "db",
      "devops",
      "testing",
      "cs",
      "security",
      "capstone",
    ];

    for (const realmId of realms) {
      const { unmount, container } = render(
        <BossMonsterSprite realmId={realmId} isHit={false} bossHpPercent={50} />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
      unmount();
    }
  });

  describe("Realm Alias Resolution", () => {
    it("resolves shorthand alias 'js' to JavaScript Kraken sprite instead of capstone", () => {
      const { container } = render(<BossMonsterSprite realmId="js" isHit={false} bossHpPercent={100} />);
      expect(container.textContent).toContain("JS");
      expect(container.textContent).not.toContain("NULL");
    });

    it("resolves shorthand alias 'ts' to TypeScript Any-Demon sprite instead of capstone", () => {
      const { container } = render(<BossMonsterSprite realmId="ts" isHit={false} bossHpPercent={100} />);
      expect(container.textContent).toContain(":any");
      expect(container.textContent).not.toContain("NULL");
    });

    it("resolves shorthand aliases 'db' and 'database' to Databases Behemoth sprite instead of capstone", () => {
      const { unmount, container } = render(<BossMonsterSprite realmId="db" isHit={false} bossHpPercent={100} />);
      expect(container.textContent).toContain("' OR 1=1--");
      expect(container.textContent).not.toContain("NULL");
      unmount();

      const { container: dbFullContainer } = render(
        <BossMonsterSprite realmId="database" isHit={false} bossHpPercent={100} />
      );
      expect(dbFullContainer.textContent).toContain("' OR 1=1--");
      expect(dbFullContainer.textContent).not.toContain("NULL");
    });

    it("normalizes realmId with whitespace and uppercase letters", () => {
      const { unmount: u1, container: c1 } = render(
        <BossMonsterSprite realmId="  JS  " isHit={false} bossHpPercent={100} />
      );
      expect(c1.textContent).toContain("JS");
      u1();

      const { unmount: u2, container: c2 } = render(
        <BossMonsterSprite realmId=" TS " isHit={false} bossHpPercent={100} />
      );
      expect(c2.textContent).toContain(":any");
      u2();

      const { container: c3 } = render(
        <BossMonsterSprite realmId="DATABASE" isHit={false} bossHpPercent={100} />
      );
      expect(c3.textContent).toContain("' OR 1=1--");
    });

    it("falls through to capstone NULL void sprite for unknown realms", () => {
      const { container } = render(
        <BossMonsterSprite realmId="unknown-realm" isHit={false} bossHpPercent={100} />
      );
      expect(container.textContent).toContain("NULL");
    });

    it("resolveBossRealmId helper maps aliases accurately", () => {
      expect(resolveBossRealmId("js")).toBe("javascript");
      expect(resolveBossRealmId("  JS  ")).toBe("javascript");
      expect(resolveBossRealmId("ts")).toBe("typescript");
      expect(resolveBossRealmId("TS")).toBe("typescript");
      expect(resolveBossRealmId("db")).toBe("databases");
      expect(resolveBossRealmId("database")).toBe("databases");
      expect(resolveBossRealmId("DATABASE")).toBe("databases");
      expect(resolveBossRealmId("html")).toBe("html");
      expect(resolveBossRealmId("capstone")).toBe("capstone");
    });
  });

  describe("Enrage Threshold & Dynamic ARIA Attributes", () => {
    it("treats exactly 40% HP as Calm (BOSS badge) and 39% HP as Enraged", () => {
      const { unmount, rerender } = render(
        <BossMonsterSprite realmId="react" isHit={false} bossHpPercent={40} />
      );
      const sprite = screen.getByTestId("boss-monster-sprite");
      expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (react) - Calm (40% HP)");
      expect(screen.getByText("BOSS")).toBeDefined();
      expect(screen.queryByText("ENRAGED")).toBeNull();

      rerender(<BossMonsterSprite realmId="react" isHit={false} bossHpPercent={39} />);
      expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (react) - Enraged (39% HP)");
      expect(screen.getByText("ENRAGED")).toBeDefined();
      expect(screen.queryByText("BOSS")).toBeNull();
      unmount();
    });

    it("clamps negative HP to 0% and excess HP to 100% in aria-label", () => {
      const { unmount, rerender } = render(
        <BossMonsterSprite realmId="security" isHit={false} bossHpPercent={-15} />
      );
      const sprite = screen.getByTestId("boss-monster-sprite");
      expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (security) - Enraged (0% HP)");

      rerender(<BossMonsterSprite realmId="security" isHit={false} bossHpPercent={150} />);
      expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (security) - Calm (100% HP)");
      unmount();
    });

    it("rounds fractional HP percentages to the nearest integer in aria-label", () => {
      const { unmount, rerender } = render(
        <BossMonsterSprite realmId="cs" isHit={false} bossHpPercent={72.4} />
      );
      const sprite = screen.getByTestId("boss-monster-sprite");
      expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (cs) - Calm (72% HP)");

      rerender(<BossMonsterSprite realmId="cs" isHit={false} bossHpPercent={72.6} />);
      expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (cs) - Calm (73% HP)");
      unmount();
    });

    it("decorates inner SVGs with aria-hidden='true' to hide decorative tokens from screen readers", () => {
      const { container } = render(
        <BossMonsterSprite realmId="security" isHit={false} bossHpPercent={100} />
      );
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");

      const pill = screen.getByText("BOSS");
      expect(pill.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
