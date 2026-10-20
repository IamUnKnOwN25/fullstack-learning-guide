"use client";

import React, { useState } from "react";
import Link from "next/link";
import { REALMS, Realm } from "@/data/realms";
import { QUESTS } from "@/data/quests";
import { BOSSES } from "@/data/bosses";
import { useGameStore } from "@/lib/gameStore";
import { soundEngine } from "@/lib/soundEngine";
import {
  Lock,
  Sparkles,
  Swords,
  Star,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Terminal,
  MapPin,
  Trophy,
  Flame,
  Search,
  Filter,
  Compass,
  LayoutGrid,
} from "lucide-react";
import { ConstellationWorldMap } from "./ConstellationWorldMap";

type RealmCategory = "all" | "frontend" | "backend" | "devops" | "theory";

const REALM_CATEGORIES: Record<string, RealmCategory> = {
  html: "frontend",
  css: "frontend",
  javascript: "frontend",
  typescript: "frontend",
  react: "frontend",
  backend: "backend",
  databases: "backend",
  devops: "devops",
  testing: "devops",
  cs: "theory",
  security: "theory",
  capstone: "theory",
};

export function WorldCampaignMap() {
  const { unlockedRealms, completedQuests, completedBosses, level, rankTitle, stars } = useGameStore();
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(REALMS[0]);
  const [activeCategory, setActiveCategory] = useState<RealmCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapView, setMapView] = useState<"constellation" | "grid">("constellation");

  const totalStars = Object.values(stars).reduce((sum, s) => sum + s, 0);

  // Determine recommended next uncompleted quest or boss
  const nextCampaignTarget = React.useMemo(() => {
    for (const r of REALMS) {
      const rQuests = QUESTS[r.id] || [];
      for (const q of rQuests) {
        if (!completedQuests.includes(q.id)) {
          return {
            type: "quest" as const,
            label: `Continue: ${q.title}`,
            href: `/quest/${r.id}/${q.id}`,
          };
        }
      }
      if (!completedBosses.includes(r.id) && BOSSES[r.id]) {
        return {
          type: "boss" as const,
          label: `Boss Ready: ${BOSSES[r.id].name}`,
          href: `/boss/${r.id}`,
        };
      }
    }
    return null;
  }, [completedQuests, completedBosses]);

  const filteredRealms = REALMS.filter((realm) => {
    const category = REALM_CATEGORIES[realm.id] || "theory";
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      realm.title.toLowerCase().includes(query) ||
      realm.realmName.toLowerCase().includes(query) ||
      realm.description.toLowerCase().includes(query) ||
      realm.id.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Mission Briefing & World Map Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-matrix-card via-matrix-dark to-matrix-card border border-matrix-border p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-matrix-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-matrix-accent/10 border border-matrix-accent/30 text-matrix-accent text-xs font-mono font-bold">
              <MapPin className="w-3.5 h-3.5 animate-pulse text-matrix-neonCyan" />
              WORLD MAP • 12 CAMPAIGN REALMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Web Matrix Campaign Map
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              This is the interactive <strong>World Map</strong>. Journey through the twelve realms of full-stack engineering,
              from foundational HTML semantics to distributed system design and capstone architecture.
              Select any realm below to inspect its lore, practice interactive coding quests, and defeat Bug Guardians!
            </p>

            {/* Campaign Stats Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
              <div className="px-3 py-1 rounded-lg bg-matrix-dark border border-matrix-border flex items-center gap-1.5 text-matrix-neonCyan">
                <MapPin className="w-3.5 h-3.5" />
                <span>Realms: {completedBosses.length}/12 Cleared</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-matrix-dark border border-matrix-border flex items-center gap-1.5 text-matrix-accent">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quests: {completedQuests.length}/24 Mastered</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-matrix-dark border border-matrix-border flex items-center gap-1.5 text-matrix-neonGold">
                <Star className="w-3.5 h-3.5 fill-matrix-neonGold" />
                <span>Stars: {totalStars} Earned</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {nextCampaignTarget && (
              <Link
                href={nextCampaignTarget.href}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-matrix-accent to-matrix-neonCyan text-matrix-dark font-mono text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-matrix-accent/20 hover:scale-105"
                onClick={() => soundEngine.playSfx("click")}
              >
                <Sparkles className="w-4 h-4 fill-matrix-dark" />
                <span>{nextCampaignTarget.label}</span>
              </Link>
            )}

            <Link
              href="/curriculum"
              className="px-4 py-2.5 rounded-xl bg-matrix-card hover:bg-matrix-cardHover border border-matrix-border text-gray-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              onClick={() => soundEngine.playSfx("click")}
            >
              <BookOpen className="w-4 h-4 text-matrix-neonCyan" />
              Curriculum Vault
            </Link>
          </div>
        </div>
      </div>

      {/* Full Campaign Grandmaster Banner (if all 12 bosses are cleared) */}
      {completedBosses.length === 12 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-matrix-neonGold/20 via-matrix-accent/15 to-matrix-neonCyan/20 border-2 border-matrix-neonGold/60 shadow-xl shadow-matrix-neonGold/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-matrix-neonGold/20 border border-matrix-neonGold/50 flex items-center justify-center text-matrix-neonGold text-2xl shadow-md">
              👑
            </div>
            <div>
              <h4 className="text-base font-bold text-matrix-neonGold flex items-center gap-2">
                Full-Stack Matrix Restored!
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                All 12 Realm Bug Guardians have been vanquished. You have achieved true full-stack engineering transcendence!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playSfx("victory");
            }}
            className="px-4 py-2.5 rounded-xl bg-matrix-neonGold hover:bg-yellow-400 text-matrix-dark font-mono text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
          >
            Play Victory Fanfare
          </button>
        </div>
      )}

      {/* Realm Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-matrix-card/60 p-3.5 rounded-xl border border-matrix-border">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {(
            [
              { id: "all", label: "All Realms (12)" },
              { id: "frontend", label: "Frontend" },
              { id: "backend", label: "Backend & DB" },
              { id: "devops", label: "DevOps & QA" },
              { id: "theory", label: "CS & Capstone" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playSfx("click");
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-matrix-neonCyan/20 border border-matrix-neonCyan text-matrix-neonCyan shadow-sm shadow-matrix-neonCyan/20"
                  : "bg-matrix-dark border border-matrix-border text-gray-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & View Switcher Controls */}
        <div className="flex items-center gap-3">
          {/* View Switcher: Constellation Map vs Grid */}
          <div className="flex items-center gap-1 bg-matrix-dark p-1 rounded-lg border border-matrix-border shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setMapView("constellation");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                mapView === "constellation"
                  ? "bg-matrix-neonCyan text-matrix-dark shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Constellation</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx("click");
                setMapView("grid");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                mapView === "grid"
                  ? "bg-matrix-accent text-matrix-dark shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search realms, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-matrix-dark border border-matrix-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-matrix-neonCyan font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Realm Grid & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Constellation Node Network OR 12 Realm Cards Grid */}
        <div className="lg:col-span-2">
          {mapView === "constellation" ? (
            <ConstellationWorldMap
              selectedRealm={selectedRealm}
              onSelectRealm={(realm) => {
                setSelectedRealm(realm);
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setTimeout(() => {
                    document.getElementById("realm-inspector")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }
              }}
              unlockedRealms={unlockedRealms}
              completedBosses={completedBosses}
              completedQuests={completedQuests}
              level={level}
              highlightedRealmIds={filteredRealms.map((r) => r.id)}
            />
          ) : filteredRealms.length === 0 ? (
            <div className="p-12 rounded-2xl bg-matrix-card/50 border border-dashed border-matrix-border text-center space-y-3 font-mono">
              <Search className="w-8 h-8 text-gray-600 mx-auto" />
              <h3 className="text-sm font-bold text-gray-300">No realms found</h3>
              <p className="text-xs text-gray-500">
                No campaign realms match &ldquo;{searchQuery}&rdquo; in the selected category.
              </p>
              <button
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="px-3 py-1.5 rounded-lg bg-matrix-accent/10 border border-matrix-accent/30 text-matrix-accent text-xs font-bold hover:bg-matrix-accent/20 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredRealms.map((realm) => {
                const isUnlocked = unlockedRealms.includes(realm.id) || level >= realm.requiredLevel;
                const isCompleted = completedBosses.includes(realm.id);
                const isSelected = selectedRealm?.id === realm.id;
                const realmQuests = QUESTS[realm.id] || [];
                const completedCount = realmQuests.filter((q) =>
                  completedQuests.includes(q.id)
                ).length;

                return (
                  <div
                    key={realm.id}
                onClick={() => {
                  soundEngine.playSfx("click");
                  setSelectedRealm(realm);
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setTimeout(() => {
                      document.getElementById("realm-inspector")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }
                }}
                className={`relative group p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "bg-matrix-cardHover border-matrix-accent shadow-lg shadow-matrix-accent/10 ring-1 ring-matrix-accent"
                    : isUnlocked
                    ? "bg-matrix-card/80 border-matrix-border hover:border-gray-500 hover:bg-matrix-cardHover"
                    : "bg-matrix-dark/40 border-matrix-border/50 opacity-60 hover:opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                          isUnlocked
                            ? "bg-matrix-accent/20 border-matrix-accent/50 text-matrix-accent shadow-sm shadow-matrix-accent/20"
                            : "bg-gray-800 border-gray-700 text-gray-500"
                        }`}
                      >
                        {String(realm.order).padStart(2, "0")}
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                          {realm.realmName}
                        </span>
                        <h3 className="font-bold text-base text-white group-hover:text-matrix-neonCyan transition-colors">
                          {realm.title}
                        </h3>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="p-1 rounded-full bg-matrix-accent/20 text-matrix-accent">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="p-1 rounded-full bg-gray-800 text-gray-500">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {realm.description}
                  </p>
                </div>

                {/* Progress Footer */}
                <div className="pt-3 border-t border-matrix-border/60 flex items-center justify-between text-xs font-mono">
                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 text-matrix-neonCyan">
                      <span>
                        Quests: {completedCount}/{realmQuests.length}
                      </span>
                      {isCompleted && (
                        <span className="text-matrix-neonGold ml-2 flex items-center gap-0.5">
                          <Swords className="w-3.5 h-3.5" /> Boss Defeated
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Requires Level {realm.requiredLevel}
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Realm Detail & Action Launcher */}
        <div className="lg:col-span-1">
          {selectedRealm ? (
            <div id="realm-inspector" className="sticky top-20 bg-matrix-card border border-matrix-border rounded-2xl p-6 shadow-2xl space-y-6 scroll-mt-24">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-matrix-neonCyan">
                  <span>CHAPTER {String(selectedRealm.order).padStart(2, "0")}</span>
                  <span>•</span>
                  <span>{selectedRealm.realmName}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedRealm.title}</h2>
                <p className="text-xs text-gray-300 leading-relaxed italic bg-matrix-dark/60 p-3 rounded-lg border border-matrix-border/80 mb-3">
                  &ldquo;{selectedRealm.lore}&rdquo;
                </p>

                {!(unlockedRealms.includes(selectedRealm.id) || level >= selectedRealm.requiredLevel) && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Campaign Requirement: Level {selectedRealm.requiredLevel}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      This realm is sealed in story order, but you may freely practice its coding quests below or consult its grimoire guide.
                    </p>
                  </div>
                )}

                <Link
                  href={`/curriculum?file=${selectedRealm.fileRef}`}
                  onClick={() => soundEngine.playSfx("click")}
                  className="w-full py-2 px-3 rounded-lg bg-matrix-dark hover:bg-matrix-card border border-matrix-border hover:border-matrix-neonCyan text-matrix-neonCyan font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read Chapter Guide ({selectedRealm.fileRef})
                </Link>
              </div>

              {/* Quests in this Realm */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">
                  Quests & Trials ({QUESTS[selectedRealm.id]?.length || 0})
                </h3>

                <div className="space-y-2">
                  {(QUESTS[selectedRealm.id] || []).map((quest) => {
                    const isQuestDone = completedQuests.includes(quest.id);

                    return (
                      <Link
                        key={quest.id}
                        href={`/quest/${selectedRealm.id}/${quest.id}`}
                        onClick={() => soundEngine.playSfx("click")}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-mono group ${
                          isQuestDone
                            ? "bg-matrix-accent/5 border-matrix-accent/40 text-gray-200"
                            : "bg-matrix-dark border-matrix-border hover:border-matrix-neonCyan text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isQuestDone
                                ? "bg-matrix-accent/20 text-matrix-accent"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {quest.order}
                          </span>
                          <span className="font-semibold group-hover:text-matrix-neonCyan transition-colors">
                            {quest.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-matrix-neonGold flex items-center gap-0.5">
                            +{quest.xpReward} XP
                          </span>
                          {isQuestDone && (
                            <span className="flex items-center gap-0.5" title={`${stars[quest.id] || 3}/3 Stars`}>
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= (stars[quest.id] || 3)
                                      ? "text-matrix-neonGold fill-matrix-neonGold"
                                      : "text-gray-600"
                                  }`}
                                />
                              ))}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Boss Challenge Launcher */}
              {BOSSES[selectedRealm.id] && (
                <div className="pt-4 border-t border-matrix-border">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-matrix-dark border border-matrix-neonRed/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-matrix-neonRed font-mono text-xs font-bold">
                        <Swords className="w-4 h-4 animate-bounce" />
                        REALM GUARDIAN
                      </div>
                      {completedBosses.includes(selectedRealm.id) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-accent/20 text-matrix-accent font-bold">
                          DEFEATED
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {BOSSES[selectedRealm.id].name}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {BOSSES[selectedRealm.id].title}
                      </p>
                    </div>

                    <Link
                      href={`/boss/${selectedRealm.id}`}
                      onClick={() => soundEngine.playSfx("attack")}
                      className="w-full py-2.5 px-4 rounded-lg bg-matrix-neonRed hover:bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                    >
                      <Swords className="w-4 h-4" />
                      Engage Boss Battle (+{BOSSES[selectedRealm.id].xpReward} XP)
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
