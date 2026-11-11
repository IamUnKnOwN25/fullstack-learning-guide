import { describe, it, expect } from "vitest";
import {
  cn,
  formatNumber,
  formatDurationSeconds,
  clampNumber,
  truncateText,
  slugifyText,
} from "../lib/utils";

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

describe("formatNumber Utility Helper", () => {
  it("formats positive integers with en-US comma separation", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1234567)).toBe("1,234,567");
    expect(formatNumber(42)).toBe("42");
  });

  it("formats zero and handles negative zero cleanly", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-0)).toBe("0");
  });

  it("formats negative numbers with comma separation", () => {
    expect(formatNumber(-1234)).toBe("-1,234");
    expect(formatNumber(-9876543)).toBe("-9,876,543");
  });

  it("rounds floating-point numbers to integers", () => {
    expect(formatNumber(42.4)).toBe("42");
    expect(formatNumber(42.6)).toBe("43");
    expect(formatNumber(999.9)).toBe("1,000");
  });

  it("returns '0' for NaN, Infinity, -Infinity, and nullish inputs", () => {
    expect(formatNumber(NaN)).toBe("0");
    expect(formatNumber(Infinity)).toBe("0");
    expect(formatNumber(-Infinity)).toBe("0");
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
    expect(formatNumber("invalid" as unknown as number)).toBe("0");
  });
});

describe("formatDurationSeconds Utility Helper", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatDurationSeconds(0)).toBe("00:00");
  });

  it("formats under a minute with leading zero padding", () => {
    expect(formatDurationSeconds(5)).toBe("00:05");
    expect(formatDurationSeconds(59)).toBe("00:59");
  });

  it("formats durations under an hour as MM:SS", () => {
    expect(formatDurationSeconds(60)).toBe("01:00");
    expect(formatDurationSeconds(65)).toBe("01:05");
    expect(formatDurationSeconds(3599)).toBe("59:59");
  });

  it("formats durations of an hour or more as HH:MM:SS", () => {
    expect(formatDurationSeconds(3600)).toBe("01:00:00");
    expect(formatDurationSeconds(3665)).toBe("01:01:05");
    expect(formatDurationSeconds(7322)).toBe("02:02:02");
    expect(formatDurationSeconds(360000)).toBe("100:00:00");
  });

  it("floors decimal second values", () => {
    expect(formatDurationSeconds(65.9)).toBe("01:05");
    expect(formatDurationSeconds(3600.5)).toBe("01:00:00");
  });

  it("clamps negative numbers and handles NaN/Infinity/nullish as 00:00", () => {
    expect(formatDurationSeconds(-10)).toBe("00:00");
    expect(formatDurationSeconds(NaN)).toBe("00:00");
    expect(formatDurationSeconds(Infinity)).toBe("00:00");
    expect(formatDurationSeconds(-Infinity)).toBe("00:00");
    expect(formatDurationSeconds(null)).toBe("00:00");
    expect(formatDurationSeconds(undefined)).toBe("00:00");
    expect(formatDurationSeconds("bad" as unknown as number)).toBe("00:00");
  });
});

describe("clampNumber Utility Helper", () => {
  it("returns value if within min and max", () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(0, 0, 10)).toBe(0);
    expect(clampNumber(10, 0, 10)).toBe(10);
  });

  it("clamps value to min when below range", () => {
    expect(clampNumber(-5, 0, 10)).toBe(0);
    expect(clampNumber(-100, -50, 50)).toBe(-50);
  });

  it("clamps value to max when above range", () => {
    expect(clampNumber(15, 0, 10)).toBe(10);
    expect(clampNumber(100, -50, 50)).toBe(50);
  });

  it("swaps bounds if min > max", () => {
    expect(clampNumber(5, 10, 0)).toBe(5);
    expect(clampNumber(-5, 10, 0)).toBe(0);
    expect(clampNumber(15, 10, 0)).toBe(10);
  });

  it("returns safe min if value is NaN or nullish", () => {
    expect(clampNumber(NaN, 0, 10)).toBe(0);
    expect(clampNumber(NaN, 10, 0)).toBe(0);
    expect(clampNumber(NaN, 5, 15)).toBe(5);
    expect(clampNumber(null as unknown as number, 5, 15)).toBe(5);
    expect(clampNumber(undefined as unknown as number, 5, 15)).toBe(5);
  });

  it("handles non-finite min/max boundaries gracefully", () => {
    expect(clampNumber(5, NaN, 10)).toBe(5);
    expect(clampNumber(5, 0, NaN)).toBe(0);
  });
});

describe("truncateText Utility Helper", () => {
  it("returns original text if text length is less than or equal to maxLength", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("truncates text and appends default ellipsis suffix", () => {
    expect(truncateText("Hello World", 8)).toBe("Hello...");
    expect(truncateText("The Matrix Chronicles", 12)).toBe("The Matri...");
  });

  it("supports custom suffix", () => {
    expect(truncateText("Hello World", 9, " [more]")).toBe("He [more]");
    expect(truncateText("Hello World", 5, "!")).toBe("Hell!");
  });

  it("safely handles small maxLength less than or equal to suffix length", () => {
    expect(truncateText("Hello World", 3)).toBe("Hel");
    expect(truncateText("Hello World", 2)).toBe("He");
    expect(truncateText("Hello World", 1)).toBe("H");
  });

  it("safely handles zero and negative maxLength", () => {
    expect(truncateText("Hello World", 0)).toBe("");
    expect(truncateText("Hello World", -5)).toBe("");
    expect(truncateText("Hello World", NaN)).toBe("");
  });

  it("safely handles nullish and non-string inputs", () => {
    expect(truncateText(null, 10)).toBe("");
    expect(truncateText(undefined, 10)).toBe("");
    expect(truncateText(123 as unknown as string, 10)).toBe("");
  });
});

describe("slugifyText Utility Helper", () => {
  it("converts strings to lowercase hyphen-separated slugs", () => {
    expect(slugifyText("Hello World")).toBe("hello-world");
    expect(slugifyText("React Nextjs Game")).toBe("react-nextjs-game");
  });

  it("strips diacritics and accents correctly", () => {
    expect(slugifyText("Crème Brûlée")).toBe("creme-brulee");
    expect(slugifyText("Zürich")).toBe("zurich");
    expect(slugifyText("Español")).toBe("espanol");
  });

  it("strips punctuation, symbols, and collapses hyphens", () => {
    expect(slugifyText("Quest #4: The React Matrix (Part 2)!")).toBe(
      "quest-4-the-react-matrix-part-2"
    );
    expect(slugifyText("foo --- bar ___ baz")).toBe("foo-bar-baz");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyText("---hello-world---")).toBe("hello-world");
    expect(slugifyText("   hello-world   ")).toBe("hello-world");
  });

  it("returns empty string for strings consisting only of symbols or spaces", () => {
    expect(slugifyText("!@#$%^&*()_+")).toBe("");
    expect(slugifyText("   ---   ")).toBe("");
    expect(slugifyText("")).toBe("");
  });

  it("handles nullish and non-string inputs safely", () => {
    expect(slugifyText(null)).toBe("");
    expect(slugifyText(undefined)).toBe("");
    expect(slugifyText(12345 as unknown as string)).toBe("");
  });
});
