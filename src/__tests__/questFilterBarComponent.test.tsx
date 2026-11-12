/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestFilterBar, formatActiveFiltersSummary } from "../components/QuestFilterBar";
import { REALMS } from "../data/realms";
import { soundEngine } from "../lib/soundEngine";

describe("QuestFilterBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(soundEngine, "playSfx").mockImplementation(() => {});
  });

  it("renders search input, realm selector, and difficulty selector with correct attributes", () => {
    const setSearchQuery = vi.fn();
    const setSelectedRealm = vi.fn();
    const setDifficulty = vi.fn();

    render(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={setSearchQuery}
        selectedRealm="All"
        setSelectedRealm={setSelectedRealm}
        difficulty="All"
        setDifficulty={setDifficulty}
      />
    );

    const searchInput = screen.getByRole("textbox", {
      name: /search quests by title, concept, or code/i,
    });
    expect(searchInput).toBeDefined();
    expect(searchInput.getAttribute("placeholder")).toBe(
      "Search quests by title, concept, or code..."
    );

    const realmSelect = screen.getByRole("combobox", {
      name: /filter quests by realm/i,
    });
    expect(realmSelect).toBeDefined();
    expect((realmSelect as HTMLSelectElement).value).toBe("All");

    const diffSelect = screen.getByRole("combobox", {
      name: /filter quests by difficulty/i,
    });
    expect(diffSelect).toBeDefined();
    expect((diffSelect as HTMLSelectElement).value).toBe("All");

    // No active filters, so reset button should not be rendered
    expect(screen.queryByRole("button", { name: /reset all filters/i })).toBeNull();
  });

  it("updates search query when user types and clears with inline clear button", () => {
    const setSearchQuery = vi.fn();
    const setSelectedRealm = vi.fn();
    const setDifficulty = vi.fn();

    render(
      <QuestFilterBar
        searchQuery="initial"
        setSearchQuery={setSearchQuery}
        selectedRealm="All"
        setSelectedRealm={setSelectedRealm}
        difficulty="All"
        setDifficulty={setDifficulty}
      />
    );

    const searchInput = screen.getByRole("textbox", {
      name: /search quests by title, concept, or code/i,
    });
    expect((searchInput as HTMLInputElement).value).toBe("initial");

    fireEvent.change(searchInput, { target: { value: "flexbox" } });
    expect(setSearchQuery).toHaveBeenCalledWith("flexbox");

    // Clear search button
    const clearBtn = screen.getByRole("button", { name: /clear search text/i });
    expect(clearBtn).toBeDefined();
    fireEvent.click(clearBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(setSearchQuery).toHaveBeenCalledWith("");
  });

  it("renders all realms in the realm dropdown and handles changes", () => {
    const setSearchQuery = vi.fn();
    const setSelectedRealm = vi.fn();
    const setDifficulty = vi.fn();

    render(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={setSearchQuery}
        selectedRealm="css"
        setSelectedRealm={setSelectedRealm}
        difficulty="All"
        setDifficulty={setDifficulty}
      />
    );

    const realmSelect = screen.getByRole("combobox", {
      name: /filter quests by realm/i,
    }) as HTMLSelectElement;

    // First option should be "All Realms"
    expect(screen.getByText("All Realms")).toBeDefined();

    // Check each realm title is present as an option
    REALMS.forEach((realm) => {
      expect(screen.getByText(realm.title)).toBeDefined();
    });

    fireEvent.change(realmSelect, { target: { value: "javascript" } });
    expect(setSelectedRealm).toHaveBeenCalledWith("javascript");
  });

  it("renders difficulty options and handles changes", () => {
    const setSearchQuery = vi.fn();
    const setSelectedRealm = vi.fn();
    const setDifficulty = vi.fn();

    render(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={setSearchQuery}
        selectedRealm="All"
        setSelectedRealm={setSelectedRealm}
        difficulty="Beginner"
        setDifficulty={setDifficulty}
      />
    );

    const diffSelect = screen.getByRole("combobox", {
      name: /filter quests by difficulty/i,
    }) as HTMLSelectElement;

    expect(screen.getByText("All Difficulties")).toBeDefined();
    expect(screen.getByText("Beginner (1 Star)")).toBeDefined();
    expect(screen.getByText("Intermediate (2 Stars)")).toBeDefined();
    expect(screen.getByText("Advanced (3 Stars)")).toBeDefined();

    fireEvent.change(diffSelect, { target: { value: "Advanced" } });
    expect(setDifficulty).toHaveBeenCalledWith("Advanced");
  });

  it("renders reset button when filters are active and clears all filters default", () => {
    const setSearchQuery = vi.fn();
    const setSelectedRealm = vi.fn();
    const setDifficulty = vi.fn();

    render(
      <QuestFilterBar
        searchQuery="async"
        setSearchQuery={setSearchQuery}
        selectedRealm="javascript"
        setSelectedRealm={setSelectedRealm}
        difficulty="Advanced"
        setDifficulty={setDifficulty}
      />
    );

    const resetBtn = screen.getByRole("button", { name: /reset all filters/i });
    expect(resetBtn).toBeDefined();

    fireEvent.click(resetBtn);
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(setSearchQuery).toHaveBeenCalledWith("");
    expect(setSelectedRealm).toHaveBeenCalledWith("All");
    expect(setDifficulty).toHaveBeenCalledWith("All");
  });

  it("calls onResetFilters callback when provided upon clicking reset button", () => {
    const setSearchQuery = vi.fn();
    const setSelectedRealm = vi.fn();
    const setDifficulty = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <QuestFilterBar
        searchQuery="sql"
        setSearchQuery={setSearchQuery}
        selectedRealm="database"
        setSelectedRealm={setSelectedRealm}
        difficulty="All"
        setDifficulty={setDifficulty}
        onResetFilters={onResetFilters}
      />
    );

    const resetBtn = screen.getByRole("button", { name: /reset all filters/i });
    fireEvent.click(resetBtn);

    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });

  it("renders search landmark with aria-label and default polite status announcement", () => {
    render(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedRealm="All"
        setSelectedRealm={vi.fn()}
        difficulty="All"
        setDifficulty={vi.fn()}
      />
    );

    const searchLandmark = screen.getByRole("search", {
      name: /quest filter controls/i,
    });
    expect(searchLandmark).toBeDefined();

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute("aria-live")).toBe("polite");
    expect(statusRegion.className).toContain("sr-only");
    expect(statusRegion.textContent).toBe("Showing all quests");
  });

  it("announces dynamic active filter state when filters are applied", () => {
    const { rerender } = render(
      <QuestFilterBar
        searchQuery="promise"
        setSearchQuery={vi.fn()}
        selectedRealm="javascript"
        setSelectedRealm={vi.fn()}
        difficulty="Advanced"
        setDifficulty={vi.fn()}
      />
    );

    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).toContain('search: "promise"');
    expect(statusRegion.textContent).toContain("realm: Modern JavaScript (ES6+)");
    expect(statusRegion.textContent).toContain("difficulty: Advanced");
    expect(statusRegion.textContent).toBe(
      'Active filters: search: "promise", realm: Modern JavaScript (ES6+), difficulty: Advanced'
    );

    // Partial filter: only search query
    rerender(
      <QuestFilterBar
        searchQuery="flexbox"
        setSearchQuery={vi.fn()}
        selectedRealm="All"
        setSelectedRealm={vi.fn()}
        difficulty="All"
        setDifficulty={vi.fn()}
      />
    );
    expect(statusRegion.textContent).toBe('Active filters: search: "flexbox"');

    // Partial filter: only realm
    rerender(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedRealm="css"
        setSelectedRealm={vi.fn()}
        difficulty="All"
        setDifficulty={vi.fn()}
      />
    );
    expect(statusRegion.textContent).toBe("Active filters: realm: CSS, Flexbox & Grid");

    // Partial filter: only difficulty
    rerender(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={vi.fn()}
        selectedRealm="All"
        setSelectedRealm={vi.fn()}
        difficulty="Beginner"
        setDifficulty={vi.fn()}
      />
    );
    expect(statusRegion.textContent).toBe("Active filters: difficulty: Beginner");
  });

  it("updates role='status' announcement back to 'Showing all quests' upon resetting filters", () => {
    let query = "grid";
    let realm = "css";
    let diff: "All" | "Beginner" | "Intermediate" | "Advanced" = "Intermediate";

    const { rerender } = render(
      <QuestFilterBar
        searchQuery={query}
        setSearchQuery={(q) => {
          query = q;
        }}
        selectedRealm={realm}
        setSelectedRealm={(r) => {
          realm = r;
        }}
        difficulty={diff}
        setDifficulty={(d) => {
          diff = d;
        }}
      />
    );

    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).toContain('search: "grid"');

    // Click reset button (default reset behavior)
    const resetBtn = screen.getByRole("button", { name: /reset all filters/i });
    fireEvent.click(resetBtn);

    // Re-render with cleared values to reflect state change
    rerender(
      <QuestFilterBar
        searchQuery={query}
        setSearchQuery={(q) => {
          query = q;
        }}
        selectedRealm={realm}
        setSelectedRealm={(r) => {
          realm = r;
        }}
        difficulty={diff}
        setDifficulty={(d) => {
          diff = d;
        }}
      />
    );

    expect(statusRegion.textContent).toBe("Showing all quests");
  });

  it("clears search query when Escape is pressed on non-empty search input", () => {
    const setSearchQuery = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <QuestFilterBar
        searchQuery="typescript"
        setSearchQuery={setSearchQuery}
        onSearchChange={onSearchChange}
        selectedRealm="All"
        setSelectedRealm={vi.fn()}
        difficulty="All"
        setDifficulty={vi.fn()}
      />
    );

    const searchInput = screen.getByRole("textbox", {
      name: /search quests by title, concept, or code/i,
    });

    fireEvent.keyDown(searchInput, { key: "Escape" });
    expect(soundEngine.playSfx).toHaveBeenCalledWith("click");
    expect(setSearchQuery).toHaveBeenCalledWith("");
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("does not clear search query or play sfx when Escape is pressed on empty search input", () => {
    const setSearchQuery = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <QuestFilterBar
        searchQuery=""
        setSearchQuery={setSearchQuery}
        onSearchChange={onSearchChange}
        selectedRealm="All"
        setSelectedRealm={vi.fn()}
        difficulty="All"
        setDifficulty={vi.fn()}
      />
    );

    const searchInput = screen.getByRole("textbox", {
      name: /search quests by title, concept, or code/i,
    });

    fireEvent.keyDown(searchInput, { key: "Escape" });
    expect(soundEngine.playSfx).not.toHaveBeenCalled();
    expect(setSearchQuery).not.toHaveBeenCalled();
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it("does not clear search query when other keys are pressed", () => {
    const setSearchQuery = vi.fn();

    render(
      <QuestFilterBar
        searchQuery="react"
        setSearchQuery={setSearchQuery}
        selectedRealm="All"
        setSelectedRealm={vi.fn()}
        difficulty="All"
        setDifficulty={vi.fn()}
      />
    );

    const searchInput = screen.getByRole("textbox", {
      name: /search quests by title, concept, or code/i,
    });

    fireEvent.keyDown(searchInput, { key: "Enter" });
    fireEvent.keyDown(searchInput, { key: "Tab" });
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(setSearchQuery).not.toHaveBeenCalled();
  });

  it("marks all decorative Lucide icons with aria-hidden='true'", () => {
    const { container } = render(
      <QuestFilterBar
        searchQuery="query"
        setSearchQuery={vi.fn()}
        selectedRealm="javascript"
        setSelectedRealm={vi.fn()}
        difficulty="Advanced"
        setDifficulty={vi.fn()}
      />
    );

    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThanOrEqual(5);
    svgIcons.forEach((svg) => {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    });
  });
});

