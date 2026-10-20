import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("UI Layout & Overflow Regression Guards", () => {
  const visualizerPath = path.join(process.cwd(), "src/components/RealmConceptVisualizer.tsx");
  const workspacePath = path.join(process.cwd(), "src/components/QuestCodingWorkspace.tsx");
  const idePath = path.join(process.cwd(), "src/components/OnlineMatrixIde.tsx");
  const bossPath = path.join(process.cwd(), "src/components/BossBattleArena.tsx");
  const bytePath = path.join(process.cwd(), "src/components/CyberCompanionByte.tsx");

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

  it("keeps CyberCompanionByte button anchored in the exact bottom-right corner when opened", () => {
    const content = fs.readFileSync(bytePath, "utf-8");
    expect(content).toContain("flex flex-col items-end");
    expect(content).toContain("absolute bottom-full right-0 mb-3");
  });

  it("keeps top header maximized at max-w-[1920px] while view containers use human-proportioned max widths", () => {
    const hudPath = path.join(process.cwd(), "src/components/NavigationHud.tsx");
    const mapPath = path.join(process.cwd(), "src/components/WorldCampaignMap.tsx");
    const curriculumPath = path.join(process.cwd(), "src/components/CurriculumViewer.tsx");
    const achievePath = path.join(process.cwd(), "src/components/AchievementsModal.tsx");
    const skillPath = path.join(process.cwd(), "src/components/SkillTreeModal.tsx");

    const hudContent = fs.readFileSync(hudPath, "utf-8");
    expect(hudContent).toContain("max-w-[1920px]");

    const mapContent = fs.readFileSync(mapPath, "utf-8");
    expect(mapContent).toContain("max-w-7xl");
    expect(mapContent).not.toContain("max-w-[1920px]");

    const curriculumContent = fs.readFileSync(curriculumPath, "utf-8");
    expect(curriculumContent).toContain("max-w-7xl");
    expect(curriculumContent).not.toContain("max-w-[1920px]");

    const workspaceContent = fs.readFileSync(workspacePath, "utf-8");
    expect(workspaceContent).toContain("max-w-7xl");
    expect(workspaceContent).not.toContain("max-w-[1920px]");

    const bossContent = fs.readFileSync(bossPath, "utf-8");
    expect(bossContent).toContain("max-w-6xl");
    expect(bossContent).not.toContain("max-w-[1920px]");

    const achieveContent = fs.readFileSync(achievePath, "utf-8");
    expect(achieveContent).toContain("max-w-2xl");

    const skillContent = fs.readFileSync(skillPath, "utf-8");
    expect(skillContent).toContain("max-w-2xl");
  });

  it("provides mobile-friendly bottom navigation, responsive drawer widths, and segmented directive toggles", () => {
    const hudPath = path.join(process.cwd(), "src/components/NavigationHud.tsx");
    const hudContent = fs.readFileSync(hudPath, "utf-8");
    expect(hudContent).toContain('aria-label="Mobile Navigation"');
    expect(hudContent).toContain("md:hidden fixed bottom-0");

    const byteContent = fs.readFileSync(bytePath, "utf-8");
    expect(byteContent).toContain("bottom-16 sm:bottom-5");
    expect(byteContent).toContain("w-[calc(100vw-2rem)]");

    const workspaceContent = fs.readFileSync(workspacePath, "utf-8");
    expect(workspaceContent).toContain("Mobile & Tablet Segmented View Toggle");
    expect(workspaceContent).toContain("Mission Directive");
    expect(workspaceContent).toContain("Code Workbench");

    const curriculumPath = path.join(process.cwd(), "src/components/CurriculumViewer.tsx");
    const curriculumContent = fs.readFileSync(curriculumPath, "utf-8");
    expect(curriculumContent).toContain("Mobile Chapter Picker");
  });

  it("overhauls Online Matrix IDE with mobile segmented mode switcher, programmer symbol bar, and touch navigation", () => {
    const ideContent = fs.readFileSync(idePath, "utf-8");
    expect(ideContent).toContain("Mobile Segmented Mode Switcher");
    expect(ideContent).toContain("mobileIdeTab");
    expect(ideContent).toContain("PROGRAMMER_SYMBOLS");
    expect(ideContent).toContain("insertSymbolAtCursor");
    expect(ideContent).toContain("Mobile Streamlined Title & Action Bar");
    expect(ideContent).toContain('optgroup label="📦 Starter Templates"');
    expect(ideContent).toContain('optgroup label="⚔️ Quest Trials (24 Quests)"');
    expect(ideContent).toContain('optgroup label="⚡ Warm-Up Drills (12 Realms)"');
    expect(ideContent).toContain("hidden md:flex w-11 bg-matrix-dark border-r");

    const workspaceContent = fs.readFileSync(workspacePath, "utf-8");
    expect(workspaceContent).toContain("Mobile Programmer Keyboard Accessory Bar");
    expect(workspaceContent).toContain("PROGRAMMER_SYMBOLS");
    expect(workspaceContent).toContain("insertSymbolAtCursor");

    const bossContent = fs.readFileSync(bossPath, "utf-8");
    expect(bossContent).toContain("Mobile Programmer Keyboard Accessory Bar");
    expect(bossContent).toContain("PROGRAMMER_SYMBOLS");
    expect(bossContent).toContain("insertSymbolAtCursor");
    expect(bossContent).toContain("pb-24 md:pb-6");
  });
});
