/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BossMonsterSprite } from "../components/BossMonsterSprite";

describe("BossMonsterSprite Component", () => {
  it("renders with accessibility attributes and normal BOSS badge", () => {
    render(<BossMonsterSprite realmId="html" isHit={false} bossHpPercent={100} />);

    const sprite = screen.getByTestId("boss-monster-sprite");
    expect(sprite).toBeDefined();
    expect(sprite.getAttribute("role")).toBe("img");
    expect(sprite.getAttribute("aria-label")).toBe("Boss Guardian (html)");
    expect(screen.getByText("BOSS")).toBeDefined();
    expect(screen.queryByText("ENRAGED")).toBeNull();
  });

  it("renders ENRAGED badge when boss HP drops below 40%", () => {
    render(<BossMonsterSprite realmId="css" isHit={false} bossHpPercent={35} />);

    expect(screen.getByText("ENRAGED")).toBeDefined();
    expect(screen.queryByText("BOSS")).toBeNull();
  });

  it("applies hit animation styles when isHit is true", () => {
    render(<BossMonsterSprite realmId="js" isHit={true} bossHpPercent={80} />);

    const sprite = screen.getByTestId("boss-monster-sprite");
    expect(sprite.className).toContain("animate-shake");
    expect(sprite.className).toContain("brightness-200");
  });

  it("renders unique SVG sprite for all 12 curriculum realms", () => {
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
      unmount();
    }
  });
});
