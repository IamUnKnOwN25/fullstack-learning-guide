"use client";

import React, { useState } from "react";
import { soundEngine } from "@/lib/soundEngine";
import {
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Cpu,
  Database,
  Search,
  Eye,
  Zap,
} from "lucide-react";

interface Props {
  realmId: string;
}

export const SUPPORTED_VISUALIZER_REALMS = [
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "backend",
  "databases",
  "devops",
  "testing",
  "cs",
  "security",
  "capstone",
] as const;

export function RealmConceptVisualizer({ realmId }: Props) {
  const [selectedRealmId, setSelectedRealmId] = useState(realmId);

  React.useEffect(() => {
    setSelectedRealmId(realmId);
  }, [realmId]);

  // Common interactive state
  const [activeStep, setActiveStep] = useState(0);

  // CSS Flexbox visualizer state
  const [flexDirection, setFlexDirection] = useState<"row" | "column">("row");
  const [justifyContent, setJustifyContent] = useState<
    "flex-start" | "center" | "space-between" | "space-around"
  >("center");
  const [alignItems, setAlignItems] = useState<"flex-start" | "center" | "stretch">("center");

  // JS Event Loop visualizer state
  const [eventLoopStep, setEventLoopStep] = useState(0);

  // TypeScript Discriminated Union state
  const [tsUnionState, setTsUnionState] = useState<"loading" | "success" | "error">("success");
  const [tsStrictMode, setTsStrictMode] = useState(true);

  // Binary Search visualizer state
  const [searchTarget] = useState(42);
  const [searchStep, setSearchStep] = useState(0);
  const binaryArray = [2, 7, 14, 19, 25, 33, 42, 58, 64, 77, 89, 95];

  // React Re-render Heatmap state
  const [memoEnabled, setMemoEnabled] = useState(true);
  const [renderCount, setRenderCount] = useState(1);
  const [unmemoizedChildRenders, setUnmemoizedChildRenders] = useState(1);
  const [flashParent, setFlashParent] = useState(false);

  // Backend Express Middleware state
  const [backendScenario, setBackendScenario] = useState<"valid" | "unauth" | "ratelimit">("valid");

  // Security XSS visualizer state
  const [sanitizeOn, setSanitizeOn] = useState(true);
  const [xssInput, setXssInput] = useState("<img src=x onerror=alert('PWNED') />");

  // Database SQL Injection & B-Tree state
  const [isParameterized, setIsParameterized] = useState(true);
  const [hasBtreeIndex, setHasBtreeIndex] = useState(true);

  // DevOps Multi-Stage Docker state
  const [multiStageDocker, setMultiStageDocker] = useState(true);

  // Testing TDD state
  const [tddPhase, setTddPhase] = useState<"red" | "green" | "refactor">("green");

  // Capstone traffic scenario state
  const [capstoneFlow, setCapstoneFlow] = useState<"cache-hit" | "cache-miss" | "websocket">("cache-hit");

  const renderActiveRealmContent = () => {
    switch (selectedRealmId) {
      case "html": {
      const domTree = [
        { tag: "<html>", desc: "Root element containing document metadata and structure." },
        { tag: "<head>", desc: "Container for page title, viewport meta tags, and linked stylesheets." },
        { tag: "<body>", desc: "Visible document canvas rendered for human and screen-reader users." },
        { tag: "<header>", desc: "Semantic landmark containing site logo and navigational menus." },
        { tag: "<nav>", desc: "Major navigation links; screen readers announce landmark shortcut." },
        { tag: "<main>", desc: "Dominant unique content of the page; only 1 allowed per page." },
        { tag: "<article>", desc: "Self-contained, independently distributable composition." },
        { tag: "<footer>", desc: "Authorship, copyright, and auxiliary site links." },
      ];

      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Layers className="w-4 h-4 shrink-0" />
                Interactive Semantic DOM Tree Inspector
              </h4>
              <p className="text-[11px] text-gray-400">
                Click any tag node to inspect its accessibility landmark and semantic role.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-matrix-card border border-matrix-border text-matrix-accent text-[11px] font-bold whitespace-nowrap shrink-0">
              A11y Score: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 bg-matrix-dark/80 p-3.5 rounded-xl border border-matrix-border overflow-hidden">
              {domTree.map((item, idx) => {
                const indentPx = Math.min(idx * 6, 24);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx("click");
                      setActiveStep(idx);
                    }}
                    className={`text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 ${
                      activeStep === idx
                        ? "bg-matrix-accent/20 border border-matrix-accent text-matrix-accent font-bold shadow-sm"
                        : "hover:bg-matrix-card border border-transparent text-gray-300"
                    }`}
                    style={{
                      marginLeft: `${indentPx}px`,
                      width: `calc(100% - ${indentPx}px)`,
                    }}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      {idx > 0 && (
                        <span className="text-gray-600 text-[10px] select-none">└─</span>
                      )}
                      <span>{item.tag}</span>
                    </span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">
                      Node #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bg-matrix-card/80 p-4 rounded-xl border border-matrix-border space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-matrix-neonGold font-bold">
                  Inspected Semantic Node
                </span>
                <h5 className="text-base font-bold text-white mt-1">
                  {domTree[activeStep]?.tag}
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed mt-2 bg-matrix-dark/60 p-3 rounded-lg border border-matrix-border/50">
                  {domTree[activeStep]?.desc}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-matrix-neonCyan/10 border border-matrix-neonCyan/30 text-[11px] text-matrix-neonCyan space-y-1">
                <span className="font-bold block">Screen Reader Announcement:</span>
                <p className="text-gray-300 italic">
                  &ldquo;Entering {domTree[activeStep]?.tag.replace(/[<>]/g, "")} landmark, region 1 of 1.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "css": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Interactive Flexbox & Flow Playground
              </h4>
              <p className="text-[11px] text-gray-400">
                Toggle CSS properties below and watch the items physically reposition in real time!
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-matrix-card/80 p-3 rounded-xl border border-matrix-border">
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">
                flex-direction:
              </label>
              <div className="flex gap-1">
                {(["row", "column"] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx("click");
                      setFlexDirection(dir);
                    }}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-bold ${
                      flexDirection === dir
                        ? "bg-matrix-accent text-matrix-dark"
                        : "bg-matrix-dark border border-matrix-border text-gray-300"
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">
                justify-content:
              </label>
              <select
                value={justifyContent}
                onChange={(e) => {
                  soundEngine.playSfx("click");
                  setJustifyContent(e.target.value as any);
                }}
                className="w-full bg-matrix-dark border border-matrix-border rounded px-2 py-1 text-[11px] text-white"
              >
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">
                align-items:
              </label>
              <select
                value={alignItems}
                onChange={(e) => {
                  soundEngine.playSfx("click");
                  setAlignItems(e.target.value as any);
                }}
                className="w-full bg-matrix-dark border border-matrix-border rounded px-2 py-1 text-[11px] text-white"
              >
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="stretch">stretch</option>
              </select>
            </div>
          </div>

          {/* Interactive Physical Playground Container */}
          <div
            className="w-full min-h-[220px] bg-matrix-dark border-2 border-dashed border-matrix-accent/50 rounded-2xl p-4 flex flex-wrap gap-2.5 transition-all duration-300 shadow-inner"
            style={{
              flexDirection,
              justifyContent,
              alignItems,
            }}
          >
            {[
              { id: 1, label: "Item #1 (Nav)", color: "from-emerald-500 to-teal-700" },
              { id: 2, label: "Item #2 (Hero)", color: "from-cyan-500 to-blue-700" },
              { id: 3, label: "Item #3 (Card)", color: "from-purple-500 to-indigo-700" },
              { id: 4, label: "Item #4 (CTA)", color: "from-amber-500 to-orange-700" },
            ].map((box) => (
              <div
                key={box.id}
                className={`bg-gradient-to-br ${box.color} text-white font-bold text-xs px-3 py-2 rounded-xl shadow-lg flex items-center justify-center whitespace-nowrap transition-all duration-300 ${
                  alignItems === "stretch" && flexDirection === "row"
                    ? "min-h-[140px]"
                    : flexDirection === "column"
                    ? "min-h-[36px]"
                    : "min-w-[80px] min-h-[46px]"
                }`}
              >
                {box.label}
              </div>
            ))}
          </div>

          {/* Generated CSS snippet */}
          <div className="bg-black/50 p-3 rounded-xl border border-matrix-border text-matrix-neonCyan flex flex-wrap items-center justify-between gap-2">
            <code className="break-all">
              display: flex; flex-direction: {flexDirection}; justify-content: {justifyContent}; align-items: {alignItems}; gap: 12px;
            </code>
            <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">Live Computed CSS</span>
          </div>
        </div>
      );
    }

    case "javascript": {
      const steps = [
        {
          title: "Step 1: Script Enters Call Stack",
          stack: "console.log('Synchronous Start')",
          micro: "Empty",
          macro: "Empty",
          output: "1. Synchronous Start",
          desc: "Synchronous functions execute immediately on the single thread.",
        },
        {
          title: "Step 2: Promise.resolve() Enqueues Microtask",
          stack: "Promise.then()",
          micro: "Promise.then() callback",
          macro: "setTimeout() callback (0ms)",
          output: "Pending...",
          desc: "Promises enter the Microtask Queue. setTimeout enters the Macrotask Queue.",
        },
        {
          title: "Step 3: Call Stack Empties -> Draining Microtasks",
          stack: "Promise Callback",
          micro: "Empty (Drained)",
          macro: "setTimeout() callback (0ms)",
          output: "2. Microtask Promise Resolved",
          desc: "Crucial rule: Microtasks ALWAYS run before Macrotasks, even with setTimeout(0)!",
        },
        {
          title: "Step 4: Event Loop Dispatches Macrotask",
          stack: "setTimeout Callback",
          micro: "Empty",
          macro: "Empty (Drained)",
          output: "3. Macrotask Timeout Fired",
          desc: "Macrotask executes only after the entire microtask queue is completely exhausted.",
        },
      ];

      const current = steps[eventLoopStep];

      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonGold flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0" />
                JavaScript Event Loop & Microtask Simulator
              </h4>
              <p className="text-[11px] text-gray-400">
                Step through the event loop to see why Promises execute before setTimeout(0).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setEventLoopStep((prev) => (prev + 1) % steps.length);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-matrix-neonGold text-matrix-dark font-bold text-xs hover:scale-105 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Step Next ({eventLoopStep + 1}/4)</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-matrix-card p-3 rounded-xl border border-matrix-accent/40 space-y-2">
              <span className="text-[10px] uppercase text-matrix-accent font-bold">1. Call Stack</span>
              <div className="h-14 bg-matrix-dark p-2 rounded border border-matrix-border flex items-center justify-center font-bold text-matrix-accent text-center">
                {current.stack}
              </div>
            </div>

            <div className="bg-matrix-card p-3 rounded-xl border border-matrix-neonCyan/40 space-y-2">
              <span className="text-[10px] uppercase text-matrix-neonCyan font-bold">2. Microtask Queue</span>
              <div className="h-14 bg-matrix-dark p-2 rounded border border-matrix-border flex items-center justify-center font-bold text-matrix-neonCyan text-center">
                {current.micro}
              </div>
            </div>

            <div className="bg-matrix-card p-3 rounded-xl border border-orange-500/40 space-y-2">
              <span className="text-[10px] uppercase text-orange-400 font-bold">3. Macrotask Queue</span>
              <div className="h-14 bg-matrix-dark p-2 rounded border border-matrix-border flex items-center justify-center font-bold text-orange-300 text-center">
                {current.macro}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-matrix-border space-y-2">
            <div className="text-white font-bold">{current.title}</div>
            <p className="text-gray-400">{current.desc}</p>
            <div className="text-[11px] text-matrix-accent font-bold">
              Current Terminal Output: <span className="text-white">{current.output}</span>
            </div>
          </div>
        </div>
      );
    }

    case "cs": {
      const low = searchStep === 0 ? 0 : searchStep === 1 ? 6 : searchStep === 2 ? 6 : 6;
      const high = searchStep === 0 ? binaryArray.length - 1 : searchStep === 1 ? binaryArray.length - 1 : searchStep === 2 ? 8 : 6;
      const mid = Math.floor((low + high) / 2);
      const isFound = binaryArray[mid] === searchTarget;

      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Search className="w-4 h-4 shrink-0" />
                Binary Search Step-by-Step Animator (O(log N))
              </h4>
              <p className="text-[11px] text-gray-400">
                Target: <span className="text-matrix-neonGold font-bold font-mono">{searchTarget}</span> in a sorted array of 12 elements.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSearchStep((prev) => (prev < 3 ? prev + 1 : 0));
                }}
                className="px-3.5 py-1.5 rounded-lg bg-matrix-accent text-matrix-dark font-bold text-xs hover:scale-105 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>{searchStep < 3 ? "Next Halving Step" : "Reset Animation"}</span>
              </button>
            </div>
          </div>

          {/* Array visualization */}
          <div className="overflow-x-auto p-2 bg-matrix-dark rounded-xl border border-matrix-border">
            <div className="flex items-center gap-1.5 min-w-max justify-center py-4">
              {binaryArray.map((val, idx) => {
                const isInRange = idx >= low && idx <= high;
                const isMid = idx === mid;
                const isTarget = val === searchTarget && isFound;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-gray-500">[{idx}]</span>
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                        isTarget
                          ? "bg-matrix-accent text-matrix-dark scale-110 shadow-lg shadow-matrix-accent/50 animate-bounce"
                          : isMid
                          ? "bg-matrix-neonGold text-matrix-dark scale-105 shadow-md shadow-matrix-neonGold/30"
                          : isInRange
                          ? "bg-matrix-card border border-matrix-border text-white"
                          : "bg-gray-900/40 border border-gray-800 text-gray-600 opacity-40 line-through"
                      }`}
                    >
                      {val}
                    </div>
                    {isMid && (
                      <span className="text-[9px] font-bold text-matrix-neonGold">MID</span>
                    )}
                    {idx === low && !isMid && (
                      <span className="text-[9px] font-bold text-matrix-neonCyan">LOW</span>
                    )}
                    {idx === high && !isMid && (
                      <span className="text-[9px] font-bold text-matrix-neonPurple">HIGH</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-matrix-border text-xs space-y-1">
            <div className="text-matrix-neonCyan font-bold">
              Step {searchStep + 1}: low={low}, high={high}, mid={mid} (Value={binaryArray[mid]})
            </div>
            <p className="text-gray-300">
              {isFound
                ? "🎉 Target 42 found at index 6 in only 3 comparisons! Linear search would have needed 7 checks."
                : binaryArray[mid] < searchTarget
                ? `${binaryArray[mid]} is less than 42. Discarding left half (indices 0 to ${mid}). Next low = ${mid + 1}.`
                : `${binaryArray[mid]} is greater than 42. Discarding right half. Next high = ${mid - 1}.`}
            </p>
          </div>
        </div>
      );
    }

    case "security": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonRed flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                Interactive XSS Injection & Sanitization Lab
              </h4>
              <p className="text-[11px] text-gray-400">
                Inject malicious payloads and toggle the HTML Sanitizer Shield to see real-time defense.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setSanitizeOn(!sanitizeOn);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                sanitizeOn
                  ? "bg-matrix-accent text-matrix-dark shadow-sm shadow-matrix-accent/30"
                  : "bg-matrix-neonRed text-white shadow-sm shadow-red-900/50"
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Sanitizer Shield: {sanitizeOn ? "ACTIVE (Safe)" : "DISABLED (Vulnerable)"}</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase text-gray-400 block font-bold">
              Untrusted User Input Payload:
            </label>
            <input
              type="text"
              value={xssInput}
              onChange={(e) => setXssInput(e.target.value)}
              className="w-full bg-matrix-dark border border-matrix-border rounded-lg px-3 py-2 text-xs text-matrix-neonCyan outline-none focus:border-matrix-neonCyan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-matrix-card border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">
                Sanitized Entity String
              </span>
              <code className="text-xs text-matrix-accent block bg-black/60 p-3 rounded border border-matrix-border break-all">
                {sanitizeOn
                  ? xssInput
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#x27;")
                  : xssInput}
              </code>
            </div>

            <div className="p-4 rounded-xl bg-matrix-card border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">
                Browser DOM Execution Result
              </span>
              <div
                className={`p-3 rounded border text-xs font-bold flex items-center gap-2 ${
                  sanitizeOn
                    ? "bg-emerald-950/30 border-emerald-800 text-matrix-accent"
                    : "bg-red-950/30 border-red-800 text-matrix-neonRed animate-pulse"
                }`}
              >
                {sanitizeOn ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Harmless text rendered on screen. Script tags neutralized!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>CRITICAL: Unescaped string injected into DOM! Cookie theft payload triggered!</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "typescript": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                Discriminated Union & Type Narrowing Lab
              </h4>
              <p className="text-[11px] text-gray-400">
                Simulate API response states and compare compile-time narrowing vs unsafe &apos;any&apos; casts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setTsStrictMode(!tsStrictMode);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
                tsStrictMode
                  ? "bg-matrix-accent text-matrix-dark"
                  : "bg-matrix-neonRed text-white"
              }`}
            >
              {tsStrictMode ? "strictNullChecks: ON" : "Unsafe 'any' Mode: ON"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400">Union Discriminant (state.status):</span>
            {(["loading", "success", "error"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setTsUnionState(status);
                }}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                  tsUnionState === status
                    ? "bg-matrix-neonCyan/20 border-matrix-neonCyan text-matrix-neonCyan"
                    : "bg-matrix-dark border-matrix-border text-gray-400"
                }`}
              >
                &quot;{status}&quot;
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-matrix-dark border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-matrix-neonGold font-bold">
                Active Runtime Payload
              </span>
              <pre className="text-xs text-matrix-accent bg-black/50 p-3 rounded border border-matrix-border overflow-x-auto">
                {tsUnionState === "loading"
                  ? `{ status: "loading" }`
                  : tsUnionState === "success"
                  ? `{ status: "success",\n  data: { operator: "Trinity", level: 12 }\n}`
                  : `{ status: "error",\n  error: "503 Matrix Gateway Timeout"\n}`}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-matrix-card border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-matrix-neonCyan font-bold">
                TypeScript Compiler & Runtime Verdict
              </span>
              {tsStrictMode ? (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 text-matrix-accent space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Narrowed Type: {tsUnionState === "loading" ? "LoadingState" : tsUnionState === "success" ? "SuccessState" : "ErrorState"}
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    {tsUnionState === "success"
                      ? "Compiler permits safe access to state.data.operator ('Trinity')."
                      : `Compiler blocks state.data access at build time! Must handle '${tsUnionState}' branch first.`}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-800 text-matrix-neonRed space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {tsUnionState === "success" ? "Lucky Pass (Unchecked)" : "RUNTIME CRASH: TypeError!"}
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    {tsUnionState === "success"
                      ? "state.data.operator worked by luck, but zero compile-time protection exists."
                      : "Cannot read properties of undefined (reading 'operator'). Using 'any' bypassed compiler wards!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    case "react": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0" />
                React Render Flamegraph & Memoization Lab
              </h4>
              <p className="text-[11px] text-gray-400">
                Trigger parent state updates and observe how React.memo + useCallback prevent wasted child re-renders.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setMemoEnabled(!memoEnabled);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all whitespace-nowrap shrink-0 ${
                  memoEnabled
                    ? "bg-matrix-accent/20 border-matrix-accent text-matrix-accent"
                    : "bg-matrix-neonRed/20 border-matrix-neonRed text-matrix-neonRed"
                }`}
              >
                React.memo: {memoEnabled ? "ENABLED" : "DISABLED"}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("attack");
                  setRenderCount((c) => c + 1);
                  if (!memoEnabled) {
                    setUnmemoizedChildRenders((c) => c + 1);
                  }
                  setFlashParent(true);
                  setTimeout(() => setFlashParent(false), 350);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-matrix-neonCyan text-matrix-dark font-bold text-xs hover:opacity-90 transition-all whitespace-nowrap shrink-0"
              >
                Trigger Parent setState (+1)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-matrix-dark border border-matrix-border space-y-4">
            <div
              className={`p-3.5 rounded-xl border transition-all flex flex-wrap items-center justify-between gap-2 ${
                flashParent
                  ? "bg-matrix-neonCyan/20 border-matrix-neonCyan"
                  : "bg-matrix-card border-matrix-border"
              }`}
            >
              <div>
                <span className="text-[10px] uppercase text-matrix-neonCyan font-bold block">
                  Root Parent Component
                </span>
                <span className="font-bold text-white">&lt;MatrixDashboard /&gt;</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-black/60 text-matrix-neonCyan font-bold whitespace-nowrap shrink-0">
                Renders: {renderCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-matrix-border">
              <div className="p-3 rounded-xl bg-matrix-card border border-matrix-accent/40 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-matrix-accent block">Stateful Target</span>
                  <span className="font-bold text-white break-all">&lt;CounterBadge count={renderCount} /&gt;</span>
                </div>
                <span className="px-2 py-1 rounded bg-matrix-accent/20 text-matrix-accent font-bold whitespace-nowrap shrink-0">
                  Renders: {renderCount}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 transition-all ${
                  memoEnabled
                    ? "bg-matrix-card border-matrix-border text-gray-300"
                    : "bg-red-950/30 border-matrix-neonRed text-matrix-neonRed"
                }`}
              >
                <div className="min-w-0">
                  <span className="text-[10px] block">
                    {memoEnabled ? "Memoized Heavy Child (Skipped!)" : "Un-memoized Heavy Child (Wasted Render!)"}
                  </span>
                  <span className="font-bold text-white break-all">&lt;HeavyAnalyticsChart /&gt;</span>
                </div>
                <span className="px-2 py-1 rounded bg-black/60 font-bold whitespace-nowrap shrink-0">
                  Renders: {unmemoizedChildRenders}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "backend": {
      const pipeline =
        backendScenario === "valid"
          ? [
              { stage: "1. CORS & JSON Parser", status: "PASS", detail: "Origin allowed, body parsed" },
              { stage: "2. Token Bucket Rate Limiter", status: "PASS", detail: "12/100 reqs in window" },
              { stage: "3. verifyToken JWT Guard", status: "PASS", detail: "HS256 signature valid (req.user = op-01)" },
              { stage: "4. POST /api/tasks Controller", status: "201 CREATED", detail: "{ id: 'task-1', status: 'created' }" },
            ]
          : backendScenario === "unauth"
          ? [
              { stage: "1. CORS & JSON Parser", status: "PASS", detail: "Origin allowed" },
              { stage: "2. Token Bucket Rate Limiter", status: "PASS", detail: "13/100 reqs in window" },
              { stage: "3. verifyToken JWT Guard", status: "401 BLOCKED", detail: "JsonWebTokenError: invalid signature" },
              { stage: "4. POST /api/tasks Controller", status: "SKIPPED", detail: "Short-circuited by auth guard" },
            ]
          : [
              { stage: "1. CORS & JSON Parser", status: "PASS", detail: "Origin allowed" },
              { stage: "2. Token Bucket Rate Limiter", status: "429 BLOCKED", detail: "Rate limit exceeded (Retry-After: 60s)" },
              { stage: "3. verifyToken JWT Guard", status: "SKIPPED", detail: "Protected from CPU exhaustion" },
              { stage: "4. POST /api/tasks Controller", status: "SKIPPED", detail: "Database pool protected" },
            ];

      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-accent flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Express Middleware & JWT Pipeline Simulator
              </h4>
              <p className="text-[11px] text-gray-400">
                Dispatch simulated HTTP requests through the Express middleware pipeline.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "valid", label: "Valid Bearer JWT Request" },
              { id: "unauth", label: "Tampered / Missing JWT" },
              { id: "ratelimit", label: "DDoS Traffic Spike (250 req/s)" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setBackendScenario(item.id as "valid" | "unauth" | "ratelimit");
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                  backendScenario === item.id
                    ? "bg-matrix-neonCyan/20 border-matrix-neonCyan text-matrix-neonCyan"
                    : "bg-matrix-dark border-matrix-border text-gray-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {pipeline.map((step, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-matrix-dark border border-matrix-border flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-white">{step.stage}</div>
                  <div className="text-[11px] text-gray-400">{step.detail}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 ${
                    step.status.includes("PASS") || step.status.includes("201")
                      ? "bg-matrix-accent/20 text-matrix-accent"
                      : step.status.includes("BLOCKED")
                      ? "bg-matrix-neonRed/20 text-matrix-neonRed"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "databases": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonPurple flex items-center gap-2">
                <Database className="w-4 h-4 shrink-0" />
                PostgreSQL Parameterized Queries & B-Tree Index Planner
              </h4>
              <p className="text-[11px] text-gray-400">
                Compare prepared statements ($1) and B-Tree index lookup speed on a 1,000,000-row table.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setIsParameterized(!isParameterized);
                }}
                className={`px-3 py-1 rounded-lg border font-bold text-[11px] whitespace-nowrap shrink-0 ${
                  isParameterized
                    ? "bg-matrix-accent/20 border-matrix-accent text-matrix-accent"
                    : "bg-matrix-neonRed/20 border-matrix-neonRed text-matrix-neonRed"
                }`}
              >
                {isParameterized ? "Parameterized ($1)" : "Raw Concatenation"}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setHasBtreeIndex(!hasBtreeIndex);
                }}
                className={`px-3 py-1 rounded-lg border font-bold text-[11px] whitespace-nowrap shrink-0 ${
                  hasBtreeIndex
                    ? "bg-matrix-neonCyan/20 border-matrix-neonCyan text-matrix-neonCyan"
                    : "bg-amber-500/20 border-amber-500 text-amber-300"
                }`}
              >
                {hasBtreeIndex ? "B-Tree Index: ON" : "B-Tree Index: OFF"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-matrix-dark border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">
                SQL Execution Plan (input: &quot;admin&apos; OR 1=1 --&quot;)
              </span>
              <code className="block p-3 rounded bg-black/60 border border-matrix-border text-matrix-neonCyan">
                {isParameterized
                  ? "SELECT * FROM users WHERE email = $1;\n-- Bind Param $1: \"admin' OR 1=1 --\" (Literal String)"
                  : "SELECT * FROM users WHERE email = 'admin' OR 1=1 --';\n-- CRITICAL: Always evaluates TRUE, dumps entire table!"}
              </code>
            </div>

            <div className="p-4 rounded-xl bg-matrix-card border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">
                EXPLAIN ANALYZE Telemetry
              </span>
              <div className="p-3 rounded bg-black/60 border border-matrix-border space-y-1">
                <div className="font-bold text-matrix-accent">
                  Strategy: {hasBtreeIndex ? "Index Scan using idx_users_email (O(log N))" : "Seq Scan on users (O(N) Full Table Scan)"}
                </div>
                <div className="text-gray-300">
                  Execution Time: <strong>{hasBtreeIndex ? "0.38 ms (3 tree hops)" : "148.60 ms (1,000,000 rows checked)"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "devops": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Layers className="w-4 h-4 shrink-0" />
                Multi-Stage Docker Image Size & Layer Optimizer
              </h4>
              <p className="text-[11px] text-gray-400">
                Toggle Multi-Stage Alpine builds to strip build toolchains and shrink container attack surface.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setMultiStageDocker(!multiStageDocker);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap shrink-0 ${
                multiStageDocker
                  ? "bg-matrix-accent text-matrix-dark"
                  : "bg-amber-500 text-matrix-dark"
              }`}
            >
              {multiStageDocker ? "Mode: Multi-Stage Alpine (138 MB)" : "Mode: Single-Stage Fat Image (1.18 GB)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-matrix-dark border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-matrix-neonCyan font-bold">
                Stage 1: Builder Container (node:20-alpine)
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-matrix-card border border-matrix-border">✓ OS Base + Node 20 Runtime (110 MB)</div>
                <div className="p-2 rounded bg-matrix-card border border-matrix-border">✓ devDependencies + TypeScript Compiler (640 MB)</div>
                <div className="p-2 rounded bg-matrix-card border border-matrix-border">✓ Compiled Production Bundle /app/dist (28 MB)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-matrix-card border border-matrix-border space-y-2">
              <span className="text-[10px] uppercase text-matrix-accent font-bold">
                Final Shipped Production Container
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-matrix-dark border border-matrix-accent/40 text-matrix-accent">
                  ✓ node:20-alpine Minimal Runtime (110 MB)
                </div>
                <div className="p-2 rounded bg-matrix-dark border border-matrix-accent/40 text-matrix-accent">
                  ✓ COPY --from=builder /app/dist (28 MB)
                </div>
                {!multiStageDocker && (
                  <div className="p-2 rounded bg-red-950/40 border border-matrix-neonRed text-matrix-neonRed">
                    ✗ BLOAT: 1,040 MB of devDependencies, compilers & source caches shipped to prod!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "testing": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-accent flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                TDD Red-Green-Refactor & Vitest Spy Lab
              </h4>
              <p className="text-[11px] text-gray-400">
                Inspect each phase of the Test-Driven Development loop and deterministic mock isolation.
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {(["red", "green", "refactor"] as const).map((phase) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setTddPhase(phase);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold uppercase text-[11px] border whitespace-nowrap shrink-0 ${
                    tddPhase === phase
                      ? phase === "red"
                        ? "bg-matrix-neonRed text-white border-matrix-neonRed"
                        : phase === "green"
                        ? "bg-matrix-accent text-matrix-dark border-matrix-accent"
                        : "bg-matrix-neonCyan text-matrix-dark border-matrix-neonCyan"
                      : "bg-matrix-dark border-matrix-border text-gray-400"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-matrix-dark border border-matrix-border space-y-3">
            <div className="text-sm font-bold text-white">
              {tddPhase === "red"
                ? "1. RED Phase: Write a Failing Specification First"
                : tddPhase === "green"
                ? "2. GREEN Phase: Write Minimal Code to Pass Assertions"
                : "3. REFACTOR Phase: Clean Up Structure While Tests Guard Behavior"}
            </div>
            <p className="text-gray-300 leading-relaxed">
              {tddPhase === "red"
                ? "Before writing implementation code, express the exact business requirement using expect(calculateXp(100)).toBe(125). Watching it fail proves the test cannot produce a false positive."
                : tddPhase === "green"
                ? "Implement the simplest pure function or mock spy (vi.fn().mockResolvedValue(...)) that satisfies the test contract in <10ms without external network calls."
                : "Extract helpers, eliminate duplication, and tighten types with 100% confidence—if any edge case breaks, the Vitest suite alerts you in milliseconds."}
            </p>
          </div>
        </div>
      );
    }

    case "capstone": {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonGold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Full-Stack Capstone System Architecture Simulator
              </h4>
              <p className="text-[11px] text-gray-400">
                Simulate production traffic across Edge Next.js, Node API Gateway, Redis Cache, and PostgreSQL.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "cache-hit", label: "GET /tasks (Redis Cache Hit • 2ms)" },
              { id: "cache-miss", label: "POST /tasks (Postgres ACID Write + Cache Invalidate • 34ms)" },
              { id: "websocket", label: "WebSocket Board Broadcast (Real-Time Sync • 8ms)" },
            ].map((flow) => (
              <button
                key={flow.id}
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setCapstoneFlow(flow.id as "cache-hit" | "cache-miss" | "websocket");
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                  capstoneFlow === flow.id
                    ? "bg-matrix-neonGold/20 border-matrix-neonGold text-matrix-neonGold"
                    : "bg-matrix-dark border-matrix-border text-gray-400"
                }`}
              >
                {flow.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "1. Next.js 15 Edge UI", role: "Optimistic UI + RSC", active: true },
              { name: "2. Node API Gateway", role: "JWT + Zod + Rate Limit", active: true },
              {
                name: "3. Redis 7 Cluster",
                role: capstoneFlow === "cache-hit" ? "HIT: Sub-2ms Return" : capstoneFlow === "cache-miss" ? "DEL key (Invalidated)" : "Pub/Sub Channel",
                active: true,
              },
              {
                name: "4. PostgreSQL 16",
                role: capstoneFlow === "cache-hit" ? "Bypassed (0 DB Load)" : capstoneFlow === "cache-miss" ? "INSERT + B-Tree Index" : "Read Replica Sync",
                active: capstoneFlow !== "cache-hit",
              },
            ].map((node, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border space-y-1 ${
                  node.active
                    ? "bg-matrix-card border-matrix-accent text-white shadow-sm shadow-matrix-accent/20"
                    : "bg-matrix-dark/40 border-matrix-border text-gray-500"
                }`}
              >
                <div className="font-bold text-matrix-neonCyan">{node.name}</div>
                <div className="text-[11px] text-gray-300">{node.role}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default: {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                {selectedRealmId.toUpperCase()} Interactive Concept Simulator
              </h4>
              <p className="text-[11px] text-gray-400">
                Explore core mechanics, state flow, and architectural principles for this realm.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-matrix-card/80 border border-matrix-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-matrix-neonCyan/20 text-matrix-neonCyan border border-matrix-neonCyan/40 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-white text-sm">Interactive Playground Ready</h5>
                <p className="text-xs text-gray-400">
                  Switch back to the Code Editor or Live Preview to execute solutions for this trial.
                </p>
              </div>
            </div>

            <div className="bg-black/50 p-3.5 rounded-xl border border-matrix-border text-xs text-gray-300 space-y-2">
              <div className="text-matrix-neonGold font-bold">Key Architectural Invariant:</div>
              <p>
                In the {selectedRealmId} realm, prioritize deterministic state management, pure functions, and non-blocking asynchronous operations to prevent latency spikes and race conditions.
              </p>
            </div>
          </div>
        </div>
      );
    }
    }
  };

  return (
    <div className="flex flex-col">
      {/* 12-Realm Concept Lab Switcher Bar */}
      <div className="px-4 py-2 border-b border-matrix-border bg-matrix-card/40 flex items-center gap-1.5 overflow-x-auto font-mono text-[10px]">
        <span className="text-gray-400 uppercase font-bold whitespace-nowrap shrink-0 mr-1">
          Lab:
        </span>
        {SUPPORTED_VISUALIZER_REALMS.map((r) => {
          const isCurrent = selectedRealmId === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setSelectedRealmId(r);
              }}
              className={`px-2 py-0.5 rounded uppercase font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isCurrent
                  ? "bg-matrix-neonPurple text-white shadow-sm"
                  : "bg-matrix-dark border border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              {r === "javascript" ? "js" : r === "typescript" ? "ts" : r === "databases" ? "sql" : r}
            </button>
          );
        })}
      </div>
      {renderActiveRealmContent()}
    </div>
  );
}
