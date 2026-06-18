import { RANK_ORDER, RANK_XP_THRESHOLDS, type Rank } from "@/types";

export function rankForXp(xp: number): Rank {
  let current: Rank = RANK_ORDER[0];
  for (const rank of RANK_ORDER) {
    if (xp >= RANK_XP_THRESHOLDS[rank]) current = rank;
  }
  return current;
}

export function xpToNextRank(xp: number): { nextRank: Rank | null; remaining: number } {
  const currentIndex = RANK_ORDER.indexOf(rankForXp(xp));
  const nextRank = RANK_ORDER[currentIndex + 1] ?? null;
  if (!nextRank) return { nextRank: null, remaining: 0 };
  return { nextRank, remaining: RANK_XP_THRESHOLDS[nextRank] - xp };
}

export const RANK_LABELS: Record<Rank, string> = {
  cadete_operacional: "Cadete Operacional",
  aspirante: "Aspirante",
  oficial_supervisor: "Oficial Supervisor",
  oficial_coordenador: "Oficial Coordenador",
  comandante_regional: "Comandante Regional",
  comandante_geral: "Comandante Geral",
};
