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
    expect(achieveContent).toContain("px-4 py-3 sm:px-6 sm:py-4");
    expect(achieveContent).toContain("flex flex-wrap items-center justify-between gap-2");

    const skillContent = fs.readFileSync(skillPath, "utf-8");
    expect(skillContent).toContain("max-w-2xl");
    expect(skillContent).toContain("px-4 py-3 sm:px-6 sm:py-4");
    expect(skillContent).toContain("flex flex-wrap items-center justify-between gap-2");
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

  it("enforces Cycle 53 mobile usability & curriculum-to-ide bridge invariants", () => {
    const curriculumPath = path.join(process.cwd(), "src/components/CurriculumViewer.tsx");
    const curriculumContent = fs.readFileSync(curriculumPath, "utf-8");
    expect(curriculumContent).toContain("Open in IDE");
    expect(curriculumContent).toContain("devquest-online-ide-workspace-v1");
    expect(curriculumContent).toContain("overflow-x-auto scrollbar-none whitespace-nowrap");

    const workspacePath = path.join(process.cwd(), "src/components/QuestCodingWorkspace.tsx");
    const workspaceContent = fs.readFileSync(workspacePath, "utf-8");
    expect(workspaceContent).toContain("flex items-center gap-1 bg-matrix-dark p-1 rounded-lg border border-matrix-border font-mono text-xs shrink-0 overflow-x-auto");

    const bossPath = path.join(process.cwd(), "src/components/BossBattleArena.tsx");
    const bossContent = fs.readFileSync(bossPath, "utf-8");
    expect(bossContent).toContain("flex items-center gap-1 bg-matrix-dark p-1 rounded-lg border border-matrix-border font-mono text-xs shrink-0 overflow-x-auto");

    const worldMapPath = path.join(process.cwd(), "src/components/WorldCampaignMap.tsx");
    const worldMapContent = fs.readFileSync(worldMapPath, "utf-8");
    expect(worldMapContent).toContain("Close Realm Inspector");

    const idePath = path.join(process.cwd(), "src/components/OnlineMatrixIde.tsx");
    const ideContent = fs.readFileSync(idePath, "utf-8");
    expect(ideContent).toContain("handleExportWorkspace");
    expect(ideContent).toContain("Export Entire Workspace (.json)");
    expect(ideContent).toContain("devquest-workspace-");
  });

  it("enforces Cycle 54 workspace import & mobile bottom-clearance invariants", () => {
    const idePath = path.join(process.cwd(), "src/components/OnlineMatrixIde.tsx");
    const ideContent = fs.readFileSync(idePath, "utf-8");
    expect(ideContent).toContain("handleImportWorkspaceFile");
    expect(ideContent).toContain("Import Workspace Bundle (.json)");
    expect(ideContent).toContain('accept=".json,application/json"');
    expect(ideContent).toContain("pb-24 md:pb-3");

    const workspacePath = path.join(process.cwd(), "src/components/QuestCodingWorkspace.tsx");
    const workspaceContent = fs.readFileSync(workspacePath, "utf-8");
    expect(workspaceContent).toContain('setMobilePane("workbench")');
    expect(workspaceContent).toContain("pb-24 md:pb-3");

    const curriculumPath = path.join(process.cwd(), "src/components/CurriculumViewer.tsx");
    const curriculumContent = fs.readFileSync(curriculumPath, "utf-8");
    expect(curriculumContent).toContain("pb-24 md:pb-4");
  });

  it("enforces collapsible files sidebar and collapsible live preview for maximized coding space", () => {
    const idePath = path.join(process.cwd(), "src/components/OnlineMatrixIde.tsx");
    const ideContent = fs.readFileSync(idePath, "utf-8");

    // IDE container width maximizes space matching 1920px
    expect(ideContent).toContain("max-w-[1920px]");

    // Collapsible file explorer
    expect(ideContent).toContain("Collapse File Explorer (Ctrl+B)");
    expect(ideContent).toContain("Ctrl+B to toggle File Sidebar");
    expect(ideContent).toContain("Hide Files");
    expect(ideContent).toContain("Show Files");

    // Collapsible live preview
    expect(ideContent).toContain("Collapse Live Preview");
    expect(ideContent).toContain("Hide Preview");
    expect(ideContent).toContain("Show Preview");
    expect(ideContent).toContain("PanelRightClose");
  });

  it("enforces that CurriculumViewer does not display literal markdown hash symbols in headings", () => {
    const curriculumPath = path.join(process.cwd(), "src/components/CurriculumViewer.tsx");
    const curriculumContent = fs.readFileSync(curriculumPath, "utf-8");

    // Ensure raw decorative #, ##, ### spans are eliminated
    expect(curriculumContent).not.toContain('<span className="text-matrix-neonCyan">#</span>');
    expect(curriculumContent).not.toContain('<span className="text-matrix-accent/60">##</span>');
    expect(curriculumContent).not.toContain('<span className="text-matrix-neonCyan/60">###</span>');

    // Ensure headings are properly slugified and retain anchor IDs
    expect(curriculumContent).toContain("id={idSlug}");
    expect(curriculumContent).toContain("scroll-mt-6");
  });

  it("enforces Leveling & EXP System invariants in NavigationHud and celebration modals", () => {
    const hudPath = path.join(process.cwd(), "src/components/NavigationHud.tsx");
    const hudContent = fs.readFileSync(hudPath, "utf-8");

    expect(hudContent).toContain("LevelUpModal");
    expect(hudContent).toContain("LevelJourneyModal");
    expect(hudContent).toContain("XpGainFloatie");
    expect(hudContent).toContain("View Level & Rank Progression Journey");
    expect(hudContent).toContain("getLevelProgress");

    const levelModalPath = path.join(process.cwd(), "src/components/LevelUpModal.tsx");
    const levelModalContent = fs.readFileSync(levelModalPath, "utf-8");
    expect(levelModalContent).toContain("Level Up!");
    expect(levelModalContent).toContain("Cybernetic Ascension");
    expect(levelModalContent).toContain("unlockedSkillPoints");

    const journeyModalPath = path.join(process.cwd(), "src/components/LevelJourneyModal.tsx");
    const journeyModalContent = fs.readFileSync(journeyModalPath, "utf-8");
    expect(journeyModalContent).toContain("Level & Rank Progression");
    expect(journeyModalContent).toContain("Career Rank Ladder");
    expect(journeyModalContent).toContain("How to Earn EXP");
  });

  it("enforces NetworkStatusIndicator offline notification accessibility and viewport positioning", () => {
    const netPath = path.join(process.cwd(), "src/components/NetworkStatusIndicator.tsx");
    const netContent = fs.readFileSync(netPath, "utf-8");

    expect(netContent).toContain('role="alert"');
    expect(netContent).toContain("fixed bottom-4 right-4 z-50");
    expect(netContent).toContain("backdrop-blur-sm");
    expect(netContent).toContain("Network disconnected. Offline mode active.");
  });

  it("enforces KeyboardShortcutsModal dialog accessibility and backdrop blur invariants", () => {
    const kbdPath = path.join(process.cwd(), "src/components/KeyboardShortcutsModal.tsx");
    const kbdContent = fs.readFileSync(kbdPath, "utf-8");

    expect(kbdContent).toContain('role="dialog"');
    expect(kbdContent).toContain('aria-modal="true"');
    expect(kbdContent).toContain('aria-labelledby="keyboard-shortcuts-title"');
    expect(kbdContent).toContain("backdrop-blur-md");
    expect(kbdContent).toContain("max-w-2xl");
  });

  it("enforces MatrixErrorBoundary cyber fallback and recovery action layout", () => {
    const errPath = path.join(process.cwd(), "src/components/MatrixErrorBoundary.tsx");
    const errContent = fs.readFileSync(errPath, "utf-8");

    expect(errContent).toContain("SYSTEM FAILURE DETECTED");
    expect(errContent).toContain("handleReset");
    expect(errContent).toContain("REBOOT SUBSYSTEM");
    expect(errContent).toContain("RETURN TO MATRIX NEXUS");
    expect(errContent).toContain("bg-matrix-dark bg-cyber-grid");
    expect(errContent).toContain('role="alert"');
    expect(errContent).toContain('aria-live="assertive"');
    expect(errContent).toContain("handleCopyLog");
  });

  it("enforces ProfileModal and AuthModal dialog accessibility and backdrop blur invariants", () => {
    const profPath = path.join(process.cwd(), "src/components/ProfileModal.tsx");
    const profContent = fs.readFileSync(profPath, "utf-8");

    expect(profContent).toContain('role="dialog"');
    expect(profContent).toContain('aria-modal="true"');
    expect(profContent).toContain('aria-label="Agent Profile Dossier"');
    expect(profContent).toContain("backdrop-blur-md");

    const authPath = path.join(process.cwd(), "src/components/AuthModal.tsx");
    const authContent = fs.readFileSync(authPath, "utf-8");

    expect(authContent).toContain('role="dialog"');
    expect(authContent).toContain('aria-modal="true"');
    expect(authContent).toContain('aria-label="Matrix Terminal Access"');
    expect(authContent).toContain("backdrop-blur-md");
  });
});
