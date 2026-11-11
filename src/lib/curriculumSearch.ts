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

export interface ChapterSummary {
  wordCount: number;
  headingCount: number;
  estimatedReadingMinutes: number;
}

export interface HighlightSegment {
  text: string;
  matched: boolean;
}

function slugifyHeading(text: string): string {
  if (!text) return "";
  return text.replace(/\r/g, "")
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
    const lines = doc.content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    let currentHeadingId = "";
    let currentHeadingTitle = (doc.title || "").replace(/\r/g, "").trim();
    let currentContent: string[] = [];
    let inCodeBlock = false;

    const flushSection = () => {
      const snippet = currentContent.join("\n").trim();
      if (snippet || currentHeadingTitle) {
        index.push({
          filename: (doc.filename || "").replace(/\r/g, ""),
          headingId: currentHeadingId.replace(/\r/g, ""),
          headingTitle: currentHeadingTitle.replace(/\r/g, "").trim(),
          contentSnippet: snippet,
        });
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
        inCodeBlock = !inCodeBlock;
        currentContent.push(line);
        continue;
      }

      if (!inCodeBlock) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          flushSection();
          const cleanHeading = headingMatch[2].replace(/\r/g, "").trim();
          currentHeadingTitle = cleanHeading.replace(/[`*_~]/g, "");
          currentHeadingId = slugifyHeading(cleanHeading);
          currentContent = [];
          continue;
        }
      }

      currentContent.push(line);
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

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const fileComp = (a.filename || "").localeCompare(b.filename || "");
    if (fileComp !== 0) return fileComp;
    const titleComp = (a.headingTitle || "").localeCompare(b.headingTitle || "");
    if (titleComp !== 0) return titleComp;
    return (a.headingId || "").localeCompare(b.headingId || "");
  });
}

/**
 * Safely extracts a preview snippet surrounding the matched term with an ellipsis.
 */
export function extractMatchedSnippet(
  content: string,
  matchedTerm: string,
  maxLength: number = 100
): string {
  if (!content || typeof maxLength !== "number" || maxLength <= 0 || Number.isNaN(maxLength)) {
    return "";
  }
  if (!matchedTerm || !matchedTerm.trim()) {
    return content.length > maxLength ? content.slice(0, maxLength).trim() + "..." : content.trim();
  }
  const termLower = matchedTerm.toLowerCase().trim();
  const contentLower = content.toLowerCase();
  const idx = contentLower.indexOf(termLower);
  if (idx === -1) {
    return content.length > maxLength ? content.slice(0, maxLength).trim() + "..." : content.trim();
  }
  const leadContext = Math.max(0, Math.min(30, Math.floor((maxLength - termLower.length) / 2)));
  let start = Math.max(0, idx - leadContext);
  if (start > idx) {
    start = idx;
  }
  const end = Math.min(content.length, start + maxLength);
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

/**
 * Splits text into segments indicating whether each part matched the query.
 * Safely escapes regex characters in query and preserves original text casing.
 */
export function highlightMatchedText(
  text: string,
  query: string
): Array<{ text: string; matched: boolean }> {
  const safeText = String(text || "");
  if (!safeText || typeof query !== "string" || !query.trim()) {
    return [{ text: safeText, matched: false }];
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = safeText.split(regex);

  const hasMatch = parts.some(
    (part) => part.toLowerCase() === trimmed.toLowerCase()
  );

  if (!hasMatch) {
    return [{ text: safeText, matched: false }];
  }

  const result: Array<{ text: string; matched: boolean }> = [];
  for (const part of parts) {
    if (!part) continue;
    result.push({
      text: part,
      matched: part.toLowerCase() === trimmed.toLowerCase(),
    });
  }

  return result.length > 0 ? result : [{ text: safeText, matched: false }];
}

/**
 * Computes chapter statistics including word count, heading count, and estimated reading minutes.
 * Normalizes CRLF and excludes content inside fenced code blocks.
 */
export function getChapterSummary(content: string): {
  wordCount: number;
  headingCount: number;
  estimatedReadingMinutes: number;
} {
  if (typeof content !== "string" || !content.trim()) {
    return {
      wordCount: 0,
      headingCount: 0,
      estimatedReadingMinutes: 0,
    };
  }

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  let inCodeBlock = false;
  let headingCount = 0;
  let wordCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock || !trimmed) {
      continue;
    }

    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      headingCount++;
      const headingWords = headingMatch[1].trim().split(/\s+/).filter(Boolean);
      wordCount += headingWords.length;
    } else {
      const words = trimmed.split(/\s+/).filter(Boolean);
      wordCount += words.length;
    }
  }

  const estimatedReadingMinutes =
    wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 200));

  return {
    wordCount,
    headingCount,
    estimatedReadingMinutes,
  };
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

/**
 * Serializes bookmarks into a JSON string for persistence.
 * If no list is passed, serializes current in-memory bookmarks.
 */
export function serializeBookmarks(customBookmarks?: Bookmark[]): string {
  if (customBookmarks === undefined) {
    return JSON.stringify(getBookmarks());
  }
  if (!Array.isArray(customBookmarks)) {
    return "[]";
  }
  return JSON.stringify(customBookmarks);
}

/**
 * Deserializes bookmarks from a JSON string.
 * Returns an array of valid Bookmark objects.
 * Optionally synchronizes the restored bookmarks into the in-memory store.
 */
export function deserializeBookmarks(raw: string, syncToStore: boolean = false): Bookmark[] {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const results: Bookmark[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        typeof item.filename === "string" &&
        item.filename.trim().length > 0
      ) {
        const headingId = typeof item.headingId === "string" ? item.headingId : "";
        const headingTitle = typeof item.headingTitle === "string" ? item.headingTitle : "";
        const id =
          typeof item.id === "string" && item.id.length > 0
            ? item.id
            : `${item.filename}#${headingId}`;
        const createdAt =
          typeof item.createdAt === "number" && Number.isFinite(item.createdAt)
            ? item.createdAt
            : Date.now();

        results.push({
          id,
          filename: item.filename,
          headingId,
          headingTitle,
          createdAt,
        });
      }
    }
    if (syncToStore) {
      bookmarks = [...results];
    }
    return results;
  } catch {
    return [];
  }
}
