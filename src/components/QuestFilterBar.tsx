import React from "react";
import { Search, Filter, Layers, Zap } from "lucide-react";
import { REALMS } from "@/data/realms";
import { DifficultyLevel } from "@/lib/questFilter";

export interface QuestFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRealm: string;
  setSelectedRealm: (realmId: string) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (diff: DifficultyLevel) => void;
}

export function QuestFilterBar({
  searchQuery,
  setSearchQuery,
  selectedRealm,
  setSelectedRealm,
  difficulty,
  setDifficulty,
}: QuestFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full bg-matrix-dark/80 backdrop-blur-md border border-matrix-border rounded-xl p-3 sm:p-4 shadow-lg shadow-black/40">

      {/* Search Input */}
      <div className="relative flex-1 w-full group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-matrix-neonCyan group-focus-within:text-white transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search quests by title, concept, or code"
          placeholder="Search quests by title, concept, or code..."
          className="block w-full pl-10 pr-3 py-2 border border-matrix-border rounded-lg leading-5 bg-matrix-cardHover text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-matrix-neonCyan focus:border-matrix-neonCyan sm:text-sm transition-all"
        />
      </div>

      <div className="flex w-full sm:w-auto gap-3">
        {/* Realm Dropdown */}
        <div className="relative flex-1 sm:w-48 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Layers className="h-4 w-4 text-matrix-accent group-focus-within:text-white transition-colors" />
          </div>
          <select
            aria-label="Filter quests by realm"
            value={selectedRealm}
            onChange={(e) => setSelectedRealm(e.target.value)}
            className="block w-full pl-10 pr-8 py-2 border border-matrix-border rounded-lg leading-5 bg-matrix-cardHover text-gray-200 focus:outline-none focus:ring-1 focus:ring-matrix-accent focus:border-matrix-accent sm:text-sm appearance-none cursor-pointer transition-all"
          >
            <option value="All">All Realms</option>
            {REALMS.map((realm) => (
              <option key={realm.id} value={realm.id}>
                {realm.title}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <Filter className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Difficulty Dropdown */}
        <div className="relative flex-1 sm:w-40 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Zap className="h-4 w-4 text-amber-400 group-focus-within:text-white transition-colors" />
          </div>
          <select
            aria-label="Filter quests by difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="block w-full pl-10 pr-8 py-2 border border-matrix-border rounded-lg leading-5 bg-matrix-cardHover text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 sm:text-sm appearance-none cursor-pointer transition-all"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner (1 Star)</option>
            <option value="Intermediate">Intermediate (2 Stars)</option>
            <option value="Advanced">Advanced (3 Stars)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <Filter className="h-3 w-3 text-gray-400" />
          </div>
        </div>
      </div>

    </div>
  );
}
