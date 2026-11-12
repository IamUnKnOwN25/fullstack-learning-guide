import React from "react";
import { soundEngine } from "./soundEngine";

export interface ExtractedHeading {
  title: string;
  id: string;
  level: number;
}

export interface LinkAttributes {
  href: string;
  target?: string;
  rel?: string;
}

export function slugifyHeading(text?: string | null): string {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function isExternalLink(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return /^(https?:)?\/\//i.test(trimmed) || /^(mailto|tel):/i.test(trimmed);
}

export function getLinkAttributes(url?: string | null): LinkAttributes {
  if (!url || typeof url !== "string") {
    return { href: "#" };
  }
  const cleanUrl = url.trim();
  if (!cleanUrl || /^(javascript|vbscript|data):/i.test(cleanUrl)) {
    return { href: "#" };
  }
  if (cleanUrl.startsWith("#") || !isExternalLink(cleanUrl)) {
    return { href: cleanUrl };
  }
  return {
    href: cleanUrl,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

export function extractHeadings(
  content?: string | null,
  options?: { minLevel?: number; maxLevel?: number }
): ExtractedHeading[] {
  if (!content || typeof content !== "string") {
    return [];
  }

  const minLevel = options?.minLevel ?? 1;
  const maxLevel = options?.maxLevel ?? 6;
  const headings: ExtractedHeading[] = [];
  const lines = content.split("\n");
  let activeFence: "```" | "~~~" | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (activeFence) {
      if (trimmed.startsWith(activeFence)) {
        activeFence = null;
      }
      continue;
    }

    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      activeFence = trimmed.startsWith("~~~") ? "~~~" : "```";
      continue;
    }

    if (activeFence) {
      continue;
    }

    const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      if (level >= minLevel && level <= maxLevel) {
        const rawTitle = match[2].trim();
        headings.push({
          title: rawTitle,
          id: slugifyHeading(rawTitle),
          level,
        });
      }
    }
  }

  return headings;
}

export const extractSectionHeadings = extractHeadings;

export interface ExtractedCodeBlock {
  language: string;
  code: string;
}

export interface ReadingTimeResult {
  wordCount: number;
  minutes: number;
}

