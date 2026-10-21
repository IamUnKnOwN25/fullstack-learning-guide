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
  Timer,
  Zap,
  Maximize2,
  Minimize2,
  Columns,
  GraduationCap,
  Dumbbell,
} from "lucide-react";
import { REALMS } from "@/data/realms";
import { QUESTS, Quest } from "@/data/quests";
import { RealmConceptVisualizer } from "./RealmConceptVisualizer";
import { buildSandboxSrcDoc } from "@/lib/sandboxBuilder";
import { evaluateQuestTasks, getQuestTaskDiagnostics } from "@/lib/questTaskEvaluator";
import {
  QUEST_DEEP_DIVES,
  REALM_WARMUP_DRILLS,
  generateQuestAssertions,
} from "@/data/questPedagogy";

interface Props {
  quest?: Quest;
  questId?: string;
  nextQuestId?: string;
  realmId: string;
}

const PROGRAMMER_SYMBOLS = [
  "Tab", "{", "}", "(", ")", "[", "]", ";", "=>", '"', "'", "=", "<", ">", "/", ":", ".", "!"
];

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

  const deepDive = quest ? QUEST_DEEP_DIVES[quest.id] : undefined;
  const warmupDrill = REALM_WARMUP_DRILLS[realmId];

  const [code, setCode] = useState(quest?.starterCode || "");
  const [activeTab, setActiveTab] = useState<"editor" | "split" | "preview" | "terminal" | "visualizer">("editor");
  const [directiveTab, setDirectiveTab] = useState<"directive" | "warmup" | "deepdive">("directive");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const insertSymbolAtCursor = (symbol: string) => {
    soundEngine.playSfx("click");
    const target = textareaRef.current;
    if (!target) return;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const insertion = symbol === "Tab" ? "  " : symbol;
    const nextCode = code.substring(0, start) + insertion + code.substring(end);
    setCode(nextCode);
    const nextPos = start + insertion.length;
    setTimeout(() => {
      target.focus();
      target.selectionStart = nextPos;
      target.selectionEnd = nextPos;
    }, 0);
  };
  const [warmupCode, setWarmupCode] = useState<string>(warmupDrill?.starterCode || "");
  const [warmupResult, setWarmupResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizBonusAwarded, setQuizBonusAwarded] = useState<boolean>(false);
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMentorGuide, setShowMentorGuide] = useState(false);
  const [focusWorkbench, setFocusWorkbench] = useState(false);
  const [mobilePane, setMobilePane] = useState<"directive" | "workbench">("directive");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const gutterRef = React.useRef<HTMLDivElement | null>(null);
  const [testResult, setTestResult] = useState<{
    passed?: boolean;
    message?: string;
    speedrunBonusAwarded?: boolean;
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

  const speedrunEligible = elapsedSeconds < 90;
  const speedrunBonusXp = speedrunEligible ? 25 : 0;
  const finalXp = quest ? Math.round(quest.xpReward * bonusMultiplier) + speedrunBonusXp : 0;

  // Sync state if quest changes
  useEffect(() => {
    if (quest) {
      setCode(quest.starterCode);
      setTestResult(null);
      setShowHintIndex(-1);
      setCheckedTasks({});
      setShowMentorGuide(false);
      setElapsedSeconds(0);
      setActiveTab("editor");
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
      setQuizBonusAwarded(false);
    }
    if (warmupDrill) {
      setWarmupCode(warmupDrill.starterCode);
      setWarmupResult(null);
    }
  }, [quest, warmupDrill]);

  // Check URL query parameters for ?tab=warmup or ?tab=deepdive
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "warmup" || tabParam === "deepdive" || tabParam === "directive") {
        setDirectiveTab(tabParam);
      }
    }
  }, []);

  // Increment trial timer every second until solved
  useEffect(() => {
    if (testResult?.passed) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testResult?.passed, quest?.id]);

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

  const autoVerifiedTasks = evaluateQuestTasks(quest.id, quest.tasks, code);
  const taskDiagnostics = getQuestTaskDiagnostics(quest.id, quest.tasks, code);
  const totalVerifiedCount = quest.tasks.filter(
    (_, idx) => isCompleted || autoVerifiedTasks[idx] || !!checkedTasks[idx]
  ).length;
  const formattedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(
    elapsedSeconds % 60
  ).padStart(2, "0")}`;

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
        speedrunBonusAwarded: speedrunEligible,
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

  const handleRunWarmup = () => {
    if (!warmupDrill) return;
    soundEngine.playSfx("attack");
    const res = warmupDrill.validator(warmupCode);
    setWarmupResult(res);
    if (res.passed) {
      soundEngine.playSfx("correct");
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#00ff9d", "#00e5ff"],
      });
    } else {
      soundEngine.playSfx("error");
    }
  };

  const handleAnswerQuiz = (index: number) => {
    if (quizSubmitted || !deepDive) return;
    setSelectedQuizAnswer(index);
    setQuizSubmitted(true);
    if (index === deepDive.quiz.correctIndex) {
      soundEngine.playSfx("correct");
      if (!quizBonusAwarded) {
        useGameStore.getState().addXp(25, "Quiz Checkpoint");
        setQuizBonusAwarded(true);
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#00ff9d", "#f59e0b", "#00e5ff"],
        });
      }
    } else {
      soundEngine.playSfx("error");
    }
  };

  const formattedStoryIntro = quest.storyIntro
    .replace(/^Byte\s+[^:]+:\s*['"]?/i, "")
    .replace(/['"]$/, "");

  return (
    <div className="w-full max-w-7xl mx-auto py-3 px-3 sm:px-6 flex flex-col gap-3 min-h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-3.5rem)] pb-24 md:pb-3">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-matrix-border">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white transition-colors shrink-0"
            onClick={() => soundEngine.playSfx("click")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-matrix-neonCyan tracking-wider block">
              {quest.realmId.toUpperCase()} REALM • TRIAL {quest.order}
            </span>
            <h1 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span className="truncate">{quest.title}</span>
              {isCompleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-accent/20 text-matrix-accent flex items-center gap-1 font-bold whitespace-nowrap shrink-0">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> Solved
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Realm Trial & Boss Quick Switcher */}
          <div className="flex items-center gap-1 bg-matrix-dark p-1 rounded-lg border border-matrix-border font-mono text-xs shrink-0 overflow-x-auto select-none">
            {realmQuests.map((rq) => {
              const active = rq.id === quest.id;
              const solved = completedQuests.includes(rq.id);
              return (
                <Link
                  key={rq.id}
                  href={`/quest/${realmId}/${rq.id}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 whitespace-nowrap shrink-0 transition-all ${
                    active
                      ? "bg-matrix-accent text-matrix-dark font-bold"
                      : solved
                      ? "text-matrix-accent hover:bg-matrix-card"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Trial {rq.order}</span>
                  {solved && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                </Link>
              );
            })}
            <Link
              href={`/boss/${realmId}`}
              onClick={() => soundEngine.playSfx("click")}
              className="px-2.5 py-1 rounded flex items-center gap-1 text-matrix-neonRed hover:bg-red-950/40 font-bold whitespace-nowrap shrink-0 transition-all"
              title="Challenge Realm Guardian Boss"
            >
              <Swords className="w-3 h-3 shrink-0" />
              <span>Boss</span>
            </Link>
          </div>

          <Link
            href={`/ide?quest=${quest.id}`}
            onClick={() => soundEngine.playSfx("click")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-matrix-neonPurple/15 hover:bg-matrix-neonPurple/25 border border-matrix-neonPurple/50 text-matrix-neonPurple text-xs font-mono font-bold transition-colors shadow-sm whitespace-nowrap shrink-0"
            title="Open this quest inside the full VS Code-style Multi-File Matrix IDE"
          >
            <Code className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Open in Matrix IDE</span>
          </Link>

          {realm && (
            <Link
              href={`/curriculum?file=${realm.fileRef}`}
              target="_blank"
              onClick={() => soundEngine.playSfx("click")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border hover:border-matrix-neonCyan text-matrix-neonCyan text-xs font-mono transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Curriculum Reference</span>
            </Link>
          )}

          {/* Speedrun Timer Badge */}
          <div
            className={`px-2.5 py-1 rounded-full border font-mono text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              speedrunEligible
                ? "bg-matrix-accent/10 border-matrix-accent/30 text-matrix-accent"
                : "bg-matrix-card border-matrix-border text-gray-400"
            }`}
            title={
              speedrunEligible
                ? "Speedrun Bonus Active: Solve within 01:30 for +25 XP!"
                : "Trial Elapsed Time"
            }
          >
            <Timer className="w-3.5 h-3.5 shrink-0" />
            <span>{formattedTime}</span>
            {speedrunEligible && (
              <span className="hidden xl:inline text-[10px] font-bold">• +25 Speed XP</span>
            )}
          </div>

          <span className="font-mono text-xs text-matrix-neonGold px-3 py-1 rounded-full bg-matrix-neonGold/10 border border-matrix-neonGold/30 flex items-center gap-1.5 whitespace-nowrap shrink-0">
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
              className="px-3.5 py-1.5 rounded-lg bg-matrix-accent hover:bg-matrix-accentDark text-matrix-dark font-mono text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0"
              onClick={() => soundEngine.playSfx("click")}
            >
              Next Quest
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Segmented View Toggle (< lg screens) */}
      <div className="flex lg:hidden bg-matrix-dark p-1 rounded-xl border border-matrix-border font-mono text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setMobilePane("directive");
          }}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobilePane === "directive"
              ? "bg-matrix-accent text-matrix-dark shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Mission Directive</span>
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx("click");
            setMobilePane("workbench");
          }}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobilePane === "workbench"
              ? "bg-matrix-neonCyan text-matrix-dark shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Code Workbench</span>
          {testResult?.passed && <CheckCircle2 className="w-3.5 h-3.5 text-matrix-accent" />}
        </button>
      </div>

      {/* Dual Pane Grid: Left Briefing, Right Coding Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        {/* Left Pane: Story, Concepts, Checklist, Hints */}
        <div
          className={`bg-matrix-card border border-matrix-border rounded-2xl flex-col overflow-hidden shadow-xl min-h-[420px] lg:min-h-0 ${
            focusWorkbench ? "lg:hidden" : ""
          } ${mobilePane === "workbench" ? "hidden lg:flex" : "flex"}`}
        >
          {/* Left Pane Sub-Tabs */}
          <div className="p-2 border-b border-matrix-border bg-matrix-dark/80 flex items-center justify-between gap-1 overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setDirectiveTab("directive");
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  directiveTab === "directive"
                    ? "bg-matrix-accent/20 border border-matrix-accent text-matrix-accent"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-matrix-accent shrink-0" />
                <span>Directive</span>
              </button>

              {warmupDrill && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setDirectiveTab("warmup");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    directiveTab === "warmup"
                      ? "bg-matrix-neonPurple/20 border border-matrix-neonPurple text-matrix-neonPurple"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Warm-up Practice Drill"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-matrix-neonPurple shrink-0" />
                  <span>Warm-Up</span>
                  <span className="text-[9px] px-1 rounded bg-matrix-neonPurple/20 text-matrix-neonPurple font-normal hidden sm:inline">
                    Drill
                  </span>
                </button>
              )}

              {deepDive && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setDirectiveTab("deepdive");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    directiveTab === "deepdive"
                      ? "bg-matrix-neonCyan/20 border border-matrix-neonCyan text-matrix-neonCyan"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Senior Concept Deep-Dive & Quiz"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-matrix-neonCyan shrink-0" />
                  <span>Deep Dive</span>
                  {quizBonusAwarded && (
                    <span className="text-[9px] px-1 rounded bg-matrix-accent/20 text-matrix-accent font-bold">
                      ✓
                    </span>
                  )}
                </button>
              )}
            </div>

            <span className="text-[10px] font-mono text-gray-500 uppercase px-2 shrink-0">
              {directiveTab === "directive" ? "Core Trial" : directiveTab === "warmup" ? "Skill Drill" : "Mentorship"}
            </span>
          </div>

          {/* Tab 1: Directive & Tasks */}
          {directiveTab === "directive" && (
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-200 animate-fadeIn">
              {/* Story Dialogue */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-matrix-neonCyan/10 to-matrix-dark border border-matrix-neonCyan/30 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-mono text-xs text-matrix-neonCyan font-bold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                BYTE (AI COMPANION DROID)
              </div>
              <p className="italic text-xs sm:text-sm text-gray-100 leading-relaxed font-sans">
                &ldquo;{formattedStoryIntro}&rdquo;
              </p>
            </div>

            {/* Core Concept Briefing */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-matrix-accent font-bold">
                Core Concept
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-200 bg-matrix-dark/50 p-4 rounded-xl border border-matrix-border font-sans">
                {quest.conceptSummary}
              </p>
            </div>

            {/* Task Objectives Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs uppercase tracking-wider text-matrix-neonGold font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-matrix-accent" />
                  <span>Live Objectives Checklist</span>
                </h3>
                <span className="font-mono text-[10px] text-matrix-accent font-bold">
                  {totalVerifiedCount}/{quest.tasks.length} Verified
                </span>
              </div>

              {/* Live Objective Completion Bar */}
              <div className="w-full h-1.5 bg-matrix-dark rounded-full overflow-hidden border border-matrix-border">
                <div
                  className="h-full bg-gradient-to-r from-matrix-accent to-matrix-neonCyan transition-all duration-300"
                  style={{
                    width: `${
                      quest.tasks.length > 0
                        ? Math.round((totalVerifiedCount / quest.tasks.length) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                {quest.tasks.map((task, idx) => {
                  const isAutoDetected = Boolean(autoVerifiedTasks[idx]);
                  const isTaskChecked = isCompleted || isAutoDetected || !!checkedTasks[idx];
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        soundEngine.playSfx("click");
                        setCheckedTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
                      }}
                      className={`w-full text-left flex items-start justify-between gap-2.5 text-xs p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isTaskChecked
                          ? "bg-matrix-accent/10 border-matrix-accent/40 text-white"
                          : "bg-matrix-dark/30 border-matrix-border/70 hover:border-gray-600 text-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
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
                      </div>
                      {isAutoDetected && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-matrix-accent/20 border border-matrix-accent/40 text-[9px] font-mono text-matrix-accent font-bold">
                          AUTO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hints & Guided Mentor Accordion */}
            <div className="pt-2 border-t border-matrix-border/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-gray-400 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <HelpCircle className="w-3.5 h-3.5 text-matrix-neonPurple shrink-0" />
                  Need Tactical Support?
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {showHintIndex < quest.hints.length - 1 && (
                    <button
                      onClick={() => {
                        soundEngine.playSfx("click");
                        setShowHintIndex((prev) => prev + 1);
                      }}
                      className="text-xs font-mono text-matrix-neonPurple hover:underline cursor-pointer whitespace-nowrap shrink-0"
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
                    className="text-xs font-mono text-matrix-neonCyan hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Lightbulb className="w-3 h-3 shrink-0" />
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
                        setMobilePane("workbench");
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
          )}

          {/* Tab 2: Warm-Up Drill */}
          {directiveTab === "warmup" && warmupDrill && (
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm text-gray-200 animate-fadeIn font-sans">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-matrix-neonPurple/20 border border-matrix-neonPurple/40 text-matrix-neonPurple font-mono text-[10px] font-bold uppercase">
                  {warmupDrill.difficulty}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Realm Warm-Up Drill
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight font-sans">
                  {warmupDrill.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mt-1 font-sans">
                  {warmupDrill.prompt}
                </p>
              </div>

              <div className="rounded-xl border border-matrix-border overflow-hidden bg-matrix-dark flex flex-col font-mono text-xs">
                <div className="px-3 py-1.5 bg-matrix-card/80 border-b border-matrix-border flex items-center justify-between text-[11px] text-gray-400">
                  <span>Drill Scratchpad</span>
                  <button
                    type="button"
                    onClick={() => setWarmupCode(warmupDrill.solutionSnippet)}
                    className="text-matrix-neonCyan hover:underline text-[10px]"
                  >
                    Load Solution Pattern
                  </button>
                </div>
                <textarea
                  value={warmupCode}
                  onChange={(e) => setWarmupCode(e.target.value)}
                  spellCheck={false}
                  rows={6}
                  className="w-full p-3 bg-transparent text-gray-200 outline-none resize-none font-mono text-xs leading-5"
                />
              </div>

              <div className="p-3 rounded-lg bg-matrix-neonPurple/10 border border-matrix-neonPurple/30 text-xs font-mono text-gray-300">
                <span className="text-matrix-neonPurple font-bold mr-1">Tip:</span>
                {warmupDrill.hint}
              </div>

              {warmupResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono ${
                    warmupResult.passed
                      ? "bg-matrix-accent/15 border-matrix-accent text-matrix-accent"
                      : "bg-matrix-neonRed/15 border-matrix-neonRed text-matrix-neonRed"
                  }`}
                >
                  {warmupResult.passed ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{warmupResult.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRunWarmup}
                className="w-full py-2.5 rounded-xl bg-matrix-neonPurple hover:bg-matrix-neonPurple/90 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-matrix-neonPurple/20 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Verify Warm-Up Drill</span>
              </button>
            </div>
          )}

          {/* Tab 3: Senior Deep Dive & Interactive Mini-Quiz */}
          {directiveTab === "deepdive" && deepDive && (
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-gray-200 animate-fadeIn font-sans">
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-matrix-neonCyan/20 border border-matrix-neonCyan/40 text-matrix-neonCyan font-mono text-[10px] font-bold uppercase">
                  Senior Engineering Mental Model
                </span>
                <h3 className="text-base font-bold text-white font-sans tracking-tight">
                  Why This Works in Production
                </h3>
                <p className="text-xs text-gray-200 leading-relaxed bg-matrix-dark/60 p-3.5 rounded-xl border border-matrix-border">
                  {deepDive.whyItWorks}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-xs font-bold text-matrix-neonGold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-matrix-neonGold" />
                  <span>Production Gotchas & Failure Modes</span>
                </h4>
                <div className="space-y-1.5">
                  {deepDive.productionGotchas.map((gotcha, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-matrix-card border border-matrix-border/80 text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-matrix-neonGold font-mono font-bold shrink-0">⚠</span>
                      <span>{gotcha}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-matrix-accent/10 to-transparent border border-matrix-accent/30 text-gray-200 space-y-1">
                <span className="font-mono text-[11px] font-bold text-matrix-accent block uppercase">
                  Senior Advice
                </span>
                <p className="italic text-gray-300">{deepDive.seniorAdvice}</p>
              </div>

              {/* Interactive Concept Check Mini-Quiz */}
              <div className="pt-3 border-t border-matrix-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-matrix-neonCyan uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-matrix-neonCyan" />
                    <span>Concept Check (+15 XP)</span>
                  </span>
                  {quizBonusAwarded && (
                    <span className="px-2 py-0.5 rounded bg-matrix-accent/20 border border-matrix-accent/50 text-matrix-accent font-mono text-[10px] font-bold">
                      +15 XP Earned ✓
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-white leading-relaxed">
                  {deepDive.quiz.question}
                </p>

                <div className="space-y-2">
                  {deepDive.quiz.options.map((opt, idx) => {
                    const isSelected = selectedQuizAnswer === idx;
                    const isCorrect = idx === deepDive.quiz.correctIndex;
                    let optionStyle = "bg-matrix-card hover:bg-matrix-cardHover border-matrix-border text-gray-200";

                    if (quizSubmitted) {
                      if (isCorrect) {
                        optionStyle = "bg-matrix-accent/20 border-matrix-accent text-white font-bold";
                      } else if (isSelected) {
                        optionStyle = "bg-red-950/40 border-matrix-neonRed text-matrix-neonRed";
                      } else {
                        optionStyle = "bg-matrix-dark/40 border-matrix-border/40 text-gray-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() => handleAnswerQuiz(idx)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                      selectedQuizAnswer === deepDive.quiz.correctIndex
                        ? "bg-matrix-accent/10 border-matrix-accent text-gray-200"
                        : "bg-amber-950/30 border-amber-800 text-amber-200"
                    }`}
                  >
                    <strong>Explanation: </strong>
                    {deepDive.quiz.explanation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cast Code Spell Action Bar */}
          <div className="p-3.5 border-t border-matrix-border bg-matrix-dark/80 flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playSfx("click");
                if (directiveTab === "warmup" && warmupDrill) {
                  setWarmupCode(warmupDrill.starterCode);
                  setWarmupResult(null);
                } else {
                  setCode(quest.starterCode);
                  setTestResult(null);
                }
              }}
              className="px-3 py-2 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset code to starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{directiveTab === "warmup" ? "Reset Drill" : "Reset Code"}</span>
            </button>

            {directiveTab === "warmup" ? (
              <button
                onClick={handleRunWarmup}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-matrix-neonPurple to-matrix-neonCyan text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-matrix-neonPurple/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Verify Warm-Up Drill</span>
              </button>
            ) : directiveTab === "deepdive" ? (
              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setDirectiveTab("directive");
                  setActiveTab("editor");
                  setMobilePane("workbench");
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-matrix-neonCyan to-matrix-accent text-matrix-dark font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-matrix-neonCyan/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <Code className="w-4 h-4 fill-matrix-dark" />
                <span>Apply in Trial Code</span>
              </button>
            ) : (
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
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor + Live Preview + Terminal */}
        <div
          className={`bg-matrix-card border border-matrix-border rounded-2xl flex-col overflow-hidden shadow-xl min-h-[460px] lg:min-h-0 ${
            focusWorkbench ? "lg:col-span-2" : ""
          } ${mobilePane === "directive" ? "hidden lg:flex" : "flex"}`}
        >
          {/* Workspace Tab Header */}
          <div className="px-3 sm:px-4 py-2 border-b border-matrix-border bg-matrix-dark/70 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("editor");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === "editor"
                    ? "bg-matrix-accent/20 border border-matrix-accent text-matrix-accent shadow-sm shadow-matrix-accent/20"
                    : "text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Code className="w-3.5 h-3.5 shrink-0" />
                <span>Code Editor</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("split");
                }}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === "split"
                    ? "bg-matrix-neonCyan/20 border border-matrix-neonCyan text-matrix-neonCyan shadow-sm shadow-matrix-neonCyan/20"
                    : "text-gray-400 hover:text-white border border-transparent"
                }`}
                title="Side-by-Side Code Editor + Live Preview"
              >
                <Columns className="w-3.5 h-3.5 shrink-0" />
                <span>Split</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("preview");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === "preview"
                    ? "bg-matrix-neonCyan/20 border border-matrix-neonCyan text-matrix-neonCyan shadow-sm shadow-matrix-neonCyan/20"
                    : "text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>Live Preview</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setActiveTab("terminal");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === "terminal"
                    ? "bg-matrix-neonGold/20 border border-matrix-neonGold text-matrix-neonGold shadow-sm shadow-matrix-neonGold/20"
                    : "text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>Terminal</span>
                {testResult && (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === "visualizer"
                    ? "bg-matrix-neonPurple/20 border border-matrix-neonPurple text-matrix-neonPurple shadow-sm shadow-matrix-neonPurple/20"
                    : "text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Visualizer</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {focusWorkbench && (
                <button
                  type="button"
                  onClick={handleRunCode}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-matrix-accent to-matrix-neonCyan text-matrix-dark font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-matrix-dark shrink-0" />
                  <span>Verify Code</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setFocusWorkbench((prev) => !prev);
                }}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white font-mono text-[11px] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                title={focusWorkbench ? "Restore Split Briefing + Workbench" : "Maximize Coding Workbench (100% Width)"}
              >
                {focusWorkbench ? (
                  <>
                    <Minimize2 className="w-3 h-3 text-matrix-neonCyan shrink-0" />
                    <span>Split View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3 text-matrix-neonCyan shrink-0" />
                    <span>Maximize</span>
                  </>
                )}
              </button>

              <span className="px-2 py-0.5 rounded bg-matrix-card border border-matrix-border font-mono text-[10px] uppercase text-matrix-neonCyan font-bold whitespace-nowrap shrink-0">
                {quest.language.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Tab 1 / Split / Tab 2: Code Editor & Sandboxed Live Preview */}
          {(activeTab === "editor" || activeTab === "split" || activeTab === "preview") && (
            <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden animate-fadeIn">
              {(activeTab === "editor" || activeTab === "split") && (
                <div
                  className={`flex-1 min-w-0 bg-matrix-dark flex flex-col font-mono text-xs sm:text-sm overflow-hidden ${
                    activeTab === "split" ? "border-b xl:border-b-0 xl:border-r border-matrix-border" : ""
                  }`}
                >
                  {/* Mobile Programmer Keyboard Accessory Bar */}
                  <div className="flex md:hidden items-center gap-1.5 px-2 py-1.5 bg-matrix-card/95 border-b border-matrix-border overflow-x-auto shrink-0 select-none">
                    <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Symbols:</span>
                    {PROGRAMMER_SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSymbolAtCursor(sym)}
                        className="px-2.5 py-1 rounded bg-matrix-dark hover:bg-matrix-cardHover active:bg-matrix-accent/20 border border-matrix-border/80 text-matrix-accent active:scale-95 text-xs font-mono font-bold shrink-0 shadow-sm cursor-pointer"
                      >
                        {sym === "Tab" ? "⇥ Tab" : sym}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                    {/* Line Numbers Gutter */}
                    <div
                      ref={gutterRef}
                      aria-hidden="true"
                      className="select-none text-right py-3 sm:py-4 pl-3 sm:pl-4 pr-2.5 border-r border-matrix-border/60 text-gray-600 font-mono text-xs leading-6 overflow-hidden shrink-0"
                    >
                      {code.split("\n").map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onScroll={(e) => {
                        if (gutterRef.current) {
                          gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                        }
                      }}
                      placeholder="Type your code solution here..."
                      spellCheck={false}
                      wrap="off"
                      className="w-full flex-1 h-full py-3 sm:py-4 px-3 bg-transparent text-gray-200 outline-none resize-none font-mono leading-6 overflow-auto whitespace-pre selection:bg-matrix-accent/30 selection:text-white"
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

              {(activeTab === "preview" || activeTab === "split") && (
                <div className="flex-1 min-w-0 bg-matrix-dark p-2 flex flex-col">
                  <iframe
                    title="Live Sandboxed Output"
                    sandbox="allow-scripts"
                    srcDoc={buildSandboxSrcDoc(code, quest.language, quest.previewType)}
                    className="w-full h-full border-none rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Matrix Terminal & Assertion Report */}
          {activeTab === "terminal" && (
            <div className="flex-1 p-6 bg-matrix-dark font-mono text-xs sm:text-sm flex flex-col space-y-4 overflow-y-auto animate-fadeIn">
              <div className="flex items-center justify-between text-matrix-neonCyan pb-2 border-b border-matrix-border">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>TERMINAL TEST RUNNER OUTPUT</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  Elapsed: {formattedTime}
                </span>
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
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm">
                        {testResult.passed ? "TEST PASSED • LEVEL COMPLETED" : "TEST FAILED"}
                      </h4>
                      {testResult.passed && testResult.speedrunBonusAwarded && (
                        <span className="px-2 py-0.5 rounded bg-matrix-neonGold/20 border border-matrix-neonGold text-matrix-neonGold text-[10px] font-bold">
                          ⚡ SPEEDRUN BONUS (+25 XP)
                        </span>
                      )}
                    </div>
                    <p className="text-gray-200 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic p-4 text-center border border-matrix-border/50 rounded-xl bg-matrix-card/30">
                  Press &ldquo;Cast Spell & Verify&rdquo; (or Ctrl+Enter) to execute assertions against your code.
                </div>
              )}

              {/* Per-Objective Assertion Matrix */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="uppercase tracking-wider font-bold text-matrix-neonGold">
                    Per-Objective Diagnostic Breakdown
                  </span>
                  <span>
                    {taskDiagnostics.filter((d) => d.passed).length}/{taskDiagnostics.length} Passing
                  </span>
                </div>
                <div className="space-y-1.5">
                  {taskDiagnostics.map((diag) => (
                    <div
                      key={diag.index}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                        diag.passed
                          ? "bg-matrix-accent/5 border-matrix-accent/30 text-gray-200"
                          : "bg-matrix-card/40 border-matrix-border text-gray-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-gray-500">#{diag.index + 1}</span>
                        <span>{diag.task}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          diag.passed
                            ? "bg-matrix-accent/20 text-matrix-accent"
                            : "bg-red-950/60 text-matrix-neonRed"
                        }`}
                      >
                        {diag.passed ? "[PASS]" : "[PENDING]"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Senior-Grade Invariant Assertions Matrix */}
              <div className="space-y-2 pt-3 border-t border-matrix-border/70">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="uppercase tracking-wider font-bold text-matrix-neonCyan flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-matrix-neonCyan" />
                    <span>Senior Invariant Test Matrix</span>
                  </span>
                  <span className="text-[10px] text-gray-500 hidden sm:inline">
                    Behavioral & Structural Verification
                  </span>
                </div>

                <div className="rounded-xl border border-matrix-border overflow-hidden bg-black/40">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-matrix-card/80 border-b border-matrix-border text-gray-400">
                        <th className="p-2.5 font-bold">Invariant</th>
                        <th className="p-2.5 font-bold hidden md:table-cell">Expected Contract</th>
                        <th className="p-2.5 font-bold">Observed State</th>
                        <th className="p-2.5 font-bold text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-matrix-border/40">
                      {generateQuestAssertions(quest.id, code).map((ast, aIdx) => (
                        <tr key={aIdx} className="hover:bg-matrix-card/30 transition-colors">
                          <td className="p-2.5 text-gray-200">
                            <div className="font-bold">{ast.name}</div>
                            <div className="text-[10px] text-gray-500 italic mt-0.5">{ast.notes}</div>
                          </td>
                          <td className="p-2.5 text-gray-400 hidden md:table-cell">
                            <code>{ast.expected}</code>
                          </td>
                          <td className="p-2.5 text-gray-300">
                            <span className={ast.passed ? "text-matrix-accent" : "text-amber-400"}>
                              {ast.actual}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                ast.passed
                                  ? "bg-matrix-accent/20 text-matrix-accent"
                                  : "bg-red-950/60 text-matrix-neonRed"
                              }`}
                            >
                              {ast.passed ? "PASS" : "FAIL"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Post-Solve Celebration & Deep Dive Prompt */}
              {testResult?.passed && deepDive && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-matrix-neonCyan/15 via-matrix-card to-matrix-accent/10 border border-matrix-neonCyan/50 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-matrix-neonCyan shrink-0" />
                      <span>Level Mastered! Cement Your Mental Model</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-matrix-neonGold/20 border border-matrix-neonGold text-matrix-neonGold text-[10px] font-bold">
                      Quiz Available (+15 XP)
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Don&apos;t just stop at passing code! Senior engineers understand the production gotchas and failure modes. Read the deep-dive and take the concept quiz to solidify your understanding.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx("click");
                      setDirectiveTab("deepdive");
                      setFocusWorkbench(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-matrix-neonCyan text-matrix-dark font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Open Senior Deep Dive & Take Quiz (+15 XP)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Interactive Concept Visualizer */}
          {activeTab === "visualizer" && (
            <div className="flex-1 bg-matrix-dark overflow-y-auto animate-fadeIn">
              <RealmConceptVisualizer realmId={realmId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
