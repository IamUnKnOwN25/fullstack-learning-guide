/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestFilterBar } from "../components/QuestFilterBar";
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
});