export function extractCodeBlocks(
  markdown?: string | null
): Array<{ language: string; code: string }> {
  if (!markdown || typeof markdown !== "string") {
    return [];
  }

  const lines = markdown.split(/\r?\n/);
  const blocks: Array<{ language: string; code: string }> = [];
  let inBlock = false;
  let fenceChar = "";
  let fenceLength = 0;
  let currentLanguage = "text";
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inBlock) {
      const match = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
      if (match) {
        inBlock = true;
        fenceChar = match[1][0];
        fenceLength = match[1].length;
        const info = match[2].trim();
        const langToken = info ? info.split(/\s+/)[0] : "";
        currentLanguage = langToken ? langToken.toLowerCase() : "text";
        currentLines = [];
      }
    } else {
      const closeMatch = trimmed.match(/^(`{3,}|~{3,})$/);
      if (
        closeMatch &&
        closeMatch[1][0] === fenceChar &&
        closeMatch[1].length >= fenceLength
      ) {
        blocks.push({
          language: currentLanguage || "text",
          code: currentLines.join("\n"),
        });
        inBlock = false;
        fenceChar = "";
        fenceLength = 0;
        currentLanguage = "text";
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    }
  }

  return blocks;
}

export function stripMarkdownFormatting(markdown?: string | null): string {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  let result = markdown;

  // 1. Strip fenced code block delimiters (``` or ~~~ lines)
  result = result.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\r?\n?/gm, "");

  // 2. Strip headings (# Heading)
  result = result.replace(/^[ \t]*#{1,6}(?:[ \t]+(.*?)(?:[ \t]+#+)?)?[ \t]*$/gm, "$1");

  // 3. Strip blockquotes (> Quote) and horizontal rules (---, ***, ___)
  result = result.replace(/^[ \t]*>[ \t]?/gm, "");
  result = result.replace(/^[ \t]*([-*_]){3,}[ \t]*$/gm, "");

  // 4. Strip images: ![alt](url) -> alt
  result = result.replace(/!\[([^\]]*)\]\((?:[^()]+|\([^()]*\))+\)/g, "$1");

  // 5. Strip links: [text](url) -> text
  result = result.replace(/\[([^\]]+)\]\((?:[^()]+|\([^()]*\))+\)/g, "$1");

  // 6. Strip inline code: ``code`` or `code` -> code
  result = result.replace(/(?<!`)(`+)(?!`)([\s\S]+?)(?<!`)\1(?!`)/g, "$2");


  // 7. Strip bold & italic markers (***, ___, **, __, *, _, ~~)
  result = result.replace(/\*\*\*([^*\n]+?)\*\*\*/g, "$1");
  result = result.replace(/___([^_\n]+?)___/g, "$1");
  result = result.replace(/\*\*([^*\n]+?)\*\*/g, "$1");
  result = result.replace(/__([^\n]+?)__/g, "$1");
  result = result.replace(/(^|[^\\])\*([^*\s\n][^*\n]*?)\*/g, "$1$2");
  result = result.replace(
    /(?<=\s|^|[([{"'])_(?!\s)(.+?)(?<!\s)_(?=\s|[.,;:!?)}\]']|$)/g,
    "$1"
  );
  result = result.replace(/~~([^~\n]+?)~~/g, "$1");

  return result.trim();
}

export function estimateReadingTimeMinutes(
  markdown?: string | null,
  wordsPerMinute: number = 200
): { wordCount: number; minutes: number } {
  if (!markdown || typeof markdown !== "string") {
    return { wordCount: 0, minutes: 0 };
  }

  const cleanText = stripMarkdownFormatting(markdown).trim();
  if (!cleanText) {
    return { wordCount: 0, minutes: 0 };
  }

  const words = cleanText.split(/\s+/).filter(Boolean).filter((token) => /[\p{L}\p{N}]/u.test(token));
  const wordCount = words.length;
  if (wordCount === 0) {
    return { wordCount: 0, minutes: 0 };
  }

  const effectiveWpm = wordsPerMinute > 0 ? wordsPerMinute : 200;
  const minutes = Math.max(1, Math.ceil(wordCount / effectiveWpm));

  return { wordCount, minutes };
}

export function formatInlineText(
  text?: string | null,
  onSelectDoc?: (filename: string) => void
): React.ReactNode[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const parts: React.ReactNode[] = [];
  const regex =
    /(`[^`]+`|\[[^\]]+\]\((?:[^()]+|\([^()]*\))+\)|~~[^~\n]+?~~|\*\*\*[^*\n]+?\*\*\*|___[^_\n]+?___|\*\*[^*\n]+?\*\*|__[^_\n]+?__|\*[^*\s\n][^*\n]*?\*|(?<=\s|^|[([{"'])_(?!\s)[^_\n]+?(?<!\s)_(?=\s|[.,;:!?)}\]']|$))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token.length}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        React.createElement(
          "code",
          {
            key,
            className:
              "px-1.5 py-0.5 mx-0.5 rounded bg-matrix-dark border border-matrix-border text-matrix-neonCyan font-mono text-[11px]",
          },
          token.slice(1, -1)
        )
      );
    } else if (
      (token.startsWith("***") && token.endsWith("***")) ||
      (token.startsWith("___") && token.endsWith("___"))
    ) {
      parts.push(
        React.createElement(
          "strong",
          { key, className: "text-white font-bold" },
          React.createElement(
            "em",
            { className: "italic text-matrix-neonCyan/90" },
            ...formatInlineText(token.slice(3, -3), onSelectDoc)
          )
        )
      );
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      parts.push(
        React.createElement(
          "strong",
          { key, className: "text-white font-bold" },
          ...formatInlineText(token.slice(2, -2), onSelectDoc)
        )
      );
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      parts.push(
        React.createElement(
          "em",
          { key, className: "italic text-gray-300" },
          ...formatInlineText(token.slice(1, -1), onSelectDoc)
        )
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      parts.push(
        React.createElement(
          "del",
          { key, className: "line-through text-gray-400" },
          ...formatInlineText(token.slice(2, -2), onSelectDoc)
        )
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const closingBracket = token.indexOf("]");
      const linkText = token.slice(1, closingBracket);
      const rawUrl = token.slice(closingBracket + 2, -1);
      const url = rawUrl.trim();

      if (url.endsWith(".md") && onSelectDoc) {
        parts.push(
          React.createElement(
            "button",
            {
              type: "button",
              key,
              onClick: () => {
                soundEngine.playSfx("click");
                onSelectDoc(url);
              },
              className:
                "text-matrix-neonCyan hover:underline hover:text-white font-bold cursor-pointer",
            },
            ...formatInlineText(linkText, onSelectDoc)
          )
        );
      } else {
        const linkAttrs = getLinkAttributes(url);
        parts.push(
          React.createElement(
            "a",
            {
              key,
              href: linkAttrs.href,
              target: linkAttrs.target,
              rel: linkAttrs.rel,
              className: "text-matrix-neonCyan hover:underline hover:text-white",
            },
            ...formatInlineText(linkText, onSelectDoc)
          )
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
