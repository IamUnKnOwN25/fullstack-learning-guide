import { DocFile } from "../components/CurriculumViewer";

export interface SearchIndexEntry {
  filename: string;
  headingId: string;
  headingTitle: string;
  contentSnippet: string;
}

export interface SearchResult extends SearchIndexEntry {
  score: number;
}

export interface Bookmark {
  id: string; // e.g. "filename#headingId"
  filename: string;
  headingId: string;
  headingTitle: string;
  createdAt: number;
}

function slugifyHeading(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildSearchIndex(docs: DocFile[]): SearchIndexEntry[] {
  if (!Array.isArray(docs)) return [];
  const index: SearchIndexEntry[] = [];

  for (const doc of docs) {
    if (!doc || typeof doc.content !== "string") continue;
    // Basic markdown heading parser
    const lines = doc.content.split("\n");
    let currentHeadingId = "";
    let currentHeadingTitle = doc.title || "";
    let currentContent: string[] = [];

    const flushSection = () => {
      const snippet = currentContent.join("\n").trim();
      if (snippet || currentHeadingTitle) {
        index.push({
          filename: doc.filename || "",
          headingId: currentHeadingId,
          headingTitle: currentHeadingTitle,
          contentSnippet: snippet,
        });
      }
    };

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushSection();
        currentHeadingTitle = headingMatch[2].replace(/[`*_~]/g, ""); // clean basic markdown inline
        currentHeadingId = slugifyHeading(headingMatch[2]);
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    flushSection();
  }

  return index;
}

export function searchCurriculum(query: string, index: SearchIndexEntry[]): SearchResult[] {
  if (typeof query !== "string" || !Array.isArray(index)) return [];
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  for (const entry of index) {
    if (!entry) continue;
    let score = 0;
    const headingLower = (entry.headingTitle || "").toLowerCase();
    const contentLower = (entry.contentSnippet || "").toLowerCase();

    for (const term of terms) {
      if (headingLower.includes(term)) {
        score += 10;
        if (headingLower === term) score += 5; // Exact word match bonus
      }
      if (contentLower.includes(term)) {
        score += 1;
        // Count occurrences
        const occurrences = contentLower.split(term).length - 1;
        score += occurrences * 0.1;
      }
    }

    if (score > 0) {
      results.push({ ...entry, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Safely extracts a preview snippet surrounding the matched term with an ellipsis.
 */
export function extractMatchedSnippet(
  content: string,
  matchedTerm: string,
  maxLength: number = 100
): string {
  if (!content) return "";
  if (!matchedTerm || !matchedTerm.trim()) {
    return content.length > maxLength ? content.slice(0, maxLength).trim() + "..." : content.trim();
  }
  const termLower = matchedTerm.toLowerCase().trim();
  const contentLower = content.toLowerCase();
  const idx = contentLower.indexOf(termLower);
  if (idx === -1) {
    return content.length > maxLength ? content.slice(0, maxLength).trim() + "..." : content.trim();
  }
  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, start + maxLength);
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

// In-memory bookmark store for simple requirements (or localStorage if needed)
let bookmarks: Bookmark[] = [];

export function toggleBookmark(bookmark: Omit<Bookmark, "id" | "createdAt">): boolean {
  if (!bookmark || !bookmark.filename) return false;
  const id = `${bookmark.filename}#${bookmark.headingId || ""}`;
  const existingIdx = bookmarks.findIndex((b) => b.id === id);

  if (existingIdx !== -1) {
    bookmarks.splice(existingIdx, 1);
    return false; // unbookmarked
  } else {
    bookmarks.push({
      ...bookmark,
      id,
      createdAt: Date.now(),
    });
    return true; // bookmarked
  }
}

export function isBookmarked(filename: string, headingId: string): boolean {
  const id = `${filename}#${headingId}`;
  return bookmarks.some((b) => b.id === id);
}

export function getBookmarks(): Bookmark[] {
  return [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);
}

export function clearBookmarksForTesting(): void {
  bookmarks = [];
}
