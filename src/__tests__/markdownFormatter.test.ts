import { describe, it, expect, vi } from "vitest";
import React from "react";
import { formatInlineText, slugifyHeading } from "../lib/markdownFormatter";
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
  });

  describe("formatInlineText", () => {
    it("returns plain text as is", () => {
      const nodes = formatInlineText("Just plain text");
      expect(nodes).toEqual(["Just plain text"]);
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
        (n): n is React.ReactElement<{ href?: string; target?: string }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("guide.md");
      expect(aNode?.props.target).toBe("_blank");
    });

    it("formats hash links properly", () => {
      const input = "Jump to [section 1](#section-1)";
      const nodes = formatInlineText(input);

      const aNode = nodes.find(
        (n): n is React.ReactElement<{ href?: string; children?: React.ReactNode }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("#section-1");
      expect(aNode?.props.children).toEqual("section 1");
    });

    it("formats external links properly", () => {
      const input = "Visit [Google](https://google.com)";
      const nodes = formatInlineText(input);

      const aNode = nodes.find(
        (n): n is React.ReactElement<{ href?: string; target?: string; rel?: string }> => React.isValidElement(n) && n.type === "a"
      );
      expect(aNode).toBeDefined();
      expect(aNode?.props.href).toBe("https://google.com");
      expect(aNode?.props.target).toBe("_blank");
      expect(aNode?.props.rel).toBe("noopener noreferrer");
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
  });
});
