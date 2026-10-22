/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("toggles maximize reader mode", () => {
    render(<CurriculumViewer docs={mockDocs} />);

    const maxBtn = screen.getByRole("button", { name: /maximize/i });
    fireEvent.click(maxBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(screen.getByRole("button", { name: /chapters/i })).toBeDefined();
  });
});
