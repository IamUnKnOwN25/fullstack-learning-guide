import { describe, it, expect, vi } from "vitest";
import React from "react";
import {
  formatInlineText,
  slugifyHeading,
  isExternalLink,
  getLinkAttributes,
  extractHeadings,
  extractSectionHeadings,
  extractCodeBlocks,
  stripMarkdownFormatting,
  estimateReadingTimeMinutes,
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
      expect(aNode?.props.target).toBeUndefined();
      expect(aNode?.props.rel).toBeUndefined();
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

    it("supports balanced single-level parentheses inside markdown link URLs", () => {
      const input = "Read [Closure](https://en.wikipedia.org/wiki/Closure_(computer_programming)) for details.";
      const nodes = formatInlineText(input);
      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toBe("Read ");
      const aNode = nodes[1] as React.ReactElement<{ href?: string; target?: string; rel?: string; children?: React.ReactNode }>;
      expect(React.isValidElement(aNode)).toBe(true);
      expect(aNode.type).toBe("a");
      expect(aNode.props.href).toBe("https://en.wikipedia.org/wiki/Closure_(computer_programming)");
      expect(aNode.props.target).toBe("_blank");
      expect(aNode.props.rel).toBe("noopener noreferrer");
      expect(nodes[2]).toBe(" for details.");
    });

    it("supports multiple balanced parentheses in Wikipedia style URLs", () => {
      const input = "Check [Matrix Film](https://en.wikipedia.org/wiki/Matrix_(film)#Plot_(synopsis)) now";
      const nodes = formatInlineText(input);
      const aNode = nodes[1] as React.ReactElement<{ href?: string }>;
      expect(aNode.props.href).toBe("https://en.wikipedia.org/wiki/Matrix_(film)#Plot_(synopsis)");
      expect(nodes[2]).toBe(" now");
    });

    it("does not add target or rel to internal relative app paths in formatInlineText", () => {
      const input = "Visit [Curriculum](/curriculum) and [World Map](/world-map) or [HTML Quest](quest/html)";
      const nodes = formatInlineText(input);
      const aNodes = nodes.filter(
        (n): n is React.ReactElement<{ href?: string; target?: string; rel?: string }> =>
          React.isValidElement(n) && n.type === "a"
      );
      expect(aNodes).toHaveLength(3);
      expect(aNodes[0].props.href).toBe("/curriculum");
      expect(aNodes[0].props.target).toBeUndefined();
      expect(aNodes[0].props.rel).toBeUndefined();
      expect(aNodes[1].props.href).toBe("/world-map");
      expect(aNodes[1].props.target).toBeUndefined();
      expect(aNodes[1].props.rel).toBeUndefined();
      expect(aNodes[2].props.href).toBe("quest/html");
      expect(aNodes[2].props.target).toBeUndefined();
      expect(aNodes[2].props.rel).toBeUndefined();
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

    it("returns internal relative app path attributes without target or rel", () => {
      expect(getLinkAttributes("/curriculum")).toEqual({ href: "/curriculum" });
      expect(getLinkAttributes("/world-map")).toEqual({ href: "/world-map" });
      expect(getLinkAttributes("quest/html")).toEqual({ href: "quest/html" });
      expect(getLinkAttributes("guide.md")).toEqual({ href: "guide.md" });
      expect(getLinkAttributes("../reference/api.md")).toEqual({ href: "../reference/api.md" });
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

    it("ignores heading syntax inside tilde (~~~) fenced code blocks", () => {
      const markdown = `
# Real Header

~~~python
# This is a comment inside tilde code block
## Not a header either
~~~

## Another Real Header
      `;

      const headings = extractHeadings(markdown);
      expect(headings).toHaveLength(2);
      expect(headings[0].title).toBe("Real Header");
      expect(headings[1].title).toBe("Another Real Header");
    });

    it("ignores heading syntax inside mixed backtick and tilde fenced code blocks", () => {
      const markdown = `
# Real Header 1

\`\`\`
# Backtick comment
\`\`\`

## Real Header 2

~~~bash
# Tilde comment
~~~

### Real Header 3
      `;

      const headings = extractHeadings(markdown);
      expect(headings).toHaveLength(3);
      expect(headings.map((h) => h.title)).toEqual(["Real Header 1", "Real Header 2", "Real Header 3"]);
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

  describe("extractCodeBlocks", () => {
    it("safely handles null, undefined, and non-string inputs", () => {
      expect(extractCodeBlocks(null)).toEqual([]);
      expect(extractCodeBlocks(undefined)).toEqual([]);
      expect(extractCodeBlocks()).toEqual([]);
      expect(extractCodeBlocks("")).toEqual([]);
      expect(extractCodeBlocks(12345 as unknown as string)).toEqual([]);
    });

    it("returns empty array when no code blocks exist", () => {
      expect(extractCodeBlocks("Just regular markdown text without code blocks.")).toEqual([]);
    });

    it("extracts code blocks with explicit language tags", () => {
      const markdown = "```typescript\nconst message: string = 'Hello Matrix';\nconsole.log(message);\n```";
      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        language: "typescript",
        code: "const message: string = 'Hello Matrix';\nconsole.log(message);",
      });
    });

    it("defaults language tag to 'text' when omitted", () => {
      const markdown = "```\nPlain code snippet without language\n```";
      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        language: "text",
        code: "Plain code snippet without language",
      });
    });

    it("normalizes language tags to lowercase and extracts language from info strings with attributes", () => {
      const markdown = "```TypeScript title='App.tsx' lineNumbers\nconst x = 42;\n```";
      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        language: "typescript",
        code: "const x = 42;",
      });
    });

    it("extracts multiple code blocks in sequential order", () => {
      const markdown = `
# Multi-Language Guide

First, HTML:
\`\`\`html
<div class="box">Content</div>
\`\`\`

Then CSS:
\`\`\`css
.box { color: cyan; }
\`\`\`

Finally JS:
\`\`\`js
console.log("Ready");
\`\`\`
      `;

      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(3);
      expect(blocks[0]).toEqual({ language: "html", code: '<div class="box">Content</div>' });
      expect(blocks[1]).toEqual({ language: "css", code: ".box { color: cyan; }" });
      expect(blocks[2]).toEqual({ language: "js", code: 'console.log("Ready");' });
    });

    it("supports tilde-fenced (~~~) code blocks", () => {
      const markdown = "~~~python\ndef greet():\n    return 'Matrix'\n~~~";
      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        language: "python",
        code: "def greet():\n    return 'Matrix'",
      });
    });

    it("handles empty code blocks correctly", () => {
      const markdown = "```json\n```";
      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toEqual({
        language: "json",
        code: "",
      });
    });

    it("preserves empty lines and indentation inside code blocks", () => {
      const markdown = "```python\ndef test():\n\n    value = 1\n    return value\n```";
      const blocks = extractCodeBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].code).toBe("def test():\n\n    value = 1\n    return value");
    });
  });

  describe("stripMarkdownFormatting", () => {
    it("safely handles null, undefined, and non-string inputs", () => {
      expect(stripMarkdownFormatting(null)).toBe("");
      expect(stripMarkdownFormatting(undefined)).toBe("");
      expect(stripMarkdownFormatting()).toBe("");
      expect(stripMarkdownFormatting("")).toBe("");
      expect(stripMarkdownFormatting(12345 as unknown as string)).toBe("");
    });

    it("strips ATX headings of all levels", () => {
      const markdown = "# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Heading 1\nHeading 2\nHeading 3\nHeading 4\nHeading 5\nHeading 6");
    });

    it("strips headings with closing hash delimiters", () => {
      const markdown = "## Centered Heading ##\n### Subsection ###";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Centered Heading\nSubsection");
    });

    it("strips bold and italic markdown markers", () => {
      const markdown = "This is **bold**, *italic*, ***bold-italic***, and ~~deleted~~ text.";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("This is bold, italic, bold-italic, and deleted text.");
    });

    it("strips underscore formatting while preserving snake_case identifier underscores", () => {
      const markdown = "Use __bold_underscore__ or _italic_underscore_ with const USER_ACCOUNT_ID = 1;";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Use bold_underscore or italic_underscore with const USER_ACCOUNT_ID = 1;");
    });

    it("strips inline code backticks", () => {
      const markdown = "Run `npm run build` and `npm test` or ``const x = `template`;`` now.";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Run npm run build and npm test or const x = `template`; now.");
    });

    it("strips markdown links and image tags while preserving anchor/alt text", () => {
      const markdown = "Read [Matrix Guide](https://matrix.dev) or see ![System Diagram](/images/sys.png).";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Read Matrix Guide or see System Diagram.");
    });

    it("supports balanced parentheses in Wikipedia URLs when stripping links", () => {
      const markdown = "See [Closure](https://en.wikipedia.org/wiki/Closure_(computer_programming)) for scoping.";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("See Closure for scoping.");
    });

    it("strips fenced code block markers leaving code content intact", () => {
      const markdown = `
Here is code:
\`\`\`typescript
const matrix = new Matrix();
matrix.enter();
\`\`\`
All done.
      `;
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Here is code:\nconst matrix = new Matrix();\nmatrix.enter();\nAll done.");
    });

    it("strips blockquotes and horizontal dividers cleanly", () => {
      const markdown = "> The Matrix is everywhere.\n---\n> It is all around us.";
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("The Matrix is everywhere.\n\nIt is all around us.");
    });

    it("handles complex mixed markdown cleanly", () => {
      const markdown = `
# Title

Welcome to **[The Matrix Chronicles](https://matrix.dev)**!
Here is \`quickStart()\` function.
      `;
      const plain = stripMarkdownFormatting(markdown);
      expect(plain).toBe("Title\n\nWelcome to The Matrix Chronicles!\nHere is quickStart() function.");
    });
  });

  describe("estimateReadingTimeMinutes", () => {
    it("safely handles null, undefined, empty, or whitespace-only inputs", () => {
      expect(estimateReadingTimeMinutes(null)).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes(undefined)).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes()).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes("")).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes("   \n\t  ")).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes(12345 as unknown as string)).toEqual({ wordCount: 0, minutes: 0 });
    });

    it("returns zero counts when markdown contains only formatting characters without words", () => {
      expect(estimateReadingTimeMinutes("#")).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes("```\n```")).toEqual({ wordCount: 0, minutes: 0 });
      expect(estimateReadingTimeMinutes("---")).toEqual({ wordCount: 0, minutes: 0 });
    });

    it("estimates short content (< 200 words) returning wordCount and minimum 1 minute", () => {
      const text = "The matrix is a system, Neo. That system is our enemy.";
      const result = estimateReadingTimeMinutes(text);
      expect(result.wordCount).toBe(11);
      expect(result.minutes).toBe(1);
    });

    it("accurately calculates reading time at default 200 wpm threshold boundaries", () => {
      const makeWords = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(" ");

      // Exactly 200 words -> 1 minute
      expect(estimateReadingTimeMinutes(makeWords(200))).toEqual({ wordCount: 200, minutes: 1 });

      // 201 words -> ceil(201/200) = 2 minutes
      expect(estimateReadingTimeMinutes(makeWords(201))).toEqual({ wordCount: 201, minutes: 2 });

      // Exactly 400 words -> 2 minutes
      expect(estimateReadingTimeMinutes(makeWords(400))).toEqual({ wordCount: 400, minutes: 2 });

      // 401 words -> ceil(401/200) = 3 minutes
      expect(estimateReadingTimeMinutes(makeWords(401))).toEqual({ wordCount: 401, minutes: 3 });
    });

    it("supports custom wordsPerMinute speeds", () => {
      const makeWords = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(" ");

      // 100 words at 100 wpm -> 1 minute
      expect(estimateReadingTimeMinutes(makeWords(100), 100)).toEqual({ wordCount: 100, minutes: 1 });

      // 150 words at 100 wpm -> ceil(1.5) = 2 minutes
      expect(estimateReadingTimeMinutes(makeWords(150), 100)).toEqual({ wordCount: 150, minutes: 2 });

      // 500 words at 250 wpm -> 2 minutes
      expect(estimateReadingTimeMinutes(makeWords(500), 250)).toEqual({ wordCount: 500, minutes: 2 });
    });

    it("falls back to default 200 wpm when given invalid or non-positive wordsPerMinute", () => {
      const makeWords = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(" ");
      expect(estimateReadingTimeMinutes(makeWords(250), 0)).toEqual({ wordCount: 250, minutes: 2 });
      expect(estimateReadingTimeMinutes(makeWords(250), -50)).toEqual({ wordCount: 250, minutes: 2 });
    });

    it("strips markdown formatting before computing word counts", () => {
      const markdown = "# Section Header\n\nVisit [Matrix](https://matrix.dev) for **great** adventures.";
      // Cleaned text: "Section Header\n\nVisit Matrix for great adventures." -> 7 words
      const result = estimateReadingTimeMinutes(markdown);
      expect(result.wordCount).toBe(7);
      expect(result.minutes).toBe(1);
    });
  });
});
