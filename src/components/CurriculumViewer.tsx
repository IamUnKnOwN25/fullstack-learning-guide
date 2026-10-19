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
}

export function CurriculumViewer({ docs }: Props) {
  const [selectedFile, setSelectedFile] = useState<string>(docs[0]?.filename || "");
  const [searchQuery, setSearchQuery] = useState("");

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
            <span>FILE: {activeDoc.filename}</span>
            <span className="text-matrix-neonCyan">READ-ONLY CURRICULUM ARCHIVE</span>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-300 select-text">
            {activeDoc.content}
          </div>
        </div>
      </div>
    </div>
  );
}
