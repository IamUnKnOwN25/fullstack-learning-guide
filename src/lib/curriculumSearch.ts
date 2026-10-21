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
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildSearchIndex(docs: DocFile[]): SearchIndexEntry[] {
  const index: SearchIndexEntry[] = [];

  for (const doc of docs) {
    // Basic markdown heading parser
    const lines = doc.content.split("\n");
    let currentHeadingId = "";
    let currentHeadingTitle = doc.title;
    let currentContent: string[] = [];

    const flushSection = () => {
      const snippet = currentContent.join("\n").trim();
      if (snippet || currentHeadingTitle) {
        index.push({
          filename: doc.filename,
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
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];
  const terms = q.split(/\s+/);

  for (const entry of index) {
    let score = 0;
    const headingLower = entry.headingTitle.toLowerCase();
    const contentLower = entry.contentSnippet.toLowerCase();

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

// In-memory bookmark store for simple requirements (or localStorage if needed)
let bookmarks: Bookmark[] = [];

export function toggleBookmark(bookmark: Omit<Bookmark, "id" | "createdAt">): boolean {
  const id = `${bookmark.filename}#${bookmark.headingId}`;
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
