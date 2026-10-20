import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("UI Layout & Overflow Regression Guards", () => {
  const visualizerPath = path.join(process.cwd(), "src/components/RealmConceptVisualizer.tsx");
  const workspacePath = path.join(process.cwd(), "src/components/QuestCodingWorkspace.tsx");
  const idePath = path.join(process.cwd(), "src/components/OnlineMatrixIde.tsx");
  const bossPath = path.join(process.cwd(), "src/components/BossBattleArena.tsx");

  it("prevents combining w-full with inline marginLeft in RealmConceptVisualizer DOM tree", () => {
    const content = fs.readFileSync(visualizerPath, "utf-8");
    // Ensure we compute width: calc(100% - ${indentPx}px) when indenting DOM tree nodes
    expect(content).toContain("width: `calc(100% - ${indentPx}px)`");
    expect(content).toContain("A11y Score: 100%");
    expect(content).toContain("whitespace-nowrap shrink-0");
  });

  it("enforces single-line whitespace-nowrap tab buttons and clean Byte dialogue in QuestCodingWorkspace", () => {
    const content = fs.readFileSync(workspacePath, "utf-8");
    expect(content).toContain("whitespace-nowrap shrink-0");
    expect(content).toContain("formattedStoryIntro");
    expect(content).toContain("<span>Code Editor</span>");
    expect(content).toContain("<span>Live Preview</span>");
    expect(content).toContain("<span>Terminal</span>");
    expect(content).toContain("<span>Visualizer</span>");
  });

  it("prevents duplicate scrollbars in code editors by synchronizing gutterRef with textarea scrollTop", () => {
    for (const filePath of [idePath, workspacePath, bossPath]) {
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("gutterRef.current.scrollTop = e.currentTarget.scrollTop");
    }
  });
});