describe("formatActiveFiltersSummary helper", () => {
  it("formats summary when all quests are showing without filters", () => {
    expect(formatActiveFiltersSummary(12, 12)).toBe("Showing all 12 quests");
    expect(formatActiveFiltersSummary(0, 0)).toBe("Showing all 0 quests");
  });

  it("formats singular quest noun when total count is 1", () => {
    expect(formatActiveFiltersSummary(1, 1)).toBe("Showing all 1 quest");
  });

  it("handles non-finite or negative counts safely", () => {
    expect(formatActiveFiltersSummary(-5, -10)).toBe("Showing all 0 quests");
    expect(formatActiveFiltersSummary(NaN, NaN)).toBe("Showing all 0 quests");
    expect(formatActiveFiltersSummary(Infinity, 5)).toBe("Showing 0 of 5 quests");
  });

  it("formats count when showing count differs from total count without active filters", () => {
    expect(formatActiveFiltersSummary(4, 10)).toBe("Showing 4 of 10 quests");
    expect(formatActiveFiltersSummary(1, 10)).toBe("Showing 1 of 10 quests");
  });

  it("formats summary with active search query", () => {
    expect(formatActiveFiltersSummary(3, 10, "async")).toBe(
      'Showing 3 of 10 quests (search: "async")'
    );
    expect(formatActiveFiltersSummary(10, 10, "  flexbox  ")).toBe(
      'Showing 10 of 10 quests (search: "flexbox")'
    );
  });

  it("formats summary with known realm ID resolved to realm title", () => {
    expect(formatActiveFiltersSummary(2, 8, undefined, "javascript")).toBe(
      "Showing 2 of 8 quests (realm: Modern JavaScript (ES6+))"
    );
    expect(formatActiveFiltersSummary(5, 10, "", "css")).toBe(
      "Showing 5 of 10 quests (realm: CSS, Flexbox & Grid)"
    );
  });

  it("formats summary with unknown realm ID or custom realm string", () => {
    expect(formatActiveFiltersSummary(1, 4, "", "custom-realm")).toBe(
      "Showing 1 of 4 quests (realm: custom-realm)"
    );
  });

  it("formats summary with active status or difficulty", () => {
    expect(formatActiveFiltersSummary(4, 12, "", "All", "Beginner")).toBe(
      "Showing 4 of 12 quests (status: Beginner)"
    );
    expect(formatActiveFiltersSummary(2, 6, undefined, undefined, "Completed")).toBe(
      "Showing 2 of 6 quests (status: Completed)"
    );
  });

  it("formats summary with combined search, realm, and status filters", () => {
    expect(
      formatActiveFiltersSummary(1, 15, "reduce", "javascript", "Advanced")
    ).toBe(
      'Showing 1 of 15 quests (search: "reduce", realm: Modern JavaScript (ES6+), status: Advanced)'
    );
  });

  it("ignores 'All' and empty/whitespace filter arguments", () => {
    expect(formatActiveFiltersSummary(8, 8, "   ", "All", "All")).toBe(
      "Showing all 8 quests"
    );
    expect(formatActiveFiltersSummary(3, 8, "", "All", "All")).toBe(
      "Showing 3 of 8 quests"
    );
  });
});
