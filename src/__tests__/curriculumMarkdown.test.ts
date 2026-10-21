import { describe, it, expect } from "vitest";
import React from "react";
import { formatInlineText, slugifyHeading } from "../lib/markdownFormatter";

describe("Curriculum Markdown Renderer & Inline Formatting", () => {
  it("formats italics with single asterisks without displaying literal asterisks", () => {
    const input = "Face off against the *Overflow Hydra*, *Callback Kraken*, and *Any-Demon*";
    const nodes = formatInlineText(input);

    // Look for <em> elements containing boss names
    const emNodes = nodes.filter(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === "em"
    );

    expect(emNodes.length).toBe(3);
    expect(nodes.some((n) => typeof n === "string" && n.includes("*"))).toBe(false);
  });

  it("formats italics with single underscores without breaking snake_case variables", () => {
    const input = "Check _important note_ while using snake_case_variable";
    const nodes = formatInlineText(input);

    const emNodes = nodes.filter(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === "em"
    );
    expect(emNodes.length).toBe(1);

    // Ensure snake_case_variable was preserved as plain string and not turned into italics
    const fullText = nodes
      .map((n) => (typeof n === "string" ? n : ""))
      .join("");
    expect(fullText).toContain("snake_case_variable");
  });

  it("formats bold text and bold-italic text cleanly without raw asterisks", () => {
    const input = "**Bold Title** and ***Extra Emphasis***";
    const nodes = formatInlineText(input);

    const strongNodes = nodes.filter(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === "strong"
    );
    expect(strongNodes.length).toBe(2);
    expect(nodes.some((n) => typeof n === "string" && n.includes("*"))).toBe(false);
  });

  it("formats strikethrough text with <del> element", () => {
    const input = "This is ~~deprecated code~~ in legacy browsers";
    const nodes = formatInlineText(input);

    const delNodes = nodes.filter(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === "del"
    );
    expect(delNodes.length).toBe(1);
    expect(nodes.some((n) => typeof n === "string" && n.includes("~~"))).toBe(false);
  });

  it("formats inline code with <code> element", () => {
    const input = "Run `npm run test` in terminal";
    const nodes = formatInlineText(input);

    const codeNodes = nodes.filter(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === "code"
    );
    expect(codeNodes.length).toBe(1);
    expect(nodes.some((n) => typeof n === "string" && n.includes("`"))).toBe(false);
  });

  it("formats links properly with onSelectDoc callback or anchor", () => {
    const calls: string[] = [];
    const onSelectDoc = (file: string) => {
      calls.push(file);
    };

    const input = "Read [HTML Guide](01-html-and-semantics.md) or see [#section-1](#sec-1)";
    const nodes = formatInlineText(input, onSelectDoc);

    const btn = nodes.find(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === "button"
    );
    expect(btn).toBeDefined();

    const anchor = nodes.find(
      (n): n is React.ReactElement<{ href: string }> => React.isValidElement(n) && n.type === "a"
    );
    expect(anchor).toBeDefined();
    expect(anchor?.props.href).toBe("#sec-1");
  });
});
