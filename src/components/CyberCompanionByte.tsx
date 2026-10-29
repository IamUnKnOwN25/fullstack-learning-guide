"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { soundEngine } from "@/lib/soundEngine";
import { useGameStore } from "@/lib/gameStore";
import { REALMS } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import { BOSSES } from "@/data/bosses";
import {
  Sparkles,
  X,
  Lightbulb,
  Heart,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const COMPANION_TIPS = [
  "Tip: In the CSS realm, switch to the Concept Visualizer tab to play with live flex-direction and justify-content!",
  "Tactical Intel: The Any-Demon boss in Realm 04 is weak to Discriminated Unions and unknown type narrowing.",
  "Did you know? JavaScript Promises drain on the Microtask Queue before setTimeout(0) macrotasks fire!",
  "A11y Wisdom: Using semantic HTML tags like <nav> and <main> lets screen-reader users navigate by landmarks.",
  "Pro Tip: Press Ctrl + Enter (or Cmd + Enter) anywhere in the editor to immediately cast your spell & verify!",
  "Docker Magic: Multi-stage builds compile artifacts in a build container, leaving the production image ultralight.",
  "Database Defense: Never concatenate user strings into raw SQL! Parameterized queries ($1, $2) neutralize injection.",
  "Skill Tree Alert: Unlocking 'Lint Barrier' gives you 1 free test failure absorption during any Boss Battle!",
  "System Design: In high-throughput distributed systems, use Token Bucket or Sliding Window algorithms for rate limits.",
];

const FLASHCARDS = [
  {
    realm: "HTML",
    q: "Which HTML element defines the primary content landmark for screen readers?",
    options: ["<div class='main'>", "<main>", "<section>"],
    answer: 1,
    explanation: "<main> is a semantic ARIA landmark that lets assistive technology jump directly to core content.",
  },
  {
    realm: "CSS",
    q: "Which CSS Grid rule creates responsive columns without media queries?",
    options: [
      "repeat(auto-fit, minmax(200px, 1fr))",
      "display: inline-flex",
      "float: left",
    ],
    answer: 0,
    explanation: "repeat(auto-fit, minmax(200px, 1fr)) automatically wraps and stretches tracks to fill available space.",
  },
  {
    realm: "JS",
    q: "Which queue runs first after the JavaScript Call Stack empties?",
    options: ["Macrotask Queue (setTimeout)", "Microtask Queue (Promises)", "requestIdleCallback"],
    answer: 1,
    explanation: "Microtasks (Promise.then / await) always drain completely before the next Macrotask!",
  },
  {
    realm: "TS",
    q: "Which TypeScript type is the safe alternative to 'any' that requires narrowing before use?",
    options: ["unknown", "never", "Object"],
    answer: 0,
    explanation: "'unknown' forces compile-time type guards (typeof, in, discriminated unions) before property access.",
  },
  {
    realm: "REACT",
    q: "Which React hook caches a function reference across renders?",
    options: ["useEffect", "useCallback", "useRef"],
    answer: 1,
    explanation: "useCallback memoizes a callback function so React.memo child components don't re-render unnecessarily.",
  },
  {
    realm: "BACKEND",
    q: "What HTTP status code should a POST endpoint return when a new resource is created?",
    options: ["200 OK", "201 Created", "204 No Content"],
    answer: 1,
    explanation: "201 Created signals that the request succeeded and a new resource was persisted.",
  },
  {
    realm: "SQL",
    q: "What SQL feature reduces a 1,000,000-row lookup from O(N) to O(log N)?",
    options: ["FOREIGN KEY", "B-Tree Index (CREATE INDEX)", "SELECT DISTINCT"],
    answer: 1,
    explanation: "A B-Tree index organizes column values into a balanced tree for logarithmic O(log N) lookups.",
  },
  {
    realm: "DEVOPS",
    q: "Why use multi-stage builds (FROM ... AS build / FROM ... AS runner) in Dockerfiles?",
    options: [
      "To strip build tools & devDependencies from the production image",
      "To run multiple databases in one container",
      "To bypass Docker layer caching",
    ],
    answer: 0,
    explanation: "Multi-stage Docker builds keep only compiled artifacts and production dependencies, shrinking image size and attack surface.",
  },
  {
    realm: "TESTING",
    q: "In Vitest, how do you stub an async function to resolve deterministically?",
    options: [
      "vi.fn().mockResolvedValue(data)",
      "setTimeout(fn, 1000)",
      "expect.assertions(1)",
    ],
    answer: 0,
    explanation: "vi.fn().mockResolvedValue(...) creates a spy that resolves immediately without network I/O.",
  },
  {
    realm: "CS",
    q: "What is the time complexity of Binary Search on a sorted array of N elements?",
    options: ["O(N)", "O(log N)", "O(N log N)"],
    answer: 1,
    explanation: "Halving the search space on each comparison yields logarithmic O(log N) time complexity.",
  },
  {
    realm: "SECURITY",
    q: "How do you prevent SQL Injection in Node.js / PostgreSQL queries?",
    options: ["Parameterized queries ($1, $2)", "String concatenation", "Base64 encoding"],
    answer: 0,
    explanation: "Parameterized queries separate the SQL command structure from untrusted user data.",
  },
  {
    realm: "CAPSTONE",
    q: "How should a healthcheck endpoint query Database and Redis readiness concurrently?",
    options: [
      "Promise.all([db.isConnected(), cache.ping()])",
      "Sequential blocking while loops",
      "setInterval inside the route handler",
    ],
    answer: 0,
    explanation: "Promise.all executes independent async health probes in parallel for minimal latency.",
  },
];

export function CyberCompanionByte() {
  const pathname = usePathname() || "/";
  const { level, rankTitle, hp, maxHp, completedQuests, completedBosses, healPlayer, addXp } =
    useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"intel" | "quiz">("intel");
  const [tipIndex, setTipIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mood, setMood] = useState<"happy" | "thinking" | "wink" | "cool">("happy");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        soundEngine.playSfx("click");
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Detect active route context
  const pathParts = pathname.split("/").filter(Boolean);
  const activeRealmId =
    (pathParts[0] === "quest" || pathParts[0] === "boss") && pathParts[1]
      ? pathParts[1]
      : undefined;
  const activeQuestId = pathParts[0] === "quest" && pathParts[2] ? pathParts[2] : undefined;

  const activeRealm = activeRealmId ? REALMS.find((r) => r.id === activeRealmId) : undefined;
  const activeQuest =
    activeRealmId && activeQuestId
      ? (QUESTS[activeRealmId] || []).find((q) => q.id === activeQuestId)
      : undefined;
  const activeBoss = activeRealmId && pathParts[0] === "boss" ? BOSSES[activeRealmId] : undefined;

  const cycleTip = () => {
    soundEngine.playSfx("click");
    setTipIndex((prev) => (prev + 1) % COMPANION_TIPS.length);
    setMood((prev) => (prev === "happy" ? "wink" : prev === "wink" ? "thinking" : prev === "thinking" ? "cool" : "wink"));
  };

  const getEyeExpression = () => {
    switch (mood) {
      case "wink":
        return "(^_-)";
      case "thinking":
        return "(o_O)";
      case "cool":
        return "(⌐■_■)";
      case "happy":
      default:
        return "(◕‿◕)";
    }
  };

  const currentCard = FLASHCARDS[quizIndex];

  return (
    <div className="fixed bottom-16 sm:bottom-5 right-4 sm:right-5 z-40 font-mono select-none flex flex-col items-end">
      {/* Speech Bubble / Mini Dialog Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Cyber Companion Byte Drawer"
          className="absolute bottom-full right-0 mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 p-4 rounded-2xl bg-matrix-card/95 backdrop-blur-md border border-matrix-accent/50 shadow-2xl shadow-black/80 space-y-3 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-matrix-border pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-matrix-accent animate-ping" />
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-matrix-neonCyan" />
                BYTE • AI Cybernetic Familiar
              </h5>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setIsOpen(false);
              }}
              aria-label="Close Byte dialog"
              className="text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs: Tactical Intel vs Flashcard Quiz */}
          <div
            role="tablist"
            aria-label="Companion modes"
            className="grid grid-cols-2 gap-1.5 bg-matrix-dark p-1 rounded-lg border border-matrix-border text-[11px]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "intel"}
              onClick={() => {
                soundEngine.playSfx("click");
                setMode("intel");
              }}
              className={`py-1 rounded font-bold transition-all ${
                mode === "intel"
                  ? "bg-matrix-accent text-matrix-dark"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Tactical Intel
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "quiz"}
              onClick={() => {
                soundEngine.playSfx("click");
                setMode("quiz");
                setSelectedOption(null);
              }}
              className={`py-1 rounded font-bold transition-all ${
                mode === "quiz"
                  ? "bg-matrix-neonCyan text-matrix-dark"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Quick Quiz (+15 XP)
            </button>
          </div>

          {mode === "intel" ? (
            <>
              {/* Route-Contextual Banner if on Quest or Boss */}
              {activeQuest ? (
                <div className="p-2.5 rounded-xl bg-matrix-neonCyan/10 border border-matrix-neonCyan/30 text-[11px] space-y-1">
                  <div className="text-matrix-neonCyan font-bold">
                    Active Trial: {activeQuest.title}
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {activeQuest.hints[0] || activeQuest.conceptSummary}
                  </p>
                </div>
              ) : activeBoss ? (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-matrix-neonRed/40 text-[11px] space-y-1">
                  <div className="text-matrix-neonRed font-bold">
                    Boss Alert: {activeBoss.name}
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Use the Tactical Weakness Scanner or press Emergency Repair below if your HP drops low!
                  </p>
                </div>
              ) : null}

              {/* General Tip Content */}
              <div
                aria-live="polite"
                className="text-xs text-gray-200 leading-relaxed bg-matrix-dark/80 p-3 rounded-xl border border-matrix-border/60"
              >
                {COMPANION_TIPS[tipIndex]}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={cycleTip}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-matrix-accent/10 border border-matrix-accent/40 text-matrix-accent hover:bg-matrix-accent/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Next Tip</span>
                </button>

                {hp < maxHp && (
                  <button
                    type="button"
                    onClick={() => {
                      healPlayer(25);
                      setMood("cool");
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-matrix-accent hover:bg-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
                    title="Emergency Field Medic Repair"
                  >
                    <Heart className="w-3.5 h-3.5 fill-matrix-accent" />
                    <span>+25 HP</span>
                  </button>
                )}

                {activeRealm && (
                  <Link
                    href={`/curriculum?file=${activeRealm.fileRef}`}
                    onClick={() => soundEngine.playSfx("click")}
                    className="py-1.5 px-2.5 rounded-lg bg-matrix-dark border border-matrix-border hover:border-matrix-neonCyan text-matrix-neonCyan text-xs font-bold flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Guide</span>
                  </Link>
                )}
              </div>
            </>
          ) : (
            /* Flashcard Mini-Quiz Mode */
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-matrix-dark border border-matrix-border space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-matrix-neonCyan/20 text-matrix-neonCyan font-bold">
                    {currentCard.realm} REALM
                  </span>
                  <span className="text-gray-400">
                    Card {quizIndex + 1}/{FLASHCARDS.length}
                  </span>
                </div>
                <div className="text-white font-bold leading-relaxed">{currentCard.q}</div>
              </div>

              <div className="space-y-1.5">
                {currentCard.options.map((opt, idx) => {
                  const isPicked = selectedOption === idx;
                  const isCorrect = idx === currentCard.answer;
                  return (
                    <button
                      type="button"
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => {
                        setSelectedOption(idx);
                        if (idx === currentCard.answer) {
                          soundEngine.playSfx("correct");
                          addXp(25, "Byte Quiz Drill");
                          setMood("cool");
                        } else {
                          soundEngine.playSfx("error");
                          setMood("thinking");
                        }
                      }}
                      className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all flex items-center justify-between ${
                        selectedOption === null
                          ? "bg-matrix-dark/70 border-matrix-border hover:border-matrix-neonCyan text-gray-200"
                          : isCorrect
                          ? "bg-matrix-accent/20 border-matrix-accent text-matrix-accent font-bold"
                          : isPicked
                          ? "bg-matrix-neonRed/20 border-matrix-neonRed text-matrix-neonRed"
                          : "bg-matrix-dark/30 border-matrix-border/40 text-gray-500"
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && isCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {selectedOption !== null && isPicked && !isCorrect && (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="p-2.5 rounded-lg bg-black/50 border border-matrix-border text-[11px] text-gray-300 space-y-2">
                  <p>{currentCard.explanation}</p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx("click");
                      setSelectedOption(null);
                      setQuizIndex((prev) => (prev + 1) % FLASHCARDS.length);
                    }}
                    className="w-full py-1.5 rounded bg-matrix-neonCyan text-matrix-dark font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Next Flashcard</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Player Cadet Briefing Footer */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-matrix-border/50">
            <span className="text-matrix-neonCyan">
              {rankTitle} (L{level})
            </span>
            <span>
              {completedQuests.length}/24 Quests • {completedBosses.length}/12 Bosses
            </span>
          </div>
        </div>
      )}

      {/* Floating Byte Character Orb */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playSfx(isOpen ? "click" : "skill-unlock");
          setIsOpen(!isOpen);
          if (!isOpen) {
            setMood("cool");
            setTimeout(() => setMood("happy"), 2000);
          }
        }}
        aria-label="Toggle Byte cybernetic familiar" className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xl transition-all cursor-pointer ${
          isOpen
            ? "bg-matrix-dark border-matrix-accent text-matrix-accent shadow-matrix-accent/30"
            : "bg-matrix-card/90 hover:bg-matrix-cardHover border-matrix-neonCyan text-white shadow-matrix-neonCyan/20 hover:scale-105"
        }`}
      >
        {/* Animated Cyber Eye Glow */}
        <div className="w-7 h-7 rounded-full bg-matrix-accent/20 border border-matrix-accent flex items-center justify-center text-[10px] font-extrabold text-matrix-accent group-hover:scale-110 transition-transform">
          {getEyeExpression()}
        </div>

        <span className="text-xs font-bold tracking-tight text-white group-hover:text-matrix-neonCyan transition-colors">
          Byte
        </span>

        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isOpen ? "bg-matrix-accent" : "bg-matrix-neonCyan animate-pulse"
          }`}
        />
      </button>
    </div>
  );
}
