"use client";

import type { Player } from "@/types";
import { RANK_LABELS, xpToNextRank } from "@/modules/player/rankUtils";

interface CommandCenterOverlayProps {
  player: Player;
  onClose: () => void;
}

export function CommandCenterOverlay({ player, onClose }: CommandCenterOverlayProps) {
  const { nextRank, remaining } = xpToNextRank(player.xp);

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-lg border border-zinc-700 bg-zinc-900/95 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Centro de Comando</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
            Fechar (Esc)
          </button>
        </div>
        <div className="space-y-1 text-sm text-zinc-300">
          <p>Patente atual: <span className="text-emerald-300">{RANK_LABELS[player.rank]}</span></p>
          <p>
            XP acumulado: {player.xp}
            {nextRank && ` · faltam ${remaining} para ${RANK_LABELS[nextRank]}`}
          </p>
          <p>Orçamento disponível: R$ {player.budget.toLocaleString("pt-BR")}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
          <p>Moral da tropa: {player.indicators.troopMorale}/100</p>
          <p>Confiança da população: {player.indicators.publicTrust}/100</p>
          <p>Recursos: {player.indicators.resources}/100</p>
          <p>Reputação institucional: {player.indicators.reputation}/100</p>
        </div>
      </div>
    </div>
  );
}
