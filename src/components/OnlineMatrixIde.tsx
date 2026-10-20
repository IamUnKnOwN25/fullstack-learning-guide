"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { soundEngine } from "@/lib/soundEngine";
import { useGameStore } from "@/lib/gameStore";
import { QUESTS, Quest } from "@/data/quests";
import {
  IdeFile,
  IDE_PROJECT_TEMPLATES,
  bundleIdeProject,
  detectFileLanguage,
  analyzeWorkspaceDiagnostics,
} from "@/lib/ideBundler";
import {
  Code,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  FolderOpen,
  Search,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Sparkles,
  FileCode,
  Eye,
  Columns,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
  X,
  Wand2,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ConsoleEntry {
  id: string;
  level: "log" | "warn" | "error" | "system";
  text: string;
  timestamp: string;
}

interface Props {
  initialQuestId?: string;
}

const STORAGE_KEY = "devquest-online-ide-workspace-v1";

const CODE_SNIPPETS = [
  {
    title: "HTML5 Semantic Landmark Shell",
    lang: "html",
    code: `<header>\n  <nav aria-label="Primary">Navigation</nav>\n</header>\n<main>\n  <article>\n    <h1>Matrix Article</h1>\n    <p>Accessible semantic content.</p>\n  </article>\n</main>\n<footer>© 2026 DevQuest</footer>`,
  },
  {
    title: "CSS Responsive Auto-Fit Grid",
    lang: "css",
    code: `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 16px;\n  align-items: stretch;\n}`,
  },
  {
    title: "JS Async Fetch with Error Guard",
    lang: "javascript",
    code: `async function fetchMatrixNode(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n    return await res.json();\n  } catch (err) {\n    console.error("Request failed:", err);\n    return null;\n  }\n}`,
  },
  {
    title: "TS Discriminated Union Pattern",
    lang: "typescript",
    code: `type ApiState =\n  | { status: "loading" }\n  | { status: "success"; data: string[] }\n  | { status: "error"; message: string };\n\nfunction renderState(state: ApiState): string {\n  switch (state.status) {\n    case "loading": return "Loading...";\n    case "success": return state.data.join(", ");\n    case "error": return state.message;\n  }\n}`,
  },
  {
    title: "SQL Parameterized Query + Index",
    lang: "sql",
    code: `CREATE INDEX idx_accounts_email ON accounts (email);\n\nSELECT id, email, role\nFROM accounts\nWHERE email = $1 AND active = TRUE;`,
  },
];

export function OnlineMatrixIde({ initialQuestId }: Props) {
  const { completeQuest, completedQuests, addXp } = useGameStore();

  // Flatten all 24 quests for the Quest Loader dropdown
  const allQuests = useMemo(() => {
    const list: Quest[] = [];
    Object.values(QUESTS).forEach((qList) => list.push(...qList));
    return list;
  }, []);

  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    IDE_PROJECT_TEMPLATES[0].id
  );
  const [linkedQuestId, setLinkedQuestId] = useState<string>(initialQuestId || "");
  const [files, setFiles] = useState<IdeFile[]>(() => IDE_PROJECT_TEMPLATES[0].files);
  const [openTabs, setOpenTabs] = useState<string[]>(() =>
    IDE_PROJECT_TEMPLATES[0].files.map((f) => f.name)
  );
  const [activeFileName, setActiveFileName] = useState<string>(
    IDE_PROJECT_TEMPLATES[0].files[0].name
  );

  // Sidebar & Layout state
  const [sidebarTab, setSidebarTab] = useState<"explorer" | "search" | "snippets" | null>(
    "explorer"
  );
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [viewportDevice, setViewportDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [fontSize, setFontSize] = useState<"text-xs" | "text-sm" | "text-base">("text-xs");
  const [wordWrap, setWordWrap] = useState(false);

  // File Creation state
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Search & Replace state
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");

  // Editor Cursor & Save state
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const [savedToast, setSavedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  // Bottom Panel (Terminal / Console / Problems)
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<"console" | "terminal" | "problems">("console");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([
    {
      id: "init-1",
      level: "system",
      text: "DevQuest Matrix Studio IDE v2.4 initialized. Press Ctrl+Enter or click 'Run & Preview' to execute.",
      timestamp: "00:00:00",
    },
  ]);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "DevQuest Interactive Shell (matrix-sh v2.4)",
    "Type 'help' for available commands, 'ls' to list files, or 'node <file>' to execute JS/TS.",
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [questVerifyBanner, setQuestVerifyBanner] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  // Load saved workspace from localStorage on mount (unless initialQuestId is passed)
  useEffect(() => {
    if (initialQuestId) {
      const found = allQuests.find((q) => q.id === initialQuestId);
      if (found) {
        loadQuestIntoIde(found);
        return;
      }
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.files) && parsed.files.length > 0) {
          setFiles(parsed.files);
          setOpenTabs(parsed.files.map((f: IdeFile) => f.name));
          setActiveFileName(parsed.activeFileName || parsed.files[0].name);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [initialQuestId, allQuests]);

  // Listen for console messages from the sandboxed preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === "devquest-ide-preview") {
        const time = new Date().toLocaleTimeString();
        setConsoleLogs((prev) => [
          ...prev.slice(-49),
          {
            id: `${Date.now()}-${Math.random()}`,
            level: event.data.level || "log",
            text: String(event.data.text || ""),
            timestamp: time,
          },
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Persist workspace to localStorage whenever files change
  const saveWorkspace = (updatedFiles = files, showBadge = false) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          files: updatedFiles,
          activeFileName,
        })
      );
      if (showBadge) {
        soundEngine.playSfx("click");
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 1800);
      }
    } catch {
      // Ignore storage quota errors
    }
  };

  const activeFile = useMemo(
    () => files.find((f) => f.name === activeFileName) || files[0],
    [files, activeFileName]
  );

  const diagnostics = useMemo(() => analyzeWorkspaceDiagnostics(files), [files]);

  const bundledSrcDoc = useMemo(
    () => bundleIdeProject(files, activeFile?.name),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, activeFile?.name, previewVersion]
  );

  const linkedQuest = useMemo(
    () => allQuests.find((q) => q.id === linkedQuestId),
    [allQuests, linkedQuestId]
  );

  const loadTemplate = (templateId: string) => {
    const tpl = IDE_PROJECT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    soundEngine.playSfx("click");
    setActiveTemplateId(tpl.id);
    setLinkedQuestId("");
    setQuestVerifyBanner(null);
    const cloned = tpl.files.map((f) => ({ ...f }));
    setFiles(cloned);
    setOpenTabs(cloned.map((f) => f.name));
    setActiveFileName(cloned[0].name);
    saveWorkspace(cloned, false);
  };

  const loadQuestIntoIde = (quest: Quest) => {
    soundEngine.playSfx("click");
    setLinkedQuestId(quest.id);
    setQuestVerifyBanner(null);

    const extMap: Record<string, string> = {
      html: "index.html",
      css: "styles.css",
      javascript: "solution.js",
      typescript: "solution.ts",
      sql: "query.sql",
      dockerfile: "Dockerfile.js",
      yaml: "pipeline.js",
      bash: "script.js",
    };
    const mainFileName = extMap[quest.language] || "solution.js";
    const mainLang = detectFileLanguage(mainFileName);

    const questFiles: IdeFile[] = [
      {
        name: mainFileName,
        language: mainLang,
        content: quest.starterCode,
      },
      {
        name: "MISSION.md",
        language: "markdown",
        content: `# ${quest.title} (${quest.realmId.toUpperCase()} Realm)\n\n${quest.conceptSummary}\n\n## Objectives\n${quest.tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n## Hints\n${quest.hints.map((h, i) => `- Hint ${i + 1}: ${h}`).join("\n")}`,
      },
    ];

    if (mainLang === "css") {
      questFiles.unshift({
        name: "index.html",
        language: "html",
        content: `<div class="container card grid-box">\n  <h2>CSS Trial Live Preview</h2>\n  <p>Edit styles.css to style this container!</p>\n</div>`,
      });
    }

    setFiles(questFiles);
    setOpenTabs(questFiles.map((f) => f.name));
    setActiveFileName(mainFileName);
    saveWorkspace(questFiles, false);
  };

  const updateActiveFileContent = (newContent: string) => {
    if (!activeFile) return;
    const nextFiles = files.map((f) =>
      f.name === activeFile.name ? { ...f, content: newContent } : f
    );
    setFiles(nextFiles);
    saveWorkspace(nextFiles, false);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    const finalName = trimmed.includes(".") ? trimmed : `${trimmed}.js`;
    if (files.some((f) => f.name.toLowerCase() === finalName.toLowerCase())) {
      setActiveFileName(finalName);
      setIsCreatingFile(false);
      setNewFileName("");
      return;
    }
    const lang = detectFileLanguage(finalName);
    const created: IdeFile = {
      name: finalName,
      language: lang,
      content:
        lang === "html"
          ? `<!-- ${finalName} -->\n<section>\n  <h2>New HTML Component</h2>\n</section>`
          : lang === "css"
          ? `/* ${finalName} */\nbody {\n  \n}`
          : lang === "sql"
          ? `-- ${finalName}\nSELECT 1;`
          : `// ${finalName}\nconsole.log("Loaded ${finalName}");\n`,
    };
    const nextFiles = [...files, created];
    setFiles(nextFiles);
    if (!openTabs.includes(finalName)) {
      setOpenTabs([...openTabs, finalName]);
    }
    setActiveFileName(finalName);
    setIsCreatingFile(false);
    setNewFileName("");
    soundEngine.playSfx("click");
    saveWorkspace(nextFiles, false);
  };

  const handleDeleteFile = (name: string) => {
    if (files.length <= 1) return;
    soundEngine.playSfx("click");
    const nextFiles = files.filter((f) => f.name !== name);
    const nextTabs = openTabs.filter((t) => t !== name);
    setFiles(nextFiles);
    setOpenTabs(nextTabs.length > 0 ? nextTabs : [nextFiles[0].name]);
    if (activeFileName === name) {
      setActiveFileName(nextTabs[0] || nextFiles[0].name);
    }
    saveWorkspace(nextFiles, false);
  };

  const handleFormatCode = () => {
    if (!activeFile) return;
    soundEngine.playSfx("click");
    const formatted = activeFile.content
      .split("\n")
      .map((line) => line.replace(/\s+$/, ""))
      .join("\n")
      .trim();
    updateActiveFileContent(formatted + "\n");
  };

  const handleRunProject = () => {
    soundEngine.playSfx("attack");
    setConsoleLogs([
      {
        id: `run-${Date.now()}`,
        level: "system",
        text: `[Build] Bundled ${files.length} files (${files.map((f) => f.name).join(", ")}) at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setPreviewVersion((v) => v + 1);

    // If a DevQuest trial is loaded, also run its testRunner!
    if (linkedQuest && activeFile) {
      const result = linkedQuest.testRunner(activeFile.content);
      setQuestVerifyBanner(result);
      if (result.passed) {
        soundEngine.playSfx("correct");
        completeQuest(linkedQuest.id, linkedQuest.realmId, 3, linkedQuest.xpReward);
        confetti({
          particleCount: 70,
          spread: 65,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = terminalInput.trim();
    if (!raw) return;
    soundEngine.playSfx("click");
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1];

    const out: string[] = [`$ ${raw}`];

    if (cmd === "help") {
      out.push(
        "Available matrix-sh commands:",
        "  ls                 List all files in workspace",
        "  cat <filename>     Print file contents",
        "  node <filename>    Execute JS/TS file and print console output",
        "  run                Bundle & refresh live preview",
        "  touch <filename>   Create a new file in workspace",
        "  rm <filename>      Remove a file from workspace",
        "  clear              Clear terminal output",
        "  whoami             Display current operator status"
      );
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else if (cmd === "ls") {
      out.push(files.map((f) => `${f.name} (${f.content.length}B)`).join("   "));
    } else if (cmd === "whoami") {
      out.push(
        `Operator Profile • Quests Solved: ${completedQuests.length}/24 • Active Workspace Files: ${files.length}`
      );
    } else if (cmd === "cat") {
      const target = files.find((f) => f.name === arg);
      if (!target) {
        out.push(`cat: ${arg || "<missing>"}: No such file in workspace`);
      } else {
        out.push(target.content);
      }
    } else if (cmd === "touch" && arg) {
      if (files.some((f) => f.name === arg)) {
        out.push(`touch: '${arg}' already exists`);
      } else {
        const lang = detectFileLanguage(arg);
        const nextFiles = [...files, { name: arg, language: lang, content: `// ${arg}\n` }];
        setFiles(nextFiles);
        setOpenTabs((prev) => (prev.includes(arg) ? prev : [...prev, arg]));
        setActiveFileName(arg);
        saveWorkspace(nextFiles, false);
        out.push(`Created file '${arg}'`);
      }
    } else if (cmd === "rm" && arg) {
      if (files.length <= 1) {
        out.push("rm: cannot remove the last remaining workspace file");
      } else if (!files.some((f) => f.name === arg)) {
        out.push(`rm: '${arg}': No such file`);
      } else {
        handleDeleteFile(arg);
        out.push(`Removed '${arg}'`);
      }
    } else if (cmd === "node" || cmd === "run") {
      const targetFile =
        (arg && files.find((f) => f.name === arg)) ||
        files.find((f) => f.language === "javascript" || f.language === "typescript") ||
        activeFile;

      if (!targetFile) {
        out.push("No executable JS/TS file found.");
      } else {
        const captured: string[] = [];
        const customConsole = {
          log: (...args: unknown[]) =>
            captured.push(
              args
                .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
                .join(" ")
            ),
          warn: (...args: unknown[]) =>
            captured.push("[WARN] " + args.map((a) => String(a)).join(" ")),
          error: (...args: unknown[]) =>
            captured.push("[ERROR] " + args.map((a) => String(a)).join(" ")),
        };
        try {
          const cleanJs = targetFile.content
            .replace(/^\s*export\s+default\s+/gm, "")
            .replace(/^\s*export\s+(?=(const|let|var|function|class|async)\b)/gm, "")
            .replace(/^\s*(export\s+)?interface\s+\w+[\s\S]*?^\}/gm, "")
            .replace(/:\s*(string|number|boolean|any|unknown|void|never)(\[\])?(?=[,)=;\s])/g, "");
          const fn = new Function("console", cleanJs);
          fn(customConsole);
          if (captured.length === 0) {
            out.push(`Executed ${targetFile.name} successfully (0 console lines).`);
          } else {
            out.push(...captured);
          }
          addXp(5);
        } catch (err) {
          out.push(
            `RuntimeError in ${targetFile.name}: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      }
      handleRunProject();
    } else {
      out.push(`matrix-sh: command not found: ${cmd}. Type 'help' for available commands.`);
    }

    setTerminalHistory((prev) => [...prev, ...out]);
    setTerminalInput("");
  };

  const handleDownloadActiveFile = () => {
    if (!activeFile) return;
    soundEngine.playSfx("click");
    const blob = new Blob([activeFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Search results across all files
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const matches: { file: string; line: number; preview: string }[] = [];
    for (const f of files) {
      f.content.split("\n").forEach((l, idx) => {
        if (l.toLowerCase().includes(q)) {
          matches.push({ file: f.name, line: idx + 1, preview: l.trim() });
        }
      });
    }
    return matches;
  }, [files, searchTerm]);

  const updateCursorMetrics = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart || 0;
    const upToCursor = el.value.slice(0, pos);
    const lines = upToCursor.split("\n");
    setCursorPos({
      ln: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const getLanguageBadgeColor = (lang: IdeFile["language"]) => {
    switch (lang) {
      case "html":
        return "text-orange-400 border-orange-500/40 bg-orange-500/10";
      case "css":
        return "text-matrix-neonCyan border-matrix-neonCyan/40 bg-matrix-neonCyan/10";
      case "typescript":
        return "text-blue-400 border-blue-500/40 bg-blue-500/10";
      case "sql":
        return "text-matrix-neonPurple border-matrix-neonPurple/40 bg-matrix-neonPurple/10";
      case "markdown":
        return "text-gray-300 border-gray-500/40 bg-gray-500/10";
      default:
        return "text-matrix-neonGold border-matrix-neonGold/40 bg-matrix-neonGold/10";
    }
  };

  return (
    <div className="w-full max-w-none mx-auto px-2 sm:px-3 py-2 flex flex-col gap-2 min-h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)] font-mono select-none">
      {/* Top VS Code Title & Action Bar */}
      <div className="bg-matrix-card border border-matrix-border rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            onClick={() => soundEngine.playSfx("click")}
            className="p-1.5 rounded-lg bg-matrix-dark hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors shrink-0"
            title="Return to World Map"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-matrix-neonCyan/20 border border-matrix-neonCyan/50 flex items-center justify-center text-matrix-neonCyan shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 whitespace-nowrap">
                <span>Matrix Studio IDE</span>
                <span className="px-1.5 py-0.5 rounded bg-matrix-accent/15 border border-matrix-accent/40 text-matrix-accent text-[10px]">
                  VS Code Mode
                </span>
              </div>
              <div className="text-[10px] text-gray-400 hidden sm:block">
                Multi-File Full-Stack Sandbox • Live Preview • Integrated Shell
              </div>
            </div>
          </div>

          {/* Template Switcher */}
          <select
            aria-label="Select Project Template"
            value={activeTemplateId}
            onChange={(e) => loadTemplate(e.target.value)}
            className="bg-matrix-dark border border-matrix-border rounded-lg px-2.5 py-1.5 text-xs text-gray-200 outline-none focus:border-matrix-neonCyan cursor-pointer"
          >
            {IDE_PROJECT_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                Template: {tpl.name}
              </option>
            ))}
          </select>

          {/* Load Any of the 24 DevQuest Trials into the IDE */}
          <select
            aria-label="Load DevQuest Trial into IDE"
            value={linkedQuestId}
            onChange={(e) => {
              const q = allQuests.find((item) => item.id === e.target.value);
              if (q) loadQuestIntoIde(q);
            }}
            className="bg-matrix-dark border border-matrix-border rounded-lg px-2.5 py-1.5 text-xs text-matrix-neonCyan outline-none focus:border-matrix-neonCyan cursor-pointer"
          >
            <option value="">Load a Quest Trial (24 Available)...</option>
            {allQuests.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.realmId.toUpperCase()}] {q.order}. {q.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right Controls: View Switcher, Format, Save, Run */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-matrix-dark p-0.5 rounded-lg border border-matrix-border shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                viewMode === "editor"
                  ? "bg-matrix-card text-matrix-neonCyan border border-matrix-neonCyan/40"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Editor Fullscreen"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden md:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                viewMode === "split"
                  ? "bg-matrix-card text-matrix-accent border border-matrix-accent/40"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Split View (Editor + Live Preview)"
            >
              <Columns className="w-3 h-3" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                viewMode === "preview"
                  ? "bg-matrix-card text-matrix-neonGold border border-matrix-neonGold/40"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Preview Fullscreen"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleFormatCode}
            className="px-2.5 py-1.5 rounded-lg bg-matrix-dark hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white text-xs flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            title="Prettify & Format Active File"
          >
            <Wand2 className="w-3.5 h-3.5 text-matrix-neonPurple shrink-0" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadActiveFile}
            className="px-2.5 py-1.5 rounded-lg bg-matrix-dark hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white text-xs flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            title="Download Active File"
          >
            <Download className="w-3.5 h-3.5 text-matrix-neonCyan shrink-0" />
            <span className="hidden xl:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={handleRunProject}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-matrix-accent to-matrix-neonCyan text-matrix-dark font-bold text-xs flex items-center gap-1.5 shadow-md shadow-matrix-accent/20 hover:opacity-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-matrix-dark shrink-0" />
            <span>{linkedQuest ? "Run & Verify Quest" : "Run & Preview"}</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-black/20 px-1 rounded">
              Ctrl+↵
            </kbd>
          </button>
        </div>
      </div>

      {/* Linked Quest Verification Banner */}
      {questVerifyBanner && (
        <div
          className={`px-4 py-2 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            questVerifyBanner.passed
              ? "bg-matrix-accent/15 border-matrix-accent text-matrix-accent"
              : "bg-matrix-neonRed/15 border-matrix-neonRed text-matrix-neonRed"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {questVerifyBanner.passed ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{questVerifyBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setQuestVerifyBanner(null)}
            className="text-gray-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main VS Code Workbench Area: Activity Rail + Sidebar + Editor + Preview */}
      <div className="flex-1 min-h-0 flex flex-col bg-matrix-card border border-matrix-border rounded-xl overflow-hidden shadow-2xl">
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Far-Left VS Code Activity Bar */}
          <div className="w-11 bg-matrix-dark border-r border-matrix-border flex flex-col items-center py-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setSidebarTab((prev) => (prev === "explorer" ? null : "explorer"))
              }
              className={`p-2 rounded-lg transition-colors ${
                sidebarTab === "explorer"
                  ? "bg-matrix-neonCyan/20 text-matrix-neonCyan border-l-2 border-matrix-neonCyan"
                  : "text-gray-500 hover:text-white"
              }`}
              title="File Explorer"
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarTab((prev) => (prev === "search" ? null : "search"))
              }
              className={`p-2 rounded-lg transition-colors ${
                sidebarTab === "search"
                  ? "bg-matrix-neonCyan/20 text-matrix-neonCyan border-l-2 border-matrix-neonCyan"
                  : "text-gray-500 hover:text-white"
              }`}
              title="Search Across Files"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setSidebarTab((prev) => (prev === "snippets" ? null : "snippets"))
              }
              className={`p-2 rounded-lg transition-colors ${
                sidebarTab === "snippets"
                  ? "bg-matrix-neonCyan/20 text-matrix-neonCyan border-l-2 border-matrix-neonCyan"
                  : "text-gray-500 hover:text-white"
              }`}
              title="Full-Stack Code Snippets"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <div className="mt-auto flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setBottomPanelOpen((prev) => !prev)}
                className={`p-2 rounded-lg transition-colors ${
                  bottomPanelOpen
                    ? "text-matrix-accent bg-matrix-accent/15"
                    : "text-gray-500 hover:text-white"
                }`}
                title="Toggle Integrated Terminal & Console"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible VS Code Sidebar (Explorer / Search / Snippets) */}
          {sidebarTab && (
            <div className="w-56 sm:w-64 bg-matrix-dark/70 border-r border-matrix-border flex flex-col shrink-0 overflow-hidden">
              {sidebarTab === "explorer" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-3 py-2 border-b border-matrix-border flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Explorer</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingFile(true)}
                        className="p-1 rounded hover:bg-matrix-card text-matrix-neonCyan hover:text-white"
                        title="New File"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => loadTemplate(activeTemplateId)}
                        className="p-1 rounded hover:bg-matrix-card text-gray-400 hover:text-white"
                        title="Reset Project Files"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isCreatingFile && (
                    <form
                      onSubmit={handleCreateFile}
                      className="p-2 border-b border-matrix-border bg-matrix-card flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. helper.js"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full bg-matrix-dark border border-matrix-neonCyan rounded px-2 py-1 text-xs text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 rounded bg-matrix-accent text-matrix-dark font-bold text-[10px]"
                      >
                        Add
                      </button>
                    </form>
                  )}

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {files.map((file) => {
                      const isActive = file.name === activeFile?.name;
                      return (
                        <div
                          key={file.name}
                          onClick={() => {
                            soundEngine.playSfx("click");
                            if (!openTabs.includes(file.name)) {
                              setOpenTabs([...openTabs, file.name]);
                            }
                            setActiveFileName(file.name);
                          }}
                          className={`group px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isActive
                              ? "bg-matrix-neonCyan/15 border border-matrix-neonCyan/40 text-white font-bold"
                              : "text-gray-400 hover:bg-matrix-card hover:text-gray-200 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode className="w-3.5 h-3.5 text-matrix-neonCyan shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border uppercase ${getLanguageBadgeColor(
                                file.language
                              )}`}
                            >
                              {file.language === "javascript"
                                ? "js"
                                : file.language === "typescript"
                                ? "ts"
                                : file.language === "markdown"
                                ? "md"
                                : file.language}
                            </span>
                            {files.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file.name);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-matrix-neonRed p-0.5"
                                title={`Delete ${file.name}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sidebarTab === "search" && (
                <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto text-xs">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">
                    Search & Replace
                  </div>
                  <input
                    type="text"
                    placeholder="Find in files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-matrix-dark border border-matrix-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-matrix-neonCyan"
                  />
                  <input
                    type="text"
                    placeholder="Replace in active file..."
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    className="w-full bg-matrix-dark border border-matrix-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-matrix-neonCyan"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!activeFile || !searchTerm) return;
                        soundEngine.playSfx("click");
                        const next = activeFile.content.split(searchTerm).join(replaceTerm);
                        updateActiveFileContent(next);
                      }}
                      className="w-full py-1.5 rounded-lg bg-matrix-neonCyan/20 border border-matrix-neonCyan text-matrix-neonCyan font-bold text-[11px]"
                    >
                      Replace All in {activeFile?.name}
                    </button>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-gray-400">
                      {searchResults.length} matches across workspace
                    </div>
                    {searchResults.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!openTabs.includes(m.file)) setOpenTabs([...openTabs, m.file]);
                          setActiveFileName(m.file);
                        }}
                        className="w-full text-left p-2 rounded bg-matrix-card border border-matrix-border hover:border-matrix-neonCyan space-y-0.5"
                      >
                        <div className="text-[10px] font-bold text-matrix-neonCyan">
                          {m.file}:{m.line}
                        </div>
                        <div className="text-[11px] text-gray-300 truncate">{m.preview}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sidebarTab === "snippets" && (
                <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-y-auto text-xs">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">
                    1-Click Code Snippets
                  </div>
                  {CODE_SNIPPETS.map((snip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-matrix-card border border-matrix-border space-y-2"
                    >
                      <div className="font-bold text-white text-[11px]">{snip.title}</div>
                      <pre className="text-[10px] text-matrix-accent bg-black/50 p-2 rounded overflow-x-auto">
                        {snip.code}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          if (!activeFile) return;
                          soundEngine.playSfx("click");
                          updateActiveFileContent(
                            activeFile.content + "\n\n" + snip.code
                          );
                        }}
                        className="w-full py-1 rounded bg-matrix-accent/20 border border-matrix-accent/40 text-matrix-accent font-bold text-[10px] hover:bg-matrix-accent hover:text-matrix-dark transition-colors"
                      >
                        + Insert into {activeFile?.name}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Center + Right Split Area: Multi-Tab Code Editor & Live Browser Preview */}
          <div className="flex-1 min-w-0 flex flex-col lg:flex-row overflow-hidden">
            {/* Code Editor Pane */}
            {viewMode !== "preview" && (
              <div
                className={`flex-1 min-w-0 flex flex-col overflow-hidden ${
                  viewMode === "split" ? "lg:border-r border-matrix-border" : ""
                }`}
              >
                {/* Open File Tabs Bar */}
                <div className="bg-matrix-dark border-b border-matrix-border flex items-center overflow-x-auto">
                  {openTabs.map((tabName) => {
                    const tabFile = files.find((f) => f.name === tabName);
                    if (!tabFile) return null;
                    const isCurrent = tabFile.name === activeFile?.name;
                    return (
                      <div
                        key={tabName}
                        onClick={() => {
                          soundEngine.playSfx("click");
                          setActiveFileName(tabName);
                        }}
                        className={`px-3 py-2 border-r border-matrix-border flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                          isCurrent
                            ? "bg-matrix-card text-white font-bold border-t-2 border-t-matrix-neonCyan"
                            : "bg-matrix-dark text-gray-400 hover:text-gray-200 hover:bg-matrix-card/50"
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 text-matrix-neonCyan shrink-0" />
                        <span>{tabName}</span>
                        {openTabs.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const remaining = openTabs.filter((t) => t !== tabName);
                              setOpenTabs(remaining);
                              if (isCurrent && remaining.length > 0) {
                                setActiveFileName(remaining[remaining.length - 1]);
                              }
                            }}
                            className="text-gray-500 hover:text-white p-0.5 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Editor Breadcrumb & Settings Strip */}
                <div className="px-3 py-1.5 bg-matrix-card/70 border-b border-matrix-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>workspace</span>
                    <span>›</span>
                    <span className="text-matrix-neonCyan font-bold">
                      {activeFile?.name}
                    </span>
                    {savedToast && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-matrix-accent/20 text-matrix-accent text-[10px] font-bold">
                        Saved ✓
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setWordWrap((w) => !w)}
                      className={`px-2 py-0.5 rounded border text-[10px] whitespace-nowrap shrink-0 ${
                        wordWrap
                          ? "border-matrix-neonCyan/40 text-matrix-neonCyan bg-matrix-neonCyan/10"
                          : "border-matrix-border text-gray-400"
                      }`}
                    >
                      Wrap: {wordWrap ? "ON" : "OFF"}
                    </button>

                    <select
                      aria-label="Editor Font Size"
                      value={fontSize}
                      onChange={(e) =>
                        setFontSize(e.target.value as "text-xs" | "text-sm" | "text-base")
                      }
                      className="bg-matrix-dark border border-matrix-border rounded px-1.5 py-0.5 text-[10px] text-gray-300 outline-none"
                    >
                      <option value="text-xs">12px</option>
                      <option value="text-sm">14px</option>
                      <option value="text-base">16px</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeFile) return;
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(activeFile.content);
                        }
                        soundEngine.playSfx("click");
                        setCopiedToast(true);
                        setTimeout(() => setCopiedToast(false), 1500);
                      }}
                      className="px-2 py-0.5 rounded bg-matrix-dark hover:bg-matrix-card border border-matrix-border text-gray-300 hover:text-white flex items-center gap-1 text-[10px] whitespace-nowrap shrink-0"
                    >
                      {copiedToast ? (
                        <>
                          <Check className="w-3 h-3 text-matrix-accent" />
                          <span className="text-matrix-accent font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Line-Numbered Code Surface (Single Scrollbar via Synchronized Gutter) */}
                <div
                  className={`flex-1 bg-matrix-dark flex overflow-hidden ${fontSize} min-h-[260px]`}
                >
                  <div
                    ref={gutterRef}
                    aria-hidden="true"
                    className="select-none text-right py-3 pl-3 pr-2.5 border-r border-matrix-border/60 text-gray-600 leading-6 overflow-hidden shrink-0"
                  >
                    {(activeFile?.content || "").split("\n").map((_, idx) => (
                      <div
                        key={idx}
                        className={
                          cursorPos.ln === idx + 1 ? "text-matrix-neonCyan font-bold" : ""
                        }
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  <textarea
                    ref={editorRef}
                    value={activeFile?.content || ""}
                    onChange={(e) => {
                      updateActiveFileContent(e.target.value);
                      updateCursorMetrics(e.target);
                    }}
                    onScroll={(e) => {
                      if (gutterRef.current) {
                        gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                      }
                    }}
                    onClick={(e) => updateCursorMetrics(e.currentTarget)}
                    onKeyUp={(e) => updateCursorMetrics(e.currentTarget)}
                    spellCheck={false}
                    wrap={wordWrap ? "soft" : "off"}
                    placeholder="Write your code here..."
                    className={`w-full flex-1 h-full py-3 px-3 bg-transparent text-gray-100 outline-none resize-none font-mono leading-6 overflow-y-auto selection:bg-matrix-neonCyan/30 select-text ${
                      wordWrap ? "" : "overflow-x-auto whitespace-pre"
                    }`}
                    style={{ tabSize: 2 }}
                    onKeyDown={(e) => {
                      const target = e.currentTarget;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const val = activeFile?.content || "";

                      if (e.key === "Tab") {
                        e.preventDefault();
                        const next = val.substring(0, start) + "  " + val.substring(end);
                        updateActiveFileContent(next);
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = start + 2;
                        }, 0);
                      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                        e.preventDefault();
                        saveWorkspace(files, true);
                      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        handleRunProject();
                      } else if (
                        ["(", "{", "[", '"', "'"].includes(e.key) &&
                        start === end
                      ) {
                        const pairs: Record<string, string> = {
                          "(": ")",
                          "{": "}",
                          "[": "]",
                          '"': '"',
                          "'": "'",
                        };
                        const closing = pairs[e.key];
                        if (closing) {
                          e.preventDefault();
                          const next =
                            val.substring(0, start) +
                            e.key +
                            closing +
                            val.substring(end);
                          updateActiveFileContent(next);
                          setTimeout(() => {
                            target.selectionStart = target.selectionEnd = start + 1;
                          }, 0);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Right Pane: Live Browser Preview */}
            {viewMode !== "editor" && (
              <div className="flex-1 min-w-0 flex flex-col bg-matrix-dark overflow-hidden min-h-[260px]">
                {/* Simulated Browser Chrome Bar */}
                <div className="px-3 py-1.5 bg-matrix-card border-b border-matrix-border flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-matrix-accent animate-pulse shrink-0" />
                    <span className="px-2.5 py-0.5 rounded bg-matrix-dark border border-matrix-border text-[11px] text-gray-300 truncate">
                      http://localhost:3000/preview/{activeFile?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewportDevice("desktop")}
                      className={`p-1 rounded ${
                        viewportDevice === "desktop"
                          ? "bg-matrix-neonCyan/20 text-matrix-neonCyan"
                          : "text-gray-400 hover:text-white"
                      }`}
                      title="Desktop Viewport (100%)"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportDevice("tablet")}
                      className={`p-1 rounded ${
                        viewportDevice === "tablet"
                          ? "bg-matrix-neonCyan/20 text-matrix-neonCyan"
                          : "text-gray-400 hover:text-white"
                      }`}
                      title="Tablet Viewport (768px)"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportDevice("mobile")}
                      className={`p-1 rounded ${
                        viewportDevice === "mobile"
                          ? "bg-matrix-neonCyan/20 text-matrix-neonCyan"
                          : "text-gray-400 hover:text-white"
                      }`}
                      title="Mobile Viewport (375px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRunProject}
                      className="p-1 rounded text-gray-400 hover:text-white ml-1"
                      title="Reload Live Preview"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Sandboxed Iframe Container */}
                <div
                  className={`flex-1 bg-black/50 p-2 flex items-stretch justify-center ${
                    viewportDevice === "desktop" ? "overflow-hidden" : "overflow-x-auto overflow-y-hidden"
                  }`}
                >
                  <div
                    className={`bg-matrix-dark rounded-lg overflow-hidden border border-matrix-border/70 transition-all h-full ${
                      viewportDevice === "mobile"
                        ? "w-[375px]"
                        : viewportDevice === "tablet"
                        ? "w-[768px]"
                        : "w-full"
                    }`}
                  >
                    <iframe
                      key={previewVersion}
                      title="Matrix IDE Live Preview"
                      sandbox="allow-scripts"
                      srcDoc={bundledSrcDoc}
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Panel: Integrated Terminal, Live Console & Linter Problems */}
        <div className="border-t border-matrix-border bg-matrix-dark flex flex-col">
          <div className="px-3 py-1.5 bg-matrix-card/90 border-b border-matrix-border flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setBottomPanelOpen(true);
                  setBottomTab("console");
                }}
                className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  bottomPanelOpen && bottomTab === "console"
                    ? "bg-matrix-neonCyan/20 text-matrix-neonCyan border border-matrix-neonCyan/40"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span>CONSOLE ({consoleLogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBottomPanelOpen(true);
                  setBottomTab("terminal");
                }}
                className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  bottomPanelOpen && bottomTab === "terminal"
                    ? "bg-matrix-accent/20 text-matrix-accent border border-matrix-accent/40"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3 h-3 shrink-0" />
                <span>TERMINAL (matrix-sh)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBottomPanelOpen(true);
                  setBottomTab("problems");
                }}
                className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  bottomPanelOpen && bottomTab === "problems"
                    ? "bg-matrix-neonGold/20 text-matrix-neonGold border border-matrix-neonGold/40"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>PROBLEMS ({diagnostics.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {bottomPanelOpen && bottomTab === "console" && (
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-matrix-dark border border-matrix-border"
                >
                  Clear Console
                </button>
              )}
              <button
                type="button"
                onClick={() => setBottomPanelOpen((prev) => !prev)}
                className="text-gray-400 hover:text-white p-1"
                title={bottomPanelOpen ? "Minimize Panel" : "Expand Panel"}
              >
                {bottomPanelOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {bottomPanelOpen && (
            <div className="h-40 overflow-y-auto p-3 text-xs font-mono space-y-1.5 select-text">
              {bottomTab === "console" && (
                <div className="space-y-1">
                  {consoleLogs.length === 0 ? (
                    <div className="text-gray-500 italic">
                      Console is clean. Use console.log() in your JS/TS files and press Run & Preview.
                    </div>
                  ) : (
                    consoleLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className={`px-2.5 py-1 rounded border flex items-start justify-between gap-3 ${
                          entry.level === "error"
                            ? "bg-red-950/30 border-red-800/50 text-matrix-neonRed"
                            : entry.level === "warn"
                            ? "bg-amber-950/30 border-amber-800/50 text-amber-300"
                            : entry.level === "system"
                            ? "bg-matrix-card/60 border-matrix-border text-matrix-neonCyan"
                            : "bg-black/40 border-matrix-border/50 text-matrix-accent"
                        }`}
                      >
                        <span className="whitespace-pre-wrap break-all">{entry.text}</span>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">
                          {entry.timestamp}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {bottomTab === "terminal" && (
                <div className="space-y-1.5">
                  {terminalHistory.map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith("$")
                          ? "text-matrix-neonCyan font-bold"
                          : line.startsWith("RuntimeError")
                          ? "text-matrix-neonRed"
                          : "text-gray-300 whitespace-pre-wrap"
                      }
                    >
                      {line}
                    </div>
                  ))}
                  <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-1">
                    <span className="text-matrix-accent font-bold shrink-0">
                      operator@matrix-ide:~$
                    </span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Type a command (help, ls, node app.js, cat index.html, clear)..."
                      className="w-full bg-transparent text-white outline-none text-xs font-mono"
                    />
                  </form>
                </div>
              )}

              {bottomTab === "problems" && (
                <div className="space-y-1.5">
                  {diagnostics.length === 0 ? (
                    <div className="flex items-center gap-2 text-matrix-accent">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>No static analysis problems detected across workspace files.</span>
                    </div>
                  ) : (
                    diagnostics.map((d, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!openTabs.includes(d.file)) setOpenTabs([...openTabs, d.file]);
                          setActiveFileName(d.file);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded bg-matrix-card border border-matrix-border hover:border-matrix-neonGold flex items-center justify-between gap-2"
                      >
                        <span className="text-amber-300 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{d.message}</span>
                        </span>
                        <span className="text-[10px] text-matrix-neonCyan whitespace-nowrap shrink-0">
                          {d.file}:{d.line}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* VS Code Bottom Status Bar */}
        <div className="px-3 py-1 bg-matrix-card border-t border-matrix-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="text-matrix-neonCyan font-bold whitespace-nowrap">
              ⎇ main*
            </span>
            <span className="whitespace-nowrap">
              ⚠ {diagnostics.length} {diagnostics.length === 1 ? "Problem" : "Problems"}
            </span>
            <span className="hidden sm:inline whitespace-nowrap text-matrix-accent">
              ● Auto-Saved (LocalStorage)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap">
              Ln {cursorPos.ln}, Col {cursorPos.col}
            </span>
            <span className="hidden sm:inline whitespace-nowrap">Spaces: 2</span>
            <span className="hidden sm:inline whitespace-nowrap">UTF-8</span>
            <span className="text-white font-bold uppercase whitespace-nowrap">
              {activeFile?.language || "TEXT"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
