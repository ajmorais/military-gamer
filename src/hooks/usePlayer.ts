"use client";

import { useState } from "react";
import type { Player } from "@/types";
import { DEFAULT_INDICATORS } from "@/modules/operations/indicators";
import { STARTING_BUDGET } from "@/modules/economy/budget";
import { rankForXp } from "@/modules/player/rankUtils";

export function createNewPlayer(displayName: string): Player {
  return {
    id: `player_${Date.now()}`,
    displayName,
    rank: "cadete_operacional",
    xp: 0,
    badgeSeed: displayName + Date.now(),
    budget: STARTING_BUDGET,
    indicators: DEFAULT_INDICATORS,
    assignedRegionId: "metropolitana",
    createdAt: Date.now(),
  };
}

export function usePlayer(initial?: Player) {
  const [player, setPlayer] = useState<Player | null>(initial ?? null);

  function addXp(amount: number) {
    setPlayer((prev) => {
      if (!prev) return prev;
      const xp = prev.xp + amount;
      return { ...prev, xp, rank: rankForXp(xp) };
    });
  }

  return { player, setPlayer, addXp };
}
