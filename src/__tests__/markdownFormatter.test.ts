import { describe, it, expect, vi } from "vitest";
import React from "react";
import {
  formatInlineText,
  slugifyHeading,
  isExternalLink,
  getLinkAttributes,
  extractHeadings,
  extractSectionHeadings,
} from "../lib/markdownFormatter";
import { soundEngine } from "../lib/soundEngine";

describe("markdownFormatter", () => {
  describe("slugifyHeading", () => {
    it("converts text to lowercase", () => {
      expect(slugifyHeading("HELLO WORLD")).toBe("hello-world");
    });

    it("removes markdown characters like backticks, asterisks, underscores, tildes, brackets, and parentheses", () => {
      expect(slugifyHeading("`code` and *italic* or **bold**")).toBe("code-and-italic-or-bold");
      expect(slugifyHeading("~tilde~ [link](url)")).toBe("tilde-linkurl");
    });

    it("removes special non-alphanumeric characters except spaces and hyphens", () => {
      expect(slugifyHeading("Hello @ World!")).toBe("hello-world");
      expect(slugifyHeading("100% Guaranteed & Safe")).toBe("100-guaranteed-safe");
    });

    it("replaces multiple spaces with a single hyphen", () => {
      expect(slugifyHeading("Hello    World")).toBe("hello-world");
    });

    it("trims leading and trailing spaces before slugifying", () => {
      expect(slugifyHeading("  heading  ")).toBe("heading");
    });

    it("strips emojis and special symbols gracefully", () => {
      expect(slugifyHeading("12. 🚀 Roadmap & Capstone 🎯")).toBe("12-roadmap-capstone");
    });

    it("safely handles null, undefined, and non-string inputs", () => {
      expect(slugifyHeading(null)).toBe("");
      expect(slugifyHeading(undefined)).toBe("");
      expect(slugifyHeading()).toBe("");
      expect(slugifyHeading(12345 as unknown as string)).toBe("");
      expect(slugifyHeading({} as unknown as string)).toBe("");
      expect(slugifyHeading([] as unknown as string)).toBe("");
    });
  });

  describe("formatInlineText", () => {
    it("returns plain text as is", () => {
      const nodes = formatInlineText("Just plain text");
      expect(nodes).toEqual(["Just plain text"]);
    });

    it("safely handles null, undefined, and non-string inputs", () => {
      expect(formatInlineText(null)).toEqual([]);
      expect(formatInlineText(undefined)).toEqual([]);
      expect(formatInlineText()).toEqual([]);
      expect(formatInlineText(12345 as unknown as string)).toEqual([]);
      expect(formatInlineText({} as unknown as string)).toEqual([]);
      expect(formatInlineText(null, vi.fn())).toEqual([]);
    });

    it("formats inline code properly", () => {
      const input = "Run `npm start` now";
      const nodes = formatInlineText(input);

      expect(nodes.length).toBe(3);
      expect(nodes[0]).toBe("Run ");
      expect(nodes[2]).toBe(" now");

      const codeNode = nodes[1] as React.ReactElement<{ children?: React.ReactNode }>;
      expect(React.isValidElement(codeNode)).toBe(true);
      expect(codeNode.type).toBe("code");
      expect(codeNode.props.children).toBe("npm start");
    });

    it("formats strong text with double asterisks or double underscores", () => {
      const input = "This is **bold** and __also bold__";
      const nodes = formatInlineText(input);

      const strongNodes = nodes.filter(
        (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n) && n.type === "strong"
      );
      expect(strongNodes.length).toBe(2);
      expect(strongNodes[0].props.children).toEqual("bold");
      expect(strongNodes[1].props.children).toEqual("also bold");
    });

    it("formats em text with single asterisk or single underscore", () => {
      const input = "This is *italic* and _also italic_";
      const nodes = formatInlineText(input);

      const emNodes = nodes.filter(
        (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n) && n.type === "em"
      );
      expect(emNodes.length).toBe(2);
      expect(emNodes[0].props.children).toEqual("italic");
      expect(emNodes[1].props.children).toEqual("also italic");
    });

    it("formats bold and italic text with triple asterisks or triple underscores", () => {
      const input = "This is ***bold italic*** and ___also bold italic___";
      const nodes = formatInlineText(input);

      const strongNodes = nodes.filter(
        (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n) && n.type === "strong"
      );
      expect(strongNodes.length).toBe(2);

      const emNode1 = strongNodes[0].props.children as React.ReactElement<{ children?: React.ReactNode }>;
      expect(emNode1.type).toBe("em");
      expect(emNode1.props.children).toEqual("bold italic");

      const emNode2 = strongNodes[1].props.children as React.ReactElement<{ children?: React.ReactNode }>;
      expect(emNode2.type).toBe("em");
      expect(emNode2.props.children).toEqual("also bold italic");
    });

    it("formats strikethrough text with double tildes", () => {
      const input = "This is ~~deleted~~ text";
      const nodes = formatInlineText(input);

      const delNode = nodes.find(
        (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n) && n.type === "del"
      );
      expect(delNode).toBeDefined();
      expect(delNode?.props.children).toEqual("deleted");
    });

    it("formats markdown document links as clickable buttons when onSelectDoc is provided", () => {
      const playSfxSpy = vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
      const mockOnSelectDoc = vi.fn();

      const input = "Check out [the guide](guide.md) here";
      const nodes = formatInlineText(input, mockOnSelectDoc);

      const btnNode = nodes.find(
        (n): n is React.ReactElement<{ onClick: () => void }> => React.isValidElement(n) && n.type === "button"
      );
      expect(btnNode).toBeDefined();

      if (btnNode) {
        btnNode.props.onClick();
        expect(mockOnSelectDoc).toHaveBeenCalledWith("guide.md");
        expect(playSfxSpy).toHaveBeenCalledWith("click");
      }

      playSfxSpy.mockRestore();
    });

    it("falls back to standard anchor link when document link has no onSelectDoc handler", () => {
      const input = "Check out [the guide](guide.md) here";
      const nodes = formatInlineText(input);

      const aNode = nodes.find(
        (n): n is React.ReactElement<{ href?: string; target?: string; rel?: string }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("guide.md");
      expect(aNode?.props.target).toBe("_blank");
      expect(aNode?.props.rel).toBe("noopener noreferrer");
    });

    it("formats hash links properly without target or rel", () => {
      const input = "Jump to [section 1](#section-1)";
      const nodes = formatInlineText(input);

      const aNode = nodes.find(
        (n): n is React.ReactElement<{ href?: string; children?: React.ReactNode; target?: string; rel?: string }> =>
          React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("#section-1");
      expect(aNode?.props.children).toEqual("section 1");
      expect(aNode?.props.target).toBeUndefined();
      expect(aNode?.props.rel).toBeUndefined();
    });

    it("formats external links properly with rel='noopener noreferrer' and target='_blank'", () => {
      const input = "Visit [Google](https://google.com) and [MDN](http://developer.mozilla.org)";
      const nodes = formatInlineText(input);

      const aNodes = nodes.filter(
        (n): n is React.ReactElement<{ href?: string; target?: string; rel?: string }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNodes.length).toBe(2);

      expect(aNodes[0].props.href).toBe("https://google.com");
      expect(aNodes[0].props.target).toBe("_blank");
      expect(aNodes[0].props.rel).toBe("noopener noreferrer");

      expect(aNodes[1].props.href).toBe("http://developer.mozilla.org");
      expect(aNodes[1].props.target).toBe("_blank");
      expect(aNodes[1].props.rel).toBe("noopener noreferrer");
    });

    it("formats complex nested markdown within links", () => {
      const input = "Read [**Important** `Syntax`](#syntax)";
      const nodes = formatInlineText(input);

      const aNode = nodes.find(
        (n): n is React.ReactElement<{ href?: string; children?: React.ReactNode[] }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("#syntax");
    });

    it("handles empty strings and special character-only inputs across slugifier and formatter", () => {
      expect(slugifyHeading("")).toBe("");
      expect(slugifyHeading("@#$%^&*()_+{}[]|\\")).toBe("");
      expect(formatInlineText("")).toEqual([]);
    });

    it("handles multiple distinct inline code spans in the same sentence", () => {
      const input = "Use `const` instead of `var` and avoid `any`";
      const nodes = formatInlineText(input);
      const codeNodes = nodes.filter(
        (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n) && n.type === "code"
      );
      expect(codeNodes).toHaveLength(3);
      expect(codeNodes[0].props.children).toBe("const");
      expect(codeNodes[1].props.children).toBe("var");
      expect(codeNodes[2].props.children).toBe("any");
    });

    it("handles adjacent strong and italic formatting without spacing errors", () => {
      const input = "**Bold***Italic*";
      const nodes = formatInlineText(input);
      expect(nodes.some((n) => React.isValidElement(n) && n.type === "strong")).toBe(true);
      expect(nodes.some((n) => React.isValidElement(n) && n.type === "em")).toBe(true);
    });

    it("handles relative path document navigation links", () => {
      const mockOnSelect = vi.fn();
      const input = "Go to [CSS Labyrinth](../02-css/css_1_flexbox.md)";
      const nodes = formatInlineText(input, mockOnSelect);

      const btnNode = nodes.find(
        (n): n is React.ReactElement<{ onClick: () => void }> => React.isValidElement(n) && n.type === "button"
      );
      expect(btnNode).toBeDefined();
      btnNode?.props.onClick();
      expect(mockOnSelect).toHaveBeenCalledWith("../02-css/css_1_flexbox.md");
    });

    it("neutralizes dangerous javascript: URLs in markdown links", () => {
      const input = "Click [Malicious](javascript:alert('pwned'))";
      const nodes = formatInlineText(input);

      const aNode = nodes.find(
        (n): n is React.ReactElement<{ href?: string }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("#");
    });
  });

  describe("isExternalLink", () => {
    it("identifies external URLs correctly", () => {
      expect(isExternalLink("https://nextjs.org")).toBe(true);
      expect(isExternalLink("http://example.com")).toBe(true);
      expect(isExternalLink("//cdn.jsdelivr.net")).toBe(true);
      expect(isExternalLink("mailto:support@matrix.dev")).toBe(true);
      expect(isExternalLink("tel:+1234567890")).toBe(true);
    });

    it("identifies non-external or invalid links correctly", () => {
      expect(isExternalLink("#section-1")).toBe(false);
      expect(isExternalLink("guide.md")).toBe(false);
      expect(isExternalLink("/world-map")).toBe(false);
      expect(isExternalLink("")).toBe(false);
      expect(isExternalLink(null)).toBe(false);
      expect(isExternalLink(undefined)).toBe(false);
      expect(isExternalLink(123 as unknown as string)).toBe(false);
    });
  });

  describe("getLinkAttributes", () => {
    it("returns external link attributes with security rel and target", () => {
      const attrs = getLinkAttributes("https://react.dev");
      expect(attrs).toEqual({
        href: "https://react.dev",
        target: "_blank",
        rel: "noopener noreferrer",
      });
    });

    it("returns in-page anchor attributes without target or rel", () => {
      const attrs = getLinkAttributes("#quick-start");
      expect(attrs).toEqual({
        href: "#quick-start",
      });
    });

    it("neutralizes malicious javascript / data URLs", () => {
      expect(getLinkAttributes("javascript:alert(1)")).toEqual({ href: "#" });
      expect(getLinkAttributes("vbscript:msgbox(1)")).toEqual({ href: "#" });
      expect(getLinkAttributes("data:text/html,<script>alert(1)</script>")).toEqual({ href: "#" });
    });

    it("handles null, undefined, or empty URLs safely", () => {
      expect(getLinkAttributes(null)).toEqual({ href: "#" });
      expect(getLinkAttributes(undefined)).toEqual({ href: "#" });
      expect(getLinkAttributes("")).toEqual({ href: "#" });
      expect(getLinkAttributes(123 as unknown as string)).toEqual({ href: "#" });
    });
  });

  describe("extractHeadings & extractSectionHeadings", () => {
    it("safely handles null, undefined, and non-string inputs", () => {
      expect(extractHeadings(null)).toEqual([]);
      expect(extractHeadings(undefined)).toEqual([]);
      expect(extractHeadings()).toEqual([]);
      expect(extractHeadings("")).toEqual([]);
      expect(extractHeadings(123 as unknown as string)).toEqual([]);
      expect(extractSectionHeadings(null)).toEqual([]);
    });

    it("extracts headings from markdown with title, slugified id, and level", () => {
      const markdown = `
# Matrix Gateway
Welcome to the training matrix.

## Core Landmarks
Here are the landmarks.

### Landmark Details
Specific detail section.

#### Deep Landmark Details
Fourth level.

##### Minor Note
Fifth level.

###### Micro Reference
Sixth level.
      `;

      const headings = extractHeadings(markdown);
      expect(headings).toHaveLength(6);
      expect(headings[0]).toEqual({
        title: "Matrix Gateway",
        id: "matrix-gateway",
        level: 1,
      });
      expect(headings[1]).toEqual({
        title: "Core Landmarks",
        id: "core-landmarks",
        level: 2,
      });
      expect(headings[2]).toEqual({
        title: "Landmark Details",
        id: "landmark-details",
        level: 3,
      });
      expect(headings[5]).toEqual({
        title: "Micro Reference",
        id: "micro-reference",
        level: 6,
      });
    });

    it("ignores heading syntax inside fenced code blocks", () => {
      const markdown = `
# Real Header

\`\`\`typescript
# This is a comment inside code
## Not a header either
\`\`\`

## Another Real Header
      `;

      const headings = extractHeadings(markdown);
      expect(headings).toHaveLength(2);
      expect(headings[0].title).toBe("Real Header");
      expect(headings[1].title).toBe("Another Real Header");
    });

    it("supports level filtering options", () => {
      const markdown = `
# Title
## Section 1
### Subsection 1.1
## Section 2
      `;

      const onlyH2 = extractHeadings(markdown, { minLevel: 2, maxLevel: 2 });
      expect(onlyH2).toHaveLength(2);
      expect(onlyH2.map((h) => h.title)).toEqual(["Section 1", "Section 2"]);
    });
  });
});
