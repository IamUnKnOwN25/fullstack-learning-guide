"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Quest } from "@/data/quests";
import { useGameStore } from "@/lib/store";
import { soundEngine } from "@/lib/audio";
import {
  Sparkles,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Code,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface Props {
  quest: Quest;
  nextQuestId?: string;
  realmId: string;
}

export function DualPaneWorkspace({ quest, nextQuestId, realmId }: Props) {
  const { completeQuest, completedQuests, stars } = useGameStore();

  const [code, setCode] = useState(quest.starterCode);
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "terminal">("editor");
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [testResult, setTestResult] = useState<{
    passed?: boolean;
    message?: string;
  } | null>(null);

  const isCompleted = completedQuests.includes(quest.id);

  // Sync state if quest changes
  useEffect(() => {
    setCode(quest.starterCode);
    setTestResult(null);
    setShowHintIndex(-1);
    setActiveTab("editor");
  }, [quest]);

  // Execute Code & Run Test Suite
  const handleRunCode = () => {
    soundEngine.playSfx("attack");
    const result = quest.testRunner(code);

    if (result.passed) {
      soundEngine.playSfx("correct");
      // Calculate stars: 3 stars if 0 hints, 2 if 1 hint, 1 if multiple hints
      const earnedStars = showHintIndex === -1 ? 3 : showHintIndex === 0 ? 2 : 1;
      completeQuest(quest.id, quest.realmId, earnedStars, quest.xpReward);

      // Trigger victory fanfare confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00ff9d", "#00e5ff", "#f59e0b"],
      });

      setTestResult({
        passed: true,
        message: result.message,
      });
    } else {
      soundEngine.playSfx("error");
      setTestResult({
        passed: false,
        message: result.message,
      });
    }

    setActiveTab("terminal");
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6 h-[calc(100vh-4.5rem)]">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-matrix-border">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors"
            onClick={() => soundEngine.playSfx("click")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <span className="text-[10px] font-mono uppercase text-matrix-neonCyan tracking-wider">
              {quest.realmId.toUpperCase()} REALM • TRIAL {quest.order}
            </span>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {quest.title}
              {isCompleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-accent/20 text-matrix-accent flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-matrix-neonGold px-3 py-1 rounded-full bg-matrix-neonGold/10 border border-matrix-neonGold/30">
            +{quest.xpReward} XP
          </span>

          {nextQuestId && isCompleted && (
            <Link
              href={`/quest/${realmId}/${nextQuestId}`}
              className="px-3.5 py-1.5 rounded-lg bg-matrix-accent hover:bg-matrix-accentDark text-matrix-dark font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
              onClick={() => soundEngine.playSfx("click")}
            >
              Next Quest
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Dual Pane Grid: 50% Left Briefing, 50% Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Pane: Story, Concepts, Checklist, Hints */}
        <div className="bg-matrix-card border border-matrix-border rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-matrix-border bg-matrix-dark/50 flex items-center gap-2 font-mono text-xs text-gray-300">
            <Terminal className="w-4 h-4 text-matrix-accent" />
            <span>MISSION DIRECTIVE</span>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-300">
            {/* Story Dialogue */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-matrix-neonCyan/10 to-matrix-dark border border-matrix-neonCyan/30 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-matrix-neonCyan font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                BYTE (AI COMPANION DROID)
              </div>
              <p className="italic text-xs text-gray-200 leading-relaxed font-mono">
                &ldquo;{quest.storyIntro}&rdquo;
              </p>
            </div>

            {/* Core Concept Briefing */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-matrix-accent font-bold">
                Core Concept
              </h3>
              <p className="text-xs leading-relaxed text-gray-300 bg-matrix-dark/40 p-3.5 rounded-xl border border-matrix-border">
                {quest.conceptSummary}
              </p>
            </div>

            {/* Task Objectives Checklist */}
            <div className="space-y-2.5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-matrix-neonGold font-bold">
                Objectives Checklist
              </h3>
              <div className="space-y-2">
                {quest.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs bg-matrix-dark/30 p-2.5 rounded-lg border border-matrix-border/70"
                  >
                    <div className="w-4 h-4 rounded bg-matrix-card border border-matrix-border text-matrix-accent flex items-center justify-center shrink-0 mt-0.5">
                      {isCompleted ? <CheckCircle2 className="w-3 h-3 text-matrix-accent" /> : <span className="text-[9px]">{idx + 1}</span>}
                    </div>
                    <span className="text-gray-200">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints Accordion */}
            <div className="pt-2 border-t border-matrix-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-matrix-neonPurple" />
                  Need Tactical Support?
                </span>

                {showHintIndex < quest.hints.length - 1 && (
                  <button
                    onClick={() => {
                      soundEngine.playSfx("click");
                      setShowHintIndex((prev) => prev + 1);
                    }}
                    className="text-xs font-mono text-matrix-neonPurple hover:underline cursor-pointer"
                  >
                    Reveal Hint ({showHintIndex + 2}/{quest.hints.length})
                  </button>
                )}
              </div>

              {showHintIndex >= 0 && (
                <div className="space-y-2">
                  {quest.hints.slice(0, showHintIndex + 1).map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-matrix-neonPurple/10 border border-matrix-neonPurple/30 font-mono text-xs text-gray-200 whitespace-pre-wrap"
                    >
                      <span className="text-matrix-neonPurple font-bold block mb-1">
                        Hint {idx + 1}:
                      </span>
                      {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cast Code Spell Action Bar */}
          <div className="p-4 border-t border-matrix-border bg-matrix-dark/80 flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playSfx("click");
                setCode(quest.starterCode);
                setTestResult(null);
              }}
              className="px-3 py-2 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Reset code to starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              onClick={handleRunCode}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-matrix-accent to-matrix-neonCyan text-matrix-dark font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-matrix-accent/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-matrix-dark" />
              Cast Spell & Verify Code
            </button>
          </div>
        </div>

        {/* Right Pane: Code Editor + Live Preview + Terminal */}
        <div className="bg-matrix-card border border-matrix-border rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Workspace Tab Header */}
          <div className="px-4 py-2 border-b border-matrix-border bg-matrix-dark/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("editor");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === "editor"
                    ? "bg-matrix-accent/20 border border-matrix-accent text-matrix-accent shadow-sm shadow-matrix-accent/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Code Editor
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("preview");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === "preview"
                    ? "bg-matrix-neonCyan/20 border border-matrix-neonCyan text-matrix-neonCyan shadow-sm shadow-matrix-neonCyan/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("terminal");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === "terminal"
                    ? "bg-matrix-neonGold/20 border border-matrix-neonGold text-matrix-neonGold shadow-sm shadow-matrix-neonGold/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Matrix Terminal
                {testResult && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      testResult.passed ? "bg-matrix-accent" : "bg-matrix-neonRed"
                    }`}
                  />
                )}
              </button>
            </div>

            <span className="font-mono text-[10px] uppercase text-gray-500">
              {quest.language.toUpperCase()} ENGINE
            </span>
          </div>

          {/* Tab 1: Code Editor */}
          {activeTab === "editor" && (
            <div className="flex-1 p-4 bg-matrix-dark flex flex-col font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Type your code solution here..."
                spellCheck={false}
                className="w-full flex-1 bg-transparent text-gray-200 outline-none resize-none font-mono leading-relaxed selection:bg-matrix-accent/30 selection:text-white"
                style={{ tabSize: 2 }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    setCode(code.substring(0, start) + "  " + code.substring(end));
                    setTimeout(() => {
                      target.selectionStart = target.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
              />
            </div>
          )}

          {/* Tab 2: Sandboxed Live Preview */}
          {activeTab === "preview" && (
            <div className="flex-1 bg-white p-2 flex flex-col">
              <iframe
                title="Live Sandboxed Output"
                sandbox="allow-scripts"
                srcDoc={
                  quest.previewType === "html"
                    ? code
                    : `<html style="background:#0a0e17;color:#fff;font-family:monospace;padding:16px;">
                        <body>
                          <h3>Console output:</h3>
                          <script>
                            try {
                              ${code}
                            } catch(e) {
                              document.body.innerHTML += '<p style="color:#ef4444">' + e.message + '</p>';
                            }
                          </script>
                        </body>
                      </html>`
                }
                className="w-full h-full border-none rounded-lg"
              />
            </div>
          )}

          {/* Tab 3: Matrix Terminal & Assertion Report */}
          {activeTab === "terminal" && (
            <div className="flex-1 p-6 bg-matrix-dark font-mono text-xs flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-matrix-neonCyan pb-2 border-b border-matrix-border">
                <Terminal className="w-4 h-4" />
                <span>TERMINAL TEST RUNNER OUTPUT</span>
              </div>

              {testResult ? (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    testResult.passed
                      ? "bg-matrix-accent/10 border-matrix-accent text-matrix-accent"
                      : "bg-matrix-neonRed/10 border-matrix-neonRed text-matrix-neonRed"
                  }`}
                >
                  {testResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm mb-1">
                      {testResult.passed ? "TEST PASSED • LEVEL COMPLETED" : "TEST FAILED"}
                    </h4>
                    <p className="text-gray-200 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic p-4 text-center">
                  Press &ldquo;Cast Spell & Verify Code&rdquo; to execute assertions against your code.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
