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

export function RealmConceptVisualizer({ realmId }: Props) {
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

  // Binary Search visualizer state
  const [searchTarget, setSearchTarget] = useState(42);
  const [searchStep, setSearchStep] = useState(0);
  const binaryArray = [2, 7, 14, 19, 25, 33, 42, 58, 64, 77, 89, 95];

  // React Re-render Heatmap state
  const [memoEnabled, setMemoEnabled] = useState(true);
  const [renderCount, setRenderCount] = useState(0);
  const [flashParent, setFlashParent] = useState(false);

  // Security XSS visualizer state
  const [sanitizeOn, setSanitizeOn] = useState(true);
  const [xssInput, setXssInput] = useState("<img src=x onerror=alert('PWNED') />");

  // Database SQL Injection state
  const [isParameterized, setIsParameterized] = useState(true);

  // Render Visualizer per realm
  switch (realmId) {
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
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Interactive Semantic DOM Tree Inspector
              </h4>
              <p className="text-[11px] text-gray-400">
                Click any tag node to inspect its accessibility landmark and semantic role.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-matrix-card border border-matrix-border text-matrix-accent text-[11px]">
              A11y Score: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 bg-matrix-dark/80 p-3.5 rounded-xl border border-matrix-border">
              {domTree.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx("click");
                    setActiveStep(idx);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                    activeStep === idx
                      ? "bg-matrix-accent/20 border border-matrix-accent text-matrix-accent font-bold shadow-sm"
                      : "hover:bg-matrix-card border border-transparent text-gray-300"
                  }`}
                  style={{ marginLeft: `${Math.min(idx * 8, 32)}px` }}
                >
                  <span>{item.tag}</span>
                  <span className="text-[10px] text-gray-500">Node #{idx + 1}</span>
                </button>
              ))}
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
            className="w-full h-48 bg-matrix-dark border-2 border-dashed border-matrix-accent/50 rounded-2xl p-4 flex gap-3 transition-all duration-300 overflow-hidden shadow-inner"
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
                className={`bg-gradient-to-br ${box.color} text-white font-bold text-xs p-3 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300 ${
                  alignItems === "stretch" && flexDirection === "row" ? "h-full" : "min-w-[80px] min-h-[50px]"
                }`}
              >
                {box.label}
              </div>
            ))}
          </div>

          {/* Generated CSS snippet */}
          <div className="bg-black/50 p-3 rounded-xl border border-matrix-border text-matrix-neonCyan flex items-center justify-between">
            <code>
              display: flex; flex-direction: {flexDirection}; justify-content: {justifyContent}; align-items: {alignItems}; gap: 12px;
            </code>
            <span className="text-[10px] text-gray-500">Live Computed CSS</span>
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
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonGold flex items-center gap-2">
                <Zap className="w-4 h-4" />
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
              className="px-3.5 py-1.5 rounded-lg bg-matrix-neonGold text-matrix-dark font-bold text-xs hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>Step Next ({eventLoopStep + 1}/4)</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Search className="w-4 h-4" />
                Binary Search Step-by-Step Animator (O(log N))
              </h4>
              <p className="text-[11px] text-gray-400">
                Target: <span className="text-matrix-neonGold font-bold font-mono">{searchTarget}</span> in a sorted array of 12 elements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSearchStep((prev) => (prev < 3 ? prev + 1 : 0));
                }}
                className="px-3.5 py-1.5 rounded-lg bg-matrix-accent text-matrix-dark font-bold text-xs hover:scale-105 transition-all flex items-center gap-1.5"
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
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonRed flex items-center gap-2">
                <Shield className="w-4 h-4" />
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
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                sanitizeOn
                  ? "bg-matrix-accent text-matrix-dark shadow-sm shadow-matrix-accent/30"
                  : "bg-matrix-neonRed text-white shadow-sm shadow-red-900/50"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
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

    default: {
      return (
        <div className="p-4 sm:p-6 space-y-5 text-gray-200 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-matrix-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-matrix-neonCyan flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                {realmId.toUpperCase()} Interactive Concept Simulator
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
                In the {realmId} realm, prioritize deterministic state management, pure functions, and non-blocking asynchronous operations to prevent latency spikes and race conditions.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}
