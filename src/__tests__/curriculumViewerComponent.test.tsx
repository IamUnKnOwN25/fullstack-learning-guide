/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CurriculumViewer, DocFile } from "../components/CurriculumViewer";
import { useGameStore } from "../lib/gameStore";
import { useAuthStore } from "../lib/authStore";
import { soundEngine } from "../lib/soundEngine";

const mockDocs: DocFile[] = [
  {
    filename: "01-html-and-semantics.md",
    title: "01. HTML5 & Web Semantics",
    content: `# HTML5 & Web Semantics
Welcome to HTML fundamentals.

## Core Landmarks
Here are semantic tags:
- Header
- Main
- Footer

\`\`\`html
<main>
  <h1>Semantic Page</h1>
</main>
\`\`\`

## Interactive Tasks
- [ ] Implement semantic article structure
- [x] Configure responsive viewport meta tag
`,
  },
  {
    filename: "02-css-layout-and-styling.md",
    title: "02. CSS & Layout Systems",
    content: `# CSS Layout Systems
CSS Grid and Flexbox mechanics.

## Flexbox Layouts
Flex layout description.
`,
  },
];

describe("CurriculumViewer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});

    useGameStore.setState({
      completedCurriculumTasks: [],
      completedChapters: [],
      xp: 0,
    });

    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: {
        id: "cadet-1",
        username: "matrix_cadet",
        displayName: "Matrix Cadet",
        avatarId: "cyber-ninja",
        customBio: "Operator.",
        title: "Matrix Infiltrator",
        joinedAt: new Date().toISOString(),
        isGuest: false,
        showcaseBadgeId: "first_quest",
      },
    });

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders classified gate when user is not authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: false,
      currentUser: undefined,
    });

    render(<CurriculumViewer docs={mockDocs} />);

    expect(
      screen.getByText("Classified Curriculum Knowledge Vault")
    ).toBeDefined();
    expect(screen.getAllByText("Sign In to Unlock Vault").length).toBeGreaterThan(0);

    // Clicking Sign In button opens the AuthModal
    const signInBtn = screen.getAllByRole("button", {
      name: /sign in to unlock vault/i,
    })[0];
    fireEvent.click(signInBtn);

    expect(screen.getByText("Matrix Terminal Access")).toBeDefined();
  });

  it("renders document content, headings, and table of contents jump bar when authenticated", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    expect(screen.getByRole("heading", { name: "HTML5 & Web Semantics", level: 1 })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Core Landmarks", level: 2 })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Interactive Tasks", level: 2 })).toBeDefined();

    // Table of contents jump links
    expect(screen.getByRole("link", { name: "Core Landmarks" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Interactive Tasks" })).toBeDefined();
  });

  it("filters topics in the sidebar", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const filterInput = screen.getByRole("textbox", { name: /filter topics/i });
    fireEvent.change(filterInput, { target: { value: "CSS" } });

    expect(
      screen.getByRole("button", { name: "02. CSS & Layout Systems" })
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: "01. HTML5 & Web Semantics" })
    ).toBeNull();
  });

  it("switches active document when clicking another chapter in sidebar", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const cssChapterBtn = screen.getByRole("button", { name: "02. CSS & Layout Systems" });
    fireEvent.click(cssChapterBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByRole("heading", { name: "CSS Layout Systems", level: 1 })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Flexbox Layouts", level: 2 })).toBeDefined();
  });

  it("handles toggling interactive task checkboxes", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const checkbox = screen.getByRole("checkbox", {
      name: /implement semantic article structure/i,
    });
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(checkbox);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(useGameStore.getState().completedCurriculumTasks.length).toBe(1);
  });

  it("handles completing a chapter", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const completeBtn = screen.getByRole("button", {
      name: /complete chapter \(\+50 xp\)/i,
    });
    fireEvent.click(completeBtn);

    expect(useGameStore.getState().completedChapters).toContain(
      "01-html-and-semantics.md"
    );
    expect(screen.getByText("Chapter Mastered ✓")).toBeDefined();
  });

  it("copies code snippet to clipboard with visual feedback", async () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    expect(copyBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("<main>")
    );
    expect(screen.getByText("Copied")).toBeDefined();
  });

  it("toggles maximize reader mode", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const maxBtn = screen.getByRole("button", { name: /maximize/i });
    fireEvent.click(maxBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByRole("button", { name: /chapters/i })).toBeDefined();
  });

  it("marks the active chapter button with aria-current='page' and updates on selection", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const htmlChapterBtn = screen.getByRole("button", { name: "01. HTML5 & Web Semantics" });
    const cssChapterBtn = screen.getByRole("button", { name: "02. CSS & Layout Systems" });

    // Initial selected file is the first doc
    expect(htmlChapterBtn.getAttribute("aria-current")).toBe("page");
    expect(cssChapterBtn.getAttribute("aria-current")).toBeNull();

    // Select the second chapter
    fireEvent.click(cssChapterBtn);

    expect(cssChapterBtn.getAttribute("aria-current")).toBe("page");
    expect(htmlChapterBtn.getAttribute("aria-current")).toBeNull();
  });

  it("displays empty state feedback when search query has no matching documents", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const filterInput = screen.getByRole("textbox", { name: /filter topics/i });
    fireEvent.change(filterInput, { target: { value: "nonexistent_query_xyz" } });

    expect(screen.getByText("No matching documents")).toBeDefined();
    expect(screen.getByText(/no topics match/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: "01. HTML5 & Web Semantics" })).toBeNull();
    expect(screen.queryByRole("button", { name: "02. CSS & Layout Systems" })).toBeNull();
  });

  it("renders clear button when search is non-empty, clears search query, and restores document list on click", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const filterInput = screen.getByRole("textbox", { name: /filter topics/i });
    // Initially, clear button is not present
    expect(screen.queryByRole("button", { name: /clear search/i })).toBeNull();

    // Type search query
    fireEvent.change(filterInput, { target: { value: "CSS" } });

    // Filtered list only has CSS doc
    expect(screen.getByRole("button", { name: "02. CSS & Layout Systems" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "01. HTML5 & Web Semantics" })).toBeNull();

    // Clear button is now visible
    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    expect(clearBtn).toBeDefined();

    // Click clear button
    fireEvent.click(clearBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect((filterInput as HTMLInputElement).value).toBe("");

    // Both documents are restored
    expect(screen.getByRole("button", { name: "01. HTML5 & Web Semantics" })).toBeDefined();
    expect(screen.getByRole("button", { name: "02. CSS & Layout Systems" })).toBeDefined();

    // Clear button is gone
    expect(screen.queryByRole("button", { name: /clear search/i })).toBeNull();
  });
});
