"use client";

import React, { useState } from "react";
import Link from "next/link";
import { soundEngine } from "@/lib/soundEngine";
import { useGameStore } from "@/lib/gameStore";
import { REALMS } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import {
  BookOpen,
  ArrowLeft,
  Search,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Play,
  ListChecks,
  Award,
  Maximize2,
  Minimize2,
  Terminal,
} from "lucide-react";
import { detectFileLanguage } from "@/lib/ideBundler";

export interface DocFile {
  filename: string;
  title: string;
  content: string;
}

interface Props {
  docs: DocFile[];
  initialFile?: string;
}

// Inline formatting helper for bold, inline code, and links
function formatInlineText(
  text: string,
  onSelectDoc?: (filename: string) => void
): React.ReactNode[] {
  // Split tokens by code, bold, link
  const parts: React.ReactNode[] = [];
  // Regex to match `code`, **bold**, or [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-matrix-dark border border-matrix-border text-matrix-neonCyan font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="text-white font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const closingBracket = token.indexOf("]");
      const linkText = token.slice(1, closingBracket);
      const url = token.slice(closingBracket + 2, -1);

      if (url.endsWith(".md") && onSelectDoc) {
        parts.push(
          <button
            type="button"
            key={match.index}
            onClick={() => {
              soundEngine.playSfx("click");
              onSelectDoc(url);
            }}
            className="text-matrix-neonCyan hover:underline hover:text-white font-bold cursor-pointer"
          >
            {linkText}
          </button>
        );
      } else if (url.startsWith("#")) {
        parts.push(
          <a
            key={match.index}
            href={url}
            className="text-matrix-neonCyan hover:underline hover:text-white"
          >
            {linkText}
          </a>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-matrix-neonCyan hover:underline hover:text-white"
          >
            {linkText}
          </a>
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function RichMarkdownViewer({
  content,
  docId,
  checkedBoxes,
  onToggleBox,
  onSelectDoc,
}: {
  content: string;
  docId: string;
  checkedBoxes: Record<string, boolean>;
  onToggleBox: (key: string) => void;
  onSelectDoc: (filename: string) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushCodeBlock = (key: string | number) => {
    if (codeBlockLines.length > 0) {
      const snippetText = codeBlockLines.join("\n");
      const blockId = `${docId}-code-${key}`;
      const isCopied = copiedKey === blockId;

      elements.push(
        <div
          key={blockId}
          className="my-4 rounded-xl border border-matrix-border bg-matrix-dark overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-matrix-border bg-matrix-card/80 text-[11px] font-mono text-gray-400">
            <span className="text-matrix-neonCyan uppercase font-bold">
              {codeBlockLang || "CODE"}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  try {
                    const extMap: Record<string, string> = {
                      html: "html",
                      css: "css",
                      js: "js",
                      javascript: "js",
                      ts: "ts",
                      typescript: "ts",
                      sql: "sql",
                      json: "json",
                      bash: "sh",
                      sh: "sh",
                    };
                    const ext = extMap[(codeBlockLang || "").toLowerCase()] || "js";
                    const fileName = `curriculum-${docId.replace(/\.md$/, "")}.${ext}`;
                    const lang = detectFileLanguage(fileName);
                    const raw = localStorage.getItem("devquest-online-ide-workspace-v1");
                    let currentFiles = [];
                    if (raw) {
                      try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed.files)) currentFiles = parsed.files;
                      } catch {}
                    }
                    const updated = [
                      { name: fileName, language: lang, content: snippetText },
                      ...currentFiles.filter((f: { name: string }) => f.name !== fileName),
                    ];
                    localStorage.setItem(
                      "devquest-online-ide-workspace-v1",
                      JSON.stringify({ files: updated, activeFileName: fileName })
                    );
                    window.location.href = "/ide";
                  } catch {
                    window.location.href = "/ide";
                  }
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-matrix-neonPurple/20 hover:bg-matrix-neonPurple/30 border border-matrix-neonPurple/40 text-matrix-neonPurple hover:text-white text-[10px] transition-colors cursor-pointer"
                title="Load this snippet into Matrix Studio IDE and execute it"
              >
                <Terminal className="w-3 h-3" />
                <span>Open in IDE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(snippetText);
                  }
                  soundEngine.playSfx("click");
                  setCopiedKey(blockId);
                  setTimeout(() => setCopiedKey(null), 1500);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-matrix-dark hover:bg-matrix-card border border-matrix-border text-gray-300 hover:text-white text-[10px] transition-colors cursor-pointer"
              >
                {isCopied ? (
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
          <pre className="p-4 overflow-x-auto font-mono text-xs text-matrix-accent leading-relaxed select-text">
            <code>{snippetText}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
    }
  };

  const flushTable = (key: string | number) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[ -:]+$/)));

      elements.push(
        <div
          key={`table-${key}`}
          className="my-4 overflow-x-auto rounded-xl border border-matrix-border shadow-md"
        >
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-matrix-dark border-b border-matrix-border text-matrix-neonCyan font-bold">
                {headerRow.map((col, idx) => (
                  <th key={idx} className="p-3 border-r border-matrix-border/50 last:border-r-0">
                    {formatInlineText(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-matrix-border/40">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-matrix-cardHover/50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-3 border-r border-matrix-border/30 last:border-r-0 text-gray-300"
                    >
                      {formatInlineText(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block Toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock(i);
        inCodeBlock = false;
      } else {
        if (inTable) flushTable(i);
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Markdown Table Row
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-6 border-matrix-border" />);
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="text-2xl font-bold font-mono text-white mt-8 mb-4 pb-2 border-b border-matrix-border flex items-center gap-2"
        >
          <span className="text-matrix-neonCyan">#</span>
          {formatInlineText(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      const headingText = line.slice(3);
      const idSlug = slugifyHeading(headingText);
      elements.push(
        <h2
          id={idSlug}
          key={i}
          className="text-xl font-bold font-mono text-matrix-accent mt-6 mb-3 flex items-center gap-2 scroll-mt-6"
        >
          <span className="text-matrix-accent/60">##</span>
          {formatInlineText(headingText, onSelectDoc)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-base font-bold font-mono text-matrix-neonCyan mt-5 mb-2 flex items-center gap-2"
        >
          <span className="text-matrix-neonCyan/60">###</span>
          {formatInlineText(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-bold font-mono text-gray-200 mt-4 mb-2">
          {formatInlineText(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      elements.push(
        <blockquote
          key={i}
          className="my-3.5 pl-4 py-2.5 border-l-2 border-matrix-neonCyan bg-matrix-card/60 rounded-r-xl font-sans text-xs sm:text-sm italic text-gray-200 leading-relaxed"
        >
          {formatInlineText(line.slice(1).trim())}
        </blockquote>
      );
      continue;
    }

    // Interactive Task Checkbox List Item (- [ ] or - [x])
    const checkboxMatch = line.trim().match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (checkboxMatch) {
      const boxKey = `${docId}-line-${i}`;
      const defaultChecked = checkboxMatch[1].toLowerCase() === "x";
      const isChecked = checkedBoxes[boxKey] ?? defaultChecked;
      const labelContent = checkboxMatch[2];

      elements.push(
        <div
          key={i}
          onClick={() => {
            soundEngine.playSfx("click");
            onToggleBox(boxKey);
          }}
          className={`my-2 p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer font-sans text-xs sm:text-sm ${
            isChecked
              ? "bg-matrix-accent/10 border-matrix-accent/40 text-gray-300"
              : "bg-matrix-dark/50 border-matrix-border/70 hover:border-matrix-neonCyan/50 hover:bg-matrix-dark/80 text-gray-200"
          }`}
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              isChecked
                ? "bg-matrix-accent border-matrix-accent text-matrix-dark"
                : "bg-matrix-card border-gray-600"
            }`}
          >
            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className={isChecked ? "line-through text-gray-400" : "text-gray-200"}>
            {formatInlineText(labelContent, onSelectDoc)}
          </span>
        </div>
      );
      continue;
    }

    // Unordered List item
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const bulletContent = line.trim().slice(2);
      elements.push(
        <li
          key={i}
          className="ml-5 list-disc text-xs sm:text-sm font-sans text-gray-200 my-1.5 leading-relaxed"
        >
          {formatInlineText(bulletContent, onSelectDoc)}
        </li>
      );
      continue;
    }

    // Ordered List item
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div key={i} className="ml-4 flex items-start gap-2.5 text-xs sm:text-sm font-sans text-gray-200 my-1.5 leading-relaxed">
          <span className="text-matrix-neonCyan font-mono font-bold">{orderedMatch[1]}.</span>
          <span>{formatInlineText(orderedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // Default paragraph
    elements.push(
      <p key={i} className="text-xs sm:text-sm font-sans leading-relaxed text-gray-200 my-2.5">
        {formatInlineText(line)}
      </p>
    );
  }

  if (inCodeBlock) flushCodeBlock("end");
  if (inTable) flushTable("end");

  return <div className="space-y-1">{elements}</div>;
}

export function CurriculumViewer({ docs, initialFile }: Props) {
  const {
    completedCurriculumTasks = [],
    completedChapters = [],
    toggleCurriculumTask,
    completeChapter,
  } = useGameStore();

  const [selectedFile, setSelectedFile] = useState<string>(() => {
    if (initialFile && docs.some((d) => d.filename === initialFile)) {
      return initialFile;
    }
    return docs[0]?.filename || "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [focusReader, setFocusReader] = useState(false);

  const checkedBoxes = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const key of completedCurriculumTasks) {
      map[key] = true;
    }
    return map;
  }, [completedCurriculumTasks]);

  React.useEffect(() => {
    if (initialFile && docs.some((d) => d.filename === initialFile)) {
      setSelectedFile(initialFile);
    }
  }, [initialFile, docs]);

  const activeDoc = docs.find((d) => d.filename === selectedFile) || docs[0];
  const matchingRealm = REALMS.find((r) => r.fileRef === activeDoc?.filename);
  const firstQuestId = matchingRealm ? QUESTS[matchingRealm.id]?.[0]?.id : undefined;
  const isChapterMastered = activeDoc ? completedChapters.includes(activeDoc.filename) : false;

  // Extract ## headings for quick section jump bar
  const sectionHeadings = React.useMemo(() => {
    if (!activeDoc) return [];
    return activeDoc.content
      .split("\n")
      .filter((line) => line.startsWith("## "))
      .map((line) => {
        const title = line.slice(3).trim();
        return { title, id: slugifyHeading(title) };
      });
  }, [activeDoc]);

  // Count interactive checkboxes in current document
  const totalCheckboxes = React.useMemo(() => {
    if (!activeDoc) return 0;
    return activeDoc.content
      .split("\n")
      .filter((l) => /^[-*]\s+\[[ xX]\]\s+/.test(l.trim())).length;
  }, [activeDoc]);

  const completedCheckboxesCount = React.useMemo(() => {
    if (!activeDoc) return 0;
    return Object.entries(checkedBoxes).filter(
      ([k, val]) => k.startsWith(`${activeDoc.filename}-line-`) && val
    ).length;
  }, [activeDoc, checkedBoxes]);

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-3 sm:px-6 flex flex-col gap-3 min-h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-3.5rem)] pb-24 md:pb-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-matrix-border">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors shrink-0"
            onClick={() => soundEngine.playSfx("click")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-matrix-neonCyan shrink-0" />
              Curriculum Knowledge Vault
            </h1>
            <p className="text-xs text-gray-400">
              Complete reference documentation, concept deep-dives, and capstone specifications •{" "}
              <span className="text-matrix-accent font-mono font-bold whitespace-nowrap">
                {completedChapters.length}/{docs.length} Chapters Mastered
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-lg bg-matrix-accent/10 border border-matrix-accent/40 text-matrix-accent font-mono text-xs font-bold hover:bg-matrix-accent/20 transition-all whitespace-nowrap shrink-0"
        >
          Return to Game Map
        </Link>
      </div>

      {/* Mobile Chapter Picker (< md) */}
      <div className="md:hidden bg-matrix-card border border-matrix-border rounded-xl p-2.5 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-matrix-neonCyan shrink-0" />
        <select
          value={selectedFile}
          onChange={(e) => {
            soundEngine.playSfx("click");
            setSelectedFile(e.target.value);
          }}
          className="w-full bg-matrix-dark border border-matrix-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-matrix-neonCyan font-mono"
        >
          {docs.map((doc) => (
            <option key={doc.filename} value={doc.filename}>
              {completedChapters.includes(doc.filename) ? "✓ " : ""}{doc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Split: Left Sidebar File Nav, Right Markdown Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Sidebar: File List */}
        <div
          className={`bg-matrix-card border border-matrix-border rounded-xl p-3.5 flex-col gap-3 overflow-hidden ${
            focusReader ? "hidden" : "hidden md:flex md:col-span-4 lg:col-span-3"
          }`}
        >
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-matrix-dark border border-matrix-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-matrix-neonCyan font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = doc.filename === selectedFile;
              const isMastered = completedChapters.includes(doc.filename);

              return (
                <button
                  key={doc.filename}
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setSelectedFile(doc.filename);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-matrix-accent/20 border border-matrix-accent text-matrix-accent font-bold"
                      : "text-gray-300 hover:bg-matrix-dark hover:text-white"
                  }`}
                >
                  <span className="truncate">{doc.title}</span>
                  {isMastered ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-matrix-accent ml-2" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-60 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content: Document Reader */}
        <div
          key={activeDoc.filename}
          className={`bg-matrix-card border border-matrix-border rounded-xl p-5 sm:p-7 overflow-y-auto space-y-5 animate-fadeIn ${
            focusReader ? "md:col-span-12" : "md:col-span-8 lg:col-span-9"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-matrix-border font-mono text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setFocusReader((prev) => !prev);
                }}
                className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-matrix-dark hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors cursor-pointer"
                title={focusReader ? "Show Chapters Sidebar" : "Maximize Reader (Full Width)"}
              >
                {focusReader ? (
                  <>
                    <Minimize2 className="w-3 h-3 text-matrix-neonCyan" />
                    <span>Chapters</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3 text-matrix-neonCyan" />
                    <span>Maximize</span>
                  </>
                )}
              </button>
              <span className="px-2 py-0.5 rounded bg-matrix-dark border border-matrix-border text-matrix-neonCyan font-bold">
                {activeDoc.filename}
              </span>
              <span className="text-white font-bold font-sans text-sm">{activeDoc.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {totalCheckboxes > 0 && (
                <span
                  className="px-2.5 py-1 rounded-lg bg-matrix-dark border border-matrix-border text-matrix-accent flex items-center gap-1.5 text-[11px] font-bold"
                  title="Each completed hands-on task awards +10 XP"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  Tasks: {completedCheckboxesCount}/{totalCheckboxes} (+10 XP ea)
                </span>
              )}

              <button
                type="button"
                disabled={isChapterMastered}
                onClick={() => completeChapter(activeDoc.filename, 50)}
                className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all ${
                  isChapterMastered
                    ? "bg-matrix-accent/15 border-matrix-accent/50 text-matrix-accent cursor-default"
                    : "bg-matrix-neonGold/15 hover:bg-matrix-neonGold/25 border-matrix-neonGold/50 text-matrix-neonGold cursor-pointer"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isChapterMastered ? "Chapter Mastered ✓" : "Complete Chapter (+50 XP)"}</span>
              </button>

              {matchingRealm && firstQuestId && (
                <Link
                  href={`/quest/${matchingRealm.id}/${firstQuestId}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className="px-3 py-1 rounded-lg bg-matrix-accent text-matrix-dark font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <Play className="w-3 h-3 fill-matrix-dark" />
                  <span>Practice Realm Quests</span>
                </Link>
              )}
            </div>
          </div>

          {/* Section Table of Contents Jump Bar */}
          {sectionHeadings.length > 0 && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-matrix-dark/70 border border-matrix-border font-mono text-[11px] overflow-x-auto scrollbar-none whitespace-nowrap select-none">
              <span className="text-gray-500 uppercase font-bold mr-1 shrink-0">Jump to:</span>
              {sectionHeadings.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className="px-2 py-1 rounded bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border hover:border-matrix-neonCyan text-gray-300 hover:text-matrix-neonCyan transition-colors shrink-0"
                >
                  {sec.title}
                </a>
              ))}
            </div>
          )}

          <div className="text-xs sm:text-sm select-text">
            <RichMarkdownViewer
              content={activeDoc.content}
              docId={activeDoc.filename}
              checkedBoxes={checkedBoxes}
              onToggleBox={(boxKey) => toggleCurriculumTask(boxKey)}
              onSelectDoc={(filename) => {
                const aliasMap: Record<string, string> = {
                  "00-README.md": "00-curriculum-overview.md",
                  "01-html.md": "01-html-and-semantics.md",
                  "02-css.md": "02-css-layout-and-styling.md",
                  "03-javascript.md": "03-modern-javascript.md",
                  "04-typescript.md": "04-strict-typescript.md",
                  "07-databases.md": "07-databases-and-sql.md",
                };
                const target = aliasMap[filename] || filename;
                if (docs.some((d) => d.filename === target)) {
                  setSelectedFile(target);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
