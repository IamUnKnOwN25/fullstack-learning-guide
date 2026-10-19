"use client";

import React, { useState } from "react";
import Link from "next/link";
import { soundEngine } from "@/lib/audio";
import { BookOpen, ArrowLeft, Search, FileText, CheckCircle2 } from "lucide-react";

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
function formatInlineText(text: string): React.ReactNode[] {
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

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function RichMarkdownViewer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushCodeBlock = (key: string | number) => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <div
          key={`code-${key}`}
          className="my-4 rounded-xl border border-matrix-border bg-matrix-dark overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-matrix-border bg-matrix-card/80 text-[11px] font-mono text-gray-400">
            <span className="text-matrix-neonCyan uppercase font-bold">
              {codeBlockLang || "CODE"}
            </span>
            <span className="text-gray-500 text-[10px]">TERMINAL SNIPPET</span>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-xs text-matrix-accent leading-relaxed select-text">
            <code>{codeBlockLines.join("\n")}</code>
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
      elements.push(
        <h2
          key={i}
          className="text-xl font-bold font-mono text-matrix-accent mt-6 mb-3 flex items-center gap-2"
        >
          <span className="text-matrix-accent/60">##</span>
          {formatInlineText(line.slice(3))}
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
          className="my-3 pl-4 py-2 border-l-2 border-matrix-neonCyan bg-matrix-card/60 rounded-r-lg font-mono text-xs italic text-gray-300"
        >
          {formatInlineText(line.slice(1).trim())}
        </blockquote>
      );
      continue;
    }

    // Unordered List item
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const bulletContent = line.trim().slice(2);
      elements.push(
        <li
          key={i}
          className="ml-5 list-disc text-xs sm:text-sm font-mono text-gray-300 my-1 leading-relaxed"
        >
          {formatInlineText(bulletContent)}
        </li>
      );
      continue;
    }

    // Ordered List item
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div key={i} className="ml-4 flex items-start gap-2 text-xs sm:text-sm font-mono text-gray-300 my-1 leading-relaxed">
          <span className="text-matrix-neonCyan font-bold">{orderedMatch[1]}.</span>
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
      <p key={i} className="text-xs sm:text-sm font-mono leading-relaxed text-gray-300 my-2">
        {formatInlineText(line)}
      </p>
    );
  }

  if (inCodeBlock) flushCodeBlock("end");
  if (inTable) flushTable("end");

  return <div className="space-y-1">{elements}</div>;
}

export function CurriculumViewer({ docs, initialFile }: Props) {
  const [selectedFile, setSelectedFile] = useState<string>(() => {
    if (initialFile && docs.some((d) => d.filename === initialFile)) {
      return initialFile;
    }
    return docs[0]?.filename || "";
  });
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    if (initialFile && docs.some((d) => d.filename === initialFile)) {
      setSelectedFile(initialFile);
    }
  }, [initialFile, docs]);

  const activeDoc = docs.find((d) => d.filename === selectedFile) || docs[0];

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6 h-[calc(100vh-4.5rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-matrix-border">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors"
            onClick={() => soundEngine.playSfx("click")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-matrix-neonCyan" />
              Curriculum Knowledge Vault
            </h1>
            <p className="text-xs text-gray-400">
              Complete reference documentation, concept deep-dives, and capstone specifications
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-lg bg-matrix-accent/10 border border-matrix-accent/40 text-matrix-accent font-mono text-xs font-bold hover:bg-matrix-accent/20 transition-all"
        >
          Return to Game Map
        </Link>
      </div>

      {/* Main Split: Left Sidebar File Nav, Right Markdown Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Sidebar: File List */}
        <div className="md:col-span-1 bg-matrix-card border border-matrix-border rounded-xl p-4 flex flex-col gap-3 overflow-hidden">
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
                  <FileText className="w-3.5 h-3.5 shrink-0 opacity-60 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content: Document Reader */}
        <div className="md:col-span-3 bg-matrix-card border border-matrix-border rounded-xl p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-matrix-border font-mono text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-matrix-dark border border-matrix-border text-matrix-neonCyan font-bold">
                {activeDoc.filename}
              </span>
              <span>{activeDoc.title}</span>
            </div>
            <span className="text-matrix-neonCyan text-[11px] hidden sm:inline">
              READ-ONLY CURRICULUM ARCHIVE
            </span>
          </div>

          <div className="text-xs sm:text-sm select-text">
            <RichMarkdownViewer content={activeDoc.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
