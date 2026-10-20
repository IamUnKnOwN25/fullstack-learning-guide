"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
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
  BookOpen,
  Layers,
  Copy,
  Check,
  Swords,
  Lightbulb,
} from "lucide-react";
import { REALMS } from "@/data/realms";
import { QUESTS, Quest } from "@/data/quests";
import { RealmConceptVisualizer } from "./RealmConceptVisualizer";
import { buildSandboxSrcDoc } from "@/lib/sandboxBuilder";

interface Props {
  quest?: Quest;
  questId?: string;
  nextQuestId?: string;
  realmId: string;
}

export function QuestCodingWorkspace({
  quest: initialQuest,
  questId,
  nextQuestId: propNextQuestId,
  realmId,
}: Props) {
  const { completeQuest, completedQuests, stars, unlockedSkills } = useGameStore();
  const realm = REALMS.find((r) => r.id === realmId);
  const realmQuests = QUESTS[realmId] || [];
  const questIndex = questId ? realmQuests.findIndex((q) => q.id === questId) : -1;
  const quest = initialQuest || (questIndex !== -1 ? realmQuests[questIndex] : realmQuests[0]);
  const nextQuestId =
    propNextQuestId ||
    (questIndex !== -1 && questIndex + 1 < realmQuests.length
      ? realmQuests[questIndex + 1].id
      : undefined);

  const [code, setCode] = useState(quest?.starterCode || "");
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "terminal" | "visualizer">("editor");
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMentorGuide, setShowMentorGuide] = useState(false);
  const [testResult, setTestResult] = useState<{
    passed?: boolean;
    message?: string;
  } | null>(null);

  const isCompleted = quest ? completedQuests.includes(quest.id) : false;
  const isReactBonus = unlockedSkills.includes("reactive_flow") && quest?.realmId === "react";
  const isAsyncBonus = unlockedSkills.includes("async_teleport") && (quest?.realmId === "backend" || quest?.realmId === "databases");
  const isDevopsBonus = unlockedSkills.includes("container_forge") && quest?.realmId === "devops";

  let bonusMultiplier = 1.0;
  let bonusLabel = "";
  if (isReactBonus) {
    bonusMultiplier = 1.25;
    bonusLabel = "(+25% Reactive Flow)";
  } else if (isAsyncBonus) {
    bonusMultiplier = 1.25;
    bonusLabel = "(+25% Async Teleport)";
  } else if (isDevopsBonus) {
    bonusMultiplier = 1.25;
    bonusLabel = "(+25% Container Forge)";
  }

  const finalXp = quest ? Math.round(quest.xpReward * bonusMultiplier) : 0;

  // Sync state if quest changes
  useEffect(() => {
    if (quest) {
      setCode(quest.starterCode);
      setTestResult(null);
      setShowHintIndex(-1);
      setCheckedTasks({});
      setShowMentorGuide(false);
      setActiveTab("editor");
    }
  }, [quest]);

  if (!quest) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-mono">Quest Not Found</h2>
        <p className="text-sm text-gray-400">The requested matrix trial could not be loaded.</p>
        <Link
          href="/"
          className="inline-flex px-4 py-2 rounded-lg bg-matrix-accent text-matrix-dark font-mono text-xs font-bold"
        >
          Return to World Map
        </Link>
      </div>
    );
  }

  // Execute Code & Run Test Suite
  const handleRunCode = () => {
    soundEngine.playSfx("attack");
    const result = quest.testRunner(code);

    if (result.passed) {
      soundEngine.playSfx("correct");
      // Calculate stars: 3 stars if 0 hints, 2 if 1 hint, 1 if multiple hints
      const earnedStars = showHintIndex === -1 ? 3 : showHintIndex === 0 ? 2 : 1;
      completeQuest(quest.id, quest.realmId, earnedStars, finalXp);

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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Realm Trial & Boss Quick Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-matrix-dark p-1 rounded-lg border border-matrix-border font-mono text-xs">
            {realmQuests.map((rq) => {
              const active = rq.id === quest.id;
              const solved = completedQuests.includes(rq.id);
              return (
                <Link
                  key={rq.id}
                  href={`/quest/${realmId}/${rq.id}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                    active
                      ? "bg-matrix-accent text-matrix-dark font-bold"
                      : solved
                      ? "text-matrix-accent hover:bg-matrix-card"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Trial {rq.order}</span>
                  {solved && <CheckCircle2 className="w-3 h-3" />}
                </Link>
              );
            })}
            <Link
              href={`/boss/${realmId}`}
              onClick={() => soundEngine.playSfx("click")}
              className="px-2.5 py-1 rounded flex items-center gap-1 text-matrix-neonRed hover:bg-red-950/40 font-bold transition-all"
              title="Challenge Realm Guardian Boss"
            >
              <Swords className="w-3 h-3" />
              <span>Boss</span>
            </Link>
          </div>

          {realm && (
            <Link
              href={`/curriculum?file=${realm.fileRef}`}
              target="_blank"
              onClick={() => soundEngine.playSfx("click")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border hover:border-matrix-neonCyan text-matrix-neonCyan text-xs font-mono transition-colors shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Curriculum Reference</span>
            </Link>
          )}

          <span className="font-mono text-xs text-matrix-neonGold px-3 py-1 rounded-full bg-matrix-neonGold/10 border border-matrix-neonGold/30 flex items-center gap-1.5">
            +{finalXp} XP
            {bonusLabel && (
              <span className="text-[10px] text-matrix-neonCyan font-bold">
                {bonusLabel}
              </span>
            )}
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
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs uppercase tracking-wider text-matrix-neonGold font-bold">
                  Objectives Checklist (Click to Track)
                </h3>
                <span className="font-mono text-[10px] text-gray-400">
                  {isCompleted
                    ? `${quest.tasks.length}/${quest.tasks.length} Verified`
                    : `${Object.values(checkedTasks).filter(Boolean).length}/${quest.tasks.length} Checked`}
                </span>
              </div>
              <div className="space-y-2">
                {quest.tasks.map((task, idx) => {
                  const isTaskChecked = isCompleted || !!checkedTasks[idx];
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        soundEngine.playSfx("click");
                        setCheckedTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
                      }}
                      className={`w-full text-left flex items-start gap-2.5 text-xs p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isTaskChecked
                          ? "bg-matrix-accent/10 border-matrix-accent/40 text-white"
                          : "bg-matrix-dark/30 border-matrix-border/70 hover:border-gray-600 text-gray-200"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isTaskChecked
                            ? "bg-matrix-accent border-matrix-accent text-matrix-dark font-bold"
                            : "bg-matrix-card border-matrix-border text-matrix-accent"
                        }`}
                      >
                        {isTaskChecked ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="text-[9px]">{idx + 1}</span>
                        )}
                      </div>
                      <span className={isTaskChecked ? "line-through text-gray-400" : "text-gray-200"}>
                        {task}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hints & Guided Mentor Accordion */}
            <div className="pt-2 border-t border-matrix-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-matrix-neonPurple" />
                  Need Tactical Support?
                </span>

                <div className="flex items-center gap-3">
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

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx("click");
                      setShowMentorGuide(!showMentorGuide);
                    }}
                    className="text-xs font-mono text-matrix-neonCyan hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Lightbulb className="w-3 h-3" />
                    {showMentorGuide ? "Hide Walkthrough" : "Mentor Walkthrough"}
                  </button>
                </div>
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

              {showMentorGuide && (
                <div className="p-3.5 rounded-xl bg-matrix-neonCyan/10 border border-matrix-neonCyan/30 font-mono text-xs space-y-2.5 text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-matrix-neonCyan font-bold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Mentor Reference Pattern
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSfx("click");
                        const combinedHint = quest.hints[quest.hints.length - 1] || quest.starterCode;
                        if (quest.starterCode.includes("<!--") || quest.starterCode.includes("//")) {
                          setCode(quest.starterCode + "\n\n" + combinedHint);
                        } else {
                          setCode(combinedHint);
                        }
                        setActiveTab("editor");
                      }}
                      className="px-2 py-1 rounded bg-matrix-neonCyan text-matrix-dark font-bold text-[10px] hover:opacity-90"
                    >
                      Insert Snippet into Editor
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    <strong>Why this works:</strong> {quest.conceptSummary}
                  </p>
                  <pre className="p-2.5 rounded bg-black/60 border border-matrix-border text-matrix-accent overflow-x-auto text-[11px]">
                    <code>{quest.hints.join("\n\n")}</code>
                  </pre>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-matrix-accent to-matrix-neonCyan text-matrix-dark font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-matrix-accent/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-matrix-dark" />
              <span>Cast Spell & Verify</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-matrix-dark/30 px-1.5 py-0.5 rounded border border-matrix-dark/20 text-matrix-dark font-mono">
                Ctrl+↵
              </kbd>
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

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("visualizer");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === "visualizer"
                    ? "bg-matrix-neonPurple/20 border border-matrix-neonPurple text-matrix-neonPurple shadow-sm shadow-matrix-neonPurple/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Concept Visualizer
              </button>
            </div>

            <span className="font-mono text-[10px] uppercase text-gray-500">
              {quest.language.toUpperCase()} ENGINE
            </span>
          </div>

          {/* Tab 1: Code Editor */}
          {activeTab === "editor" && (
            <div className="flex-1 bg-matrix-dark flex flex-col font-mono text-xs overflow-hidden">
              <div className="flex-1 flex overflow-y-auto p-3 sm:p-4 gap-3">
                {/* Line Numbers Gutter */}
                <div
                  aria-hidden="true"
                  className="select-none text-right pr-2 border-r border-matrix-border/60 text-gray-600 font-mono text-xs leading-relaxed"
                >
                  {code.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

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
                    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleRunCode();
                    }
                  }}
                />
              </div>

              {/* Editor Status & Copy Toolbar */}
              <div className="px-4 py-1.5 border-t border-matrix-border bg-matrix-card/60 flex items-center justify-between text-[10px] text-gray-400">
                <div className="flex items-center gap-3">
                  <span>Lines: {code.split("\n").length}</span>
                  <span>•</span>
                  <span>Chars: {code.length}</span>
                  <span className="hidden sm:inline">• Tab: 2 Spaces</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(code);
                    }
                    soundEngine.playSfx("click");
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 1800);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-matrix-dark hover:bg-matrix-card border border-matrix-border text-gray-300 hover:text-white transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-matrix-accent" />
                      <span className="text-matrix-accent font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Sandboxed Live Preview */}
          {activeTab === "preview" && (
            <div className="flex-1 bg-matrix-dark p-2 flex flex-col">
              <iframe
                title="Live Sandboxed Output"
                sandbox="allow-scripts"
                srcDoc={buildSandboxSrcDoc(code, quest.language, quest.previewType)}
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

          {/* Tab 4: Interactive Concept Visualizer */}
          {activeTab === "visualizer" && (
            <div className="flex-1 bg-matrix-dark overflow-y-auto">
              <RealmConceptVisualizer realmId={realmId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
