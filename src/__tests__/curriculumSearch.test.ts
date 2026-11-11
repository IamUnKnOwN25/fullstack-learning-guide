import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildSearchIndex,
  searchCurriculum,
  extractMatchedSnippet,
  highlightMatchedText,
  getChapterSummary,
  toggleBookmark,
  isBookmarked,
  getBookmarks,
  clearBookmarksForTesting,
  serializeBookmarks,
  deserializeBookmarks,
  Bookmark,
  SearchIndexEntry,
} from "../lib/curriculumSearch";
import { DocFile } from "../components/CurriculumViewer";

describe("curriculumSearch", () => {
  const sampleDocs: DocFile[] = [
    {
      filename: "test-01.md",
      title: "Test Guide 01",
      content: `This is introductory text.

# First Main Heading
Some content under the first heading.

## A Subheading
Content related to the subheading.
React is awesome.
`,
    },
    {
      filename: "test-02.md",
      title: "Test Guide 02",
      content: `# React State
This talks about React state and hooks.
React is great for building component state.
`,
    },
    {
      filename: "test-03.md",
      title: "Clean Heading",
      content: `# Hooks
Hooks only.
`,
    },
  ];

  beforeEach(() => {
    clearBookmarksForTesting();
  });

  describe("buildSearchIndex", () => {
    it("should parse documents into chunked index entries by headings", () => {
      const index = buildSearchIndex(sampleDocs);

      expect(index.length).toBeGreaterThan(0);

      // Check first file's parts
      const introEntry = index.find(e => e.filename === "test-01.md" && e.headingTitle === "Test Guide 01");
      expect(introEntry).toBeDefined();
      expect(introEntry?.contentSnippet).toContain("introductory text");

      const firstHeadingEntry = index.find(e => e.headingTitle === "First Main Heading");
      expect(firstHeadingEntry).toBeDefined();
      expect(firstHeadingEntry?.headingId).toBe("first-main-heading");
      expect(firstHeadingEntry?.contentSnippet).toContain("Some content under the first heading");

      const subHeadingEntry = index.find(e => e.headingTitle === "A Subheading");
      expect(subHeadingEntry).toBeDefined();
      expect(subHeadingEntry?.headingId).toBe("a-subheading");
      expect(subHeadingEntry?.contentSnippet).toContain("React is awesome");
    });

    it("handles complex markdown characters, links, and code blocks in headings", () => {
      const complexDoc: DocFile[] = [
        {
          filename: "complex.md",
          title: "Complex Guide",
          content: `### 1. \`useState\` & \`useEffect\` (React Hooks) [Guide]
Detailed description of reactive hooks.
`,
        },
      ];

      const index = buildSearchIndex(complexDoc);
      expect(index.length).toBeGreaterThan(0);

      const sectionEntry = index.find(e => e.headingId.length > 0);
      expect(sectionEntry).toBeDefined();
      expect(sectionEntry?.headingId).toBe("1-usestate-useeffect-react-hooks-guide");
      expect(sectionEntry?.headingTitle).toContain("useState");
      expect(sectionEntry?.contentSnippet).toContain("Detailed description");
    });

    it("safely handles empty documents and empty markdown lines", () => {
      const emptyDoc: DocFile[] = [
        {
          filename: "empty.md",
          title: "Empty Guide",
          content: "\n\n\n",
        },
      ];

      const index = buildSearchIndex(emptyDoc);
      expect(index.length).toBe(1);
      expect(index[0].filename).toBe("empty.md");
      expect(index[0].contentSnippet).toBe("");
    });

    it("ignores '#' characters inside fenced code blocks (backticks and tildes)", () => {
      const codeBlockDocs: DocFile[] = [
        {
          filename: "code-blocks.md",
          title: "Code Blocks Guide",
          content: `# Valid Heading 1
Some introductory text.

\`\`\`python
# This is a python comment
def hello():
    # Another comment inside
    return "matrix"
\`\`\`

## Valid Subheading
Explanation follows.

~~~bash
# Bash comment
export PORT=3000
~~~

### Valid Nested Heading
Final remarks.
`,
        },
      ];

      const index = buildSearchIndex(codeBlockDocs);
      const headingTitles = index.map(entry => entry.headingTitle);

      // Must contain real markdown headings
      expect(headingTitles).toContain("Valid Heading 1");
      expect(headingTitles).toContain("Valid Subheading");
      expect(headingTitles).toContain("Valid Nested Heading");

      // Must NOT index code comments as section headings
      expect(headingTitles).not.toContain("This is a python comment");
      expect(headingTitles).not.toContain("Another comment inside");
      expect(headingTitles).not.toContain("Bash comment");

      // The code block content should remain inside the corresponding section snippet
      const heading1Entry = index.find(e => e.headingTitle === "Valid Heading 1");
      expect(heading1Entry?.contentSnippet).toContain("# This is a python comment");
      expect(heading1Entry?.contentSnippet).toContain("def hello():");

      const subheadingEntry = index.find(e => e.headingTitle === "Valid Subheading");
      expect(subheadingEntry?.contentSnippet).toContain("# Bash comment");
      expect(subheadingEntry?.contentSnippet).toContain("export PORT=3000");
    });

    it("normalizes CRLF line breaks and strips carriage returns from headings, IDs, and snippets", () => {
      const crlfDoc: DocFile[] = [
        {
          filename: "crlf-guide.md\r",
          title: "Windows Doc\r",
          content: "# Windows Architecture\r\nLine 1\r\nLine 2\r\n\r\n## File System Internals\r\nNTFS and FAT32 details.\r\n",
        },
      ];

      const index = buildSearchIndex(crlfDoc);
      expect(index.length).toBeGreaterThanOrEqual(2);

      for (const entry of index) {
        expect(entry.filename).not.toContain("\r");
        expect(entry.headingId).not.toContain("\r");
        expect(entry.headingTitle).not.toContain("\r");
        expect(entry.contentSnippet).not.toContain("\r");
      }

      const winArch = index.find(e => e.headingId === "windows-architecture");
      expect(winArch).toBeDefined();
      expect(winArch?.headingTitle).toBe("Windows Architecture");
      expect(winArch?.contentSnippet).toBe("Line 1\nLine 2");

      const fsEntry = index.find(e => e.headingId === "file-system-internals");
      expect(fsEntry).toBeDefined();
      expect(fsEntry?.headingTitle).toBe("File System Internals");
      expect(fsEntry?.contentSnippet).toBe("NTFS and FAT32 details.");
    });
  });

  describe("searchCurriculum", () => {
    it("should return empty array for empty query", () => {
      const index = buildSearchIndex(sampleDocs);
      expect(searchCurriculum("", index)).toEqual([]);
      expect(searchCurriculum("   ", index)).toEqual([]);
    });

    it("should properly score heading hits higher than content hits", () => {
      const index = buildSearchIndex(sampleDocs);
      const results = searchCurriculum("react", index);

      expect(results.length).toBeGreaterThan(0);

      // "React State" is in heading, should score higher than "A Subheading" which only has "React" in content
      const reactStateResult = results.find(r => r.headingTitle === "React State");
      const subHeadingResult = results.find(r => r.headingTitle === "A Subheading");

      expect(reactStateResult).toBeDefined();
      expect(subHeadingResult).toBeDefined();
      expect(reactStateResult!.score).toBeGreaterThan(subHeadingResult!.score);
    });

    it("awards an exact title match bonus when heading equals query term exactly", () => {
      const index = buildSearchIndex(sampleDocs);
      const results = searchCurriculum("hooks", index);

      const exactHooks = results.find(r => r.headingTitle === "Hooks");
      expect(exactHooks).toBeDefined();
      // "Hooks" heading gets 10 (includes) + 5 (exact) = 15, plus any content hits
      expect(exactHooks!.score).toBeGreaterThanOrEqual(15);
    });

    it("evaluates multi-word queries with score aggregation", () => {
      const index = buildSearchIndex(sampleDocs);
      const singleWordResults = searchCurriculum("react", index);
      const multiWordResults = searchCurriculum("react hooks", index);

      expect(multiWordResults.length).toBeGreaterThan(0);
      const reactStateResult = multiWordResults.find(r => r.headingTitle === "React State");
      expect(reactStateResult).toBeDefined();

      const singleReactState = singleWordResults.find(r => r.headingTitle === "React State");
      expect(reactStateResult!.score).toBeGreaterThan(singleReactState!.score);
    });

    it("performs case-insensitive searches consistently", () => {
      const index = buildSearchIndex(sampleDocs);
      const lower = searchCurriculum("react", index);
      const upper = searchCurriculum("REACT", index);
      const mixed = searchCurriculum("ReAcT", index);

      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
      expect(lower[0].score).toBe(upper[0].score);
    });

    it("safely handles special regex characters in queries without crashing", () => {
      const index = buildSearchIndex(sampleDocs);
      expect(() => searchCurriculum("[.*+?^${}()|[\\]\\]", index)).not.toThrow();
      expect(() => searchCurriculum("(React|State)?", index)).not.toThrow();
    });

    it("breaks ties deterministically by chapter filename and heading title when scores match", () => {
      const tieIndex: SearchIndexEntry[] = [
        { filename: "02-beta.md", headingId: "alpha", headingTitle: "Alpha Section", contentSnippet: "keyword here" },
        { filename: "01-alpha.md", headingId: "beta", headingTitle: "Beta Section", contentSnippet: "keyword here" },
        { filename: "01-alpha.md", headingId: "alpha", headingTitle: "Alpha Section", contentSnippet: "keyword here" },
      ];

      const results = searchCurriculum("keyword", tieIndex);
      expect(results.length).toBe(3);
      expect(results[0].filename).toBe("01-alpha.md");
      expect(results[0].headingTitle).toBe("Alpha Section");
      expect(results[1].filename).toBe("01-alpha.md");
      expect(results[1].headingTitle).toBe("Beta Section");
      expect(results[2].filename).toBe("02-beta.md");
      expect(results[2].headingTitle).toBe("Alpha Section");
    });
  });

  describe("Bookmarks", () => {
    it("should add and remove bookmarks correctly", () => {
      const bookmarkData = {
        filename: "01-html-and-semantics.md",
        headingId: "what-is-html",
        headingTitle: "What is HTML?",
      };

      // Initially not bookmarked
      expect(isBookmarked(bookmarkData.filename, bookmarkData.headingId)).toBe(false);
      expect(getBookmarks().length).toBe(0);

      // Toggle ON
      const isNowBookmarked = toggleBookmark(bookmarkData);
      expect(isNowBookmarked).toBe(true);
      expect(isBookmarked(bookmarkData.filename, bookmarkData.headingId)).toBe(true);
      expect(getBookmarks().length).toBe(1);

      // Toggle OFF
      const isStillBookmarked = toggleBookmark(bookmarkData);
      expect(isStillBookmarked).toBe(false);
      expect(isBookmarked(bookmarkData.filename, bookmarkData.headingId)).toBe(false);
      expect(getBookmarks().length).toBe(0);
    });

    it("should return bookmarks sorted by creation date descending", () => {
      vi.useFakeTimers();
      vi.setSystemTime(1000);

      const b1 = { filename: "f1.md", headingId: "h1", headingTitle: "H1" };
      toggleBookmark(b1);

      vi.advanceTimersByTime(500);
      const b2 = { filename: "f2.md", headingId: "h2", headingTitle: "H2" };
      toggleBookmark(b2);

      const bookmarks = getBookmarks();
      expect(bookmarks.length).toBe(2);
      expect(bookmarks[0].id).toBe("f2.md#h2");
      expect(bookmarks[1].id).toBe("f1.md#h1");

      vi.useRealTimers();
    });

    it("handles nullish bookmark input safely without crashing", () => {
      expect(toggleBookmark(null as any)).toBe(false);
      expect(toggleBookmark({ filename: "" } as any)).toBe(false);
    });
  });

  describe("Bookmark Serialization", () => {
    it("serializes and deserializes bookmarks with round-trip fidelity", () => {
      const mockBookmarks: Bookmark[] = [
        {
          id: "intro.md#overview",
          filename: "intro.md",
          headingId: "overview",
          headingTitle: "Overview Guide",
          createdAt: 1700000000000,
        },
        {
          id: "react.md#state-hooks",
          filename: "react.md",
          headingId: "state-hooks",
          headingTitle: "State & Hooks",
          createdAt: 1700000010000,
        },
      ];

      const serialized = serializeBookmarks(mockBookmarks);
      expect(typeof serialized).toBe("string");

      const restored = deserializeBookmarks(serialized);
      expect(restored).toEqual(mockBookmarks);
    });

    it("serializes in-memory store when no argument is provided to serializeBookmarks", () => {
      toggleBookmark({
        filename: "vue.md",
        headingId: "reactivity",
        headingTitle: "Reactivity",
      });

      const serialized = serializeBookmarks();
      const restored = deserializeBookmarks(serialized);

      expect(restored.length).toBe(1);
      expect(restored[0].filename).toBe("vue.md");
      expect(restored[0].headingId).toBe("reactivity");
      expect(restored[0].headingTitle).toBe("Reactivity");
    });

    it("synchronizes restored bookmarks into in-memory store when syncToStore is true", () => {
      const externalJson = JSON.stringify([
        {
          id: "db.md#sql-indexes",
          filename: "db.md",
          headingId: "sql-indexes",
          headingTitle: "SQL Indexes",
          createdAt: 1700000050000,
        },
      ]);

      expect(getBookmarks().length).toBe(0);
      const restored = deserializeBookmarks(externalJson, true);

      expect(restored.length).toBe(1);
      expect(getBookmarks().length).toBe(1);
      expect(isBookmarked("db.md", "sql-indexes")).toBe(true);
    });

    it("handles invalid, corrupted, or non-array inputs to serialize and deserialize safely", () => {
      expect(serializeBookmarks(null as any)).toBe("[]");
      expect(serializeBookmarks("not-an-array" as any)).toBe("[]");

      expect(deserializeBookmarks("")).toEqual([]);
      expect(deserializeBookmarks("   ")).toEqual([]);
      expect(deserializeBookmarks(null as any)).toEqual([]);
      expect(deserializeBookmarks(undefined as any)).toEqual([]);
      expect(deserializeBookmarks("invalid json {")).toEqual([]);
      expect(deserializeBookmarks("null")).toEqual([]);
      expect(deserializeBookmarks("12345")).toEqual([]);
      expect(deserializeBookmarks('"a string"')).toEqual([]);
      expect(deserializeBookmarks("{}")).toEqual([]);
      expect(deserializeBookmarks("[1, 2, 3]")).toEqual([]);
      expect(deserializeBookmarks('[{"headingId": "orphan-heading"}]')).toEqual([]);
    });

    it("supplies missing id and createdAt defaults for partially structured bookmarks", () => {
      const partialJson = JSON.stringify([
        {
          filename: "partial.md",
          headingId: "section-a",
          headingTitle: "Section A",
        },
      ]);

      const restored = deserializeBookmarks(partialJson);
      expect(restored.length).toBe(1);
      expect(restored[0].id).toBe("partial.md#section-a");
      expect(restored[0].filename).toBe("partial.md");
      expect(typeof restored[0].createdAt).toBe("number");
      expect(restored[0].createdAt).toBeGreaterThan(0);
    });
  });

  describe("extractMatchedSnippet", () => {
    const text = "Full-stack web development requires understanding client-server architecture, database indexing, and browser rendering.";

    it("extracts a snippet centered around the matched term with ellipses", () => {
      const snippet = extractMatchedSnippet(text, "indexing", 50);
      expect(snippet).toContain("indexing");
      expect(snippet.startsWith("...")).toBe(true);
      expect(snippet.endsWith("...")).toBe(true);
    });

    it("returns beginning of content if matched at the start", () => {
      const snippet = extractMatchedSnippet(text, "Full-stack", 40);
      expect(snippet.startsWith("Full-stack")).toBe(true);
    });

    it("handles empty content or missing term gracefully", () => {
      expect(extractMatchedSnippet("", "term")).toBe("");
      expect(extractMatchedSnippet(text, "")).toBe(text.slice(0, 100).trim() + "...");
    });

    it("safely handles non-positive or zero maxLength by returning empty string", () => {
      expect(extractMatchedSnippet(text, "indexing", 0)).toBe("");
      expect(extractMatchedSnippet(text, "indexing", -1)).toBe("");
      expect(extractMatchedSnippet(text, "indexing", -50)).toBe("");
      expect(extractMatchedSnippet(text, "indexing", NaN)).toBe("");
      expect(extractMatchedSnippet(text, "", 0)).toBe("");
      expect(extractMatchedSnippet(text, "", -10)).toBe("");
      expect(extractMatchedSnippet(text, "not-found", 0)).toBe("");
      expect(extractMatchedSnippet(text, "not-found", -5)).toBe("");
    });

    it("guarantees matched term is included in snippet when maxLength is small", () => {
      const longText = "Prefix introductory words that extend for quite a while before reaching the secret word located here and continuing.";
      // Term at index 76 in 117-char string. When maxLength is 15, blind (idx - 30) would set start=46, end=61, completely missing index 76!
      const snippet15 = extractMatchedSnippet(longText, "secret", 15);
      expect(snippet15).toContain("secret");

      // Exactly equal to term length
      const snippetExact = extractMatchedSnippet(longText, "secret", 6);
      expect(snippetExact).toContain("secret");

      // Smaller than term length: start is clamped to idx, match begins inside returned window
      const snippetSmall = extractMatchedSnippet(longText, "secret", 4);
      expect(snippetSmall).toContain("secr");

      // Match near start with small window
      const startMatch = extractMatchedSnippet(longText, "Prefix", 10);
      expect(startMatch).toContain("Prefix");

      // Match near end with small window
      const endMatch = extractMatchedSnippet(longText, "continuing", 12);
      expect(endMatch).toContain("continuing");
    });
  });

  describe("highlightMatchedText", () => {
    it("returns unmodified text with matched=false when query is empty, whitespace, or missing", () => {
      expect(highlightMatchedText("Hello World", "")).toEqual([
        { text: "Hello World", matched: false },
      ]);
      expect(highlightMatchedText("Hello World", "   ")).toEqual([
        { text: "Hello World", matched: false },
      ]);
      expect(highlightMatchedText("Hello World", null as any)).toEqual([
        { text: "Hello World", matched: false },
      ]);
      expect(highlightMatchedText("", "react")).toEqual([
        { text: "", matched: false },
      ]);
      expect(highlightMatchedText(null as any, "react")).toEqual([
        { text: "", matched: false },
      ]);
    });

    it("returns unmatched segment when query is not found in text", () => {
      expect(highlightMatchedText("Quick brown fox", "matrix")).toEqual([
        { text: "Quick brown fox", matched: false },
      ]);
    });

    it("splits text case-insensitively and preserves original text casing", () => {
      const text = "React is awesome. Use REACT for modern web apps with react.";
      const segments = highlightMatchedText(text, "react");

      expect(segments).toEqual([
        { text: "React", matched: true },
        { text: " is awesome. Use ", matched: false },
        { text: "REACT", matched: true },
        { text: " for modern web apps with ", matched: false },
        { text: "react", matched: true },
        { text: ".", matched: false },
      ]);
    });

    it("safely escapes regex metacharacters in query string", () => {
      const text = "Learning C++ and [React] Hooks with $100 budget? Yes.*";

      // C++ (plus signs)
      const cplus = highlightMatchedText(text, "C++");
      expect(cplus).toEqual([
        { text: "Learning ", matched: false },
        { text: "C++", matched: true },
        { text: " and [React] Hooks with $100 budget? Yes.*", matched: false },
      ]);

      // [React] (brackets)
      const brackets = highlightMatchedText(text, "[React]");
      expect(brackets).toEqual([
        { text: "Learning C++ and ", matched: false },
        { text: "[React]", matched: true },
        { text: " Hooks with $100 budget? Yes.*", matched: false },
      ]);

      // $100 (dollar sign)
      const dollar = highlightMatchedText(text, "$100");
      expect(dollar).toEqual([
        { text: "Learning C++ and [React] Hooks with ", matched: false },
        { text: "$100", matched: true },
        { text: " budget? Yes.*", matched: false },
      ]);

      // ? (question mark)
      const question = highlightMatchedText(text, "?");
      expect(question).toEqual([
        { text: "Learning C++ and [React] Hooks with $100 budget", matched: false },
        { text: "?", matched: true },
        { text: " Yes.*", matched: false },
      ]);

      // .* (dot and star)
      const dotStar = highlightMatchedText(text, ".*");
      expect(dotStar).toEqual([
        { text: "Learning C++ and [React] Hooks with $100 budget? Yes", matched: false },
        { text: ".*", matched: true },
      ]);

      // Nested parens / alternation
      const parensText = "Check (A|B) conditions.";
      const parens = highlightMatchedText(parensText, "(A|B)");
      expect(parens).toEqual([
        { text: "Check ", matched: false },
        { text: "(A|B)", matched: true },
        { text: " conditions.", matched: false },
      ]);
    });

    it("handles exact whole string matches and matches at boundaries", () => {
      expect(highlightMatchedText("exact", "exact")).toEqual([
        { text: "exact", matched: true },
      ]);
      expect(highlightMatchedText("START rest of text", "start")).toEqual([
        { text: "START", matched: true },
        { text: " rest of text", matched: false },
      ]);
      expect(highlightMatchedText("rest of text END", "end")).toEqual([
        { text: "rest of text ", matched: false },
        { text: "END", matched: true },
      ]);
    });
  });

  describe("getChapterSummary", () => {
    it("returns zero counts and zero reading time for empty or whitespace content", () => {
      expect(getChapterSummary("")).toEqual({
        wordCount: 0,
        headingCount: 0,
        estimatedReadingMinutes: 0,
      });
      expect(getChapterSummary("   \n\r\n  ")).toEqual({
        wordCount: 0,
        headingCount: 0,
        estimatedReadingMinutes: 0,
      });
      expect(getChapterSummary(null as any)).toEqual({
        wordCount: 0,
        headingCount: 0,
        estimatedReadingMinutes: 0,
      });
      expect(getChapterSummary(undefined as any)).toEqual({
        wordCount: 0,
        headingCount: 0,
        estimatedReadingMinutes: 0,
      });
    });

    it("correctly counts headings and words in markdown with CRLF normalisation", () => {
      const markdown = `# Introduction to React\r\n\r\nReact is a declarative JavaScript library for user interfaces.\r\n\r\n## Components and Props\r\n\r\nComponents let you split the UI into independent pieces.\r\n`;

      const summary = getChapterSummary(markdown);
      // Headings: 2 ("# Introduction to React", "## Components and Props")
      expect(summary.headingCount).toBe(2);
      // Heading 1: "Introduction to React" (3 words)
      // Line 1: "React is a declarative JavaScript library for user interfaces." (9 words)
      // Heading 2: "Components and Props" (3 words)
      // Line 2: "Components let you split the UI into independent pieces." (9 words)
      // Total words: 3 + 9 + 3 + 9 = 24 words
      expect(summary.wordCount).toBe(24);
      // Math.max(1, Math.ceil(24 / 200)) = 1
      expect(summary.estimatedReadingMinutes).toBe(1);
    });

    it("ignores words and '#' comments inside fenced code blocks (backticks and tildes)", () => {
      const markdownWithCode = `# Python Guide\nIntroductory text with four words.\n\n\`\`\`python\n# This is a comment\nprint("Hello world from inside code block")\n\`\`\`\n\n## Shell Setup\n\n~~~bash\n# Another comment\nexport NODE_ENV=production\n~~~\n\nFinal concluding sentence here.\n`;

      const summary = getChapterSummary(markdownWithCode);
      // Headings outside code blocks: "# Python Guide", "## Shell Setup" = 2
      expect(summary.headingCount).toBe(2);

      // Outside code block words:
      // "Python Guide" (2)
      // "Introductory text with four words." (5)
      // "Shell Setup" (2)
      // "Final concluding sentence here." (4)
      // Total words: 2 + 5 + 2 + 4 = 13 words
      expect(summary.wordCount).toBe(13);
      expect(summary.estimatedReadingMinutes).toBe(1);
    });

    it("calculates reading minutes based on word count thresholds (200 words per minute)", () => {
      // 200 words -> 1 minute
      const twoHundredWords = Array(200).fill("matrix").join(" ");
      expect(getChapterSummary(twoHundredWords).estimatedReadingMinutes).toBe(1);

      // 201 words -> 2 minutes
      const twoHundredOneWords = Array(201).fill("matrix").join(" ");
      expect(getChapterSummary(twoHundredOneWords).estimatedReadingMinutes).toBe(2);

      // 400 words -> 2 minutes
      const fourHundredWords = Array(400).fill("matrix").join(" ");
      expect(getChapterSummary(fourHundredWords).estimatedReadingMinutes).toBe(2);

      // 401 words -> 3 minutes
      const fourHundredOneWords = Array(401).fill("matrix").join(" ");
      expect(getChapterSummary(fourHundredOneWords).estimatedReadingMinutes).toBe(3);

      // Code block only -> 0 reading minutes
      const codeOnly = "```ts\nconst x = 1;\n```";
      expect(getChapterSummary(codeOnly).estimatedReadingMinutes).toBe(0);
      expect(getChapterSummary(codeOnly).wordCount).toBe(0);
    });
  });

  describe("Defensive Guard Tests", () => {
    it("handles non-array and nullish inputs to buildSearchIndex and searchCurriculum", () => {
      expect(buildSearchIndex(null as any)).toEqual([]);
      expect(buildSearchIndex([null as any])).toEqual([]);
      expect(searchCurriculum(null as any, [])).toEqual([]);
      expect(searchCurriculum("react", null as any)).toEqual([]);
      expect(searchCurriculum("   ", [])).toEqual([]);
      expect(searchCurriculum(undefined as any, [])).toEqual([]);
      expect(searchCurriculum(12345 as any, [])).toEqual([]);
      expect(searchCurriculum({} as any, [])).toEqual([]);
      expect(searchCurriculum(true as any, [])).toEqual([]);
      expect(searchCurriculum(Symbol("q") as any, [])).toEqual([]);
    });
  });
});
