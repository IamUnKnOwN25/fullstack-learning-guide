"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { Sparkles, Flame } from "lucide-react";

export function XpGainFloatie() {
  const { recentXpGain, dismissRecentXpGain } = useGameStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!recentXpGain) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      dismissRecentXpGain();
    }, 2400);

    return () => clearTimeout(timer);
  }, [recentXpGain, dismissRecentXpGain]);

  if (!visible || !recentXpGain) return null;

  return (
    <div className="fixed top-14 sm:top-16 right-4 z-40 pointer-events-none animate-bounce">
      <div className="px-3.5 py-1.5 rounded-full bg-matrix-dark/95 border border-matrix-neonGold/80 shadow-lg shadow-matrix-neonGold/30 flex items-center gap-2 font-mono text-xs text-matrix-neonGold backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span className="font-bold">+{recentXpGain.amount} XP</span>

        {recentXpGain.streakBonus > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-matrix-accent bg-matrix-accent/10 px-1.5 py-0.5 rounded border border-matrix-accent/30">
            <Flame className="w-3 h-3 fill-matrix-accent" />
            <span>+{recentXpGain.streakBonus} Streak</span>
          </span>
        )}

        {recentXpGain.source && (
          <span className="text-[10px] text-gray-400 max-w-[120px] truncate hidden md:inline">
            ({recentXpGain.source})
          </span>
        )}
      </div>
    </div>
  );
}
