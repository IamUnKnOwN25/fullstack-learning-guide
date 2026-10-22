import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn Utility Helper", () => {
  it("merges standard class strings cleanly", () => {
    expect(cn("px-4", "py-2", "bg-black")).toBe("px-4 py-2 bg-black");
  });

  it("handles conditional classes correctly", () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn("base-class", isTrue && "active-class", isFalse && "inactive-class")).toBe(
      "base-class active-class"
    );
  });

  it("ignores falsy, null, and undefined values", () => {
    expect(cn("valid", null, undefined, false, 0 && "ignored", "")).toBe("valid");
  });

  it("handles object-based conditional classes", () => {
    expect(
      cn({
        "btn-primary": true,
        "btn-disabled": false,
        "btn-rounded": true,
      })
    ).toBe("btn-primary btn-rounded");
  });

  it("handles arrays and nested class structures", () => {
    expect(cn(["flex", ["items-center", ["justify-between"]]])).toBe(
      "flex items-center justify-between"
    );
  });

  it("resolves conflicting Tailwind utility classes via tailwind-merge", () => {
    // Conflict on padding
    expect(cn("p-4", "p-2")).toBe("p-2");

    // Conflict on text color
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");

    // Conflict on background colors
    expect(cn("bg-red-500", "bg-matrix-dark")).toBe("bg-matrix-dark");

    // Conflict on display
    expect(cn("block", "flex", "hidden")).toBe("hidden");
  });

  it("returns empty string when given no arguments", () => {
    expect(cn()).toBe("");
  });
});
