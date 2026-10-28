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
  if (/^(javascript|vbscript|data):/i.test(cleanUrl)) {
    return { href: "#" };
  }
  if (cleanUrl.startsWith("#")) {
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
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
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

export function formatInlineText(
  text?: string | null,
  onSelectDoc?: (filename: string) => void
): React.ReactNode[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const parts: React.ReactNode[] = [];
  const regex =
    /(`[^`]+`|\[[^\]]+\]\([^)]+\)|~~[^~\n]+?~~|\*\*\*[^*\n]+?\*\*\*|___[^_\n]+?___|\*\*[^*\n]+?\*\*|__[^_\n]+?__|\*[^*\s\n][^*\n]*?\*|(?<=\s|^|[([{"'])_(?!\s)[^_\n]+?(?<!\s)_(?=\s|[.,;:!?)}\]']|$))/g;
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
