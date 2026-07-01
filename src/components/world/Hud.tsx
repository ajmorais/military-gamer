"use client";

import type { GlobalIndicators, Player, RegionId } from "@/types";
import { RANK_LABELS, xpToNextRank } from "@/modules/player/rankUtils";
import { REGION_WORLD_LAYOUTS } from "@/modules/world/regionLayouts";

interface HudProps {
  player: Player;
  playerPos: { x: number; z: number };
  inVehicle: boolean;
  activeMissionIndexes: number[];
}

function MiniMapDot({ x, z, color, size = 5 }: { x: number; z: number; color: string; size?: number }) {
  const left = ((x + 24) / 48) * 100;
  const top = ((z + 24) / 48) * 100;
  return (
    <div
      className="absolute rounded-full"
      style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, background: color, transform: "translate(-50%, -50%)" }}
    />
  );
}

function IndicatorBarMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] text-zinc-300">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-black/40">
        <div className="h-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Hud({ player, playerPos, inVehicle, activeMissionIndexes }: HudProps) {
  const { nextRank, remaining } = xpToNextRank(player.xp);
  const layout = REGION_WORLD_LAYOUTS[player.assignedRegionId as RegionId];
  const indicators: GlobalIndicators = player.indicators;

  return (
    <div className="pointer-events-none absolute inset-0 select-none p-4 font-sans text-white">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
          <p className="text-sm font-semibold">{player.displayName}</p>
          <p className="text-xs text-zinc-300">{RANK_LABELS[player.rank]}</p>
          <p className="text-xs text-zinc-400">
            XP {player.xp}
            {nextRank && ` · ${remaining} até promoção`}
          </p>
          <p className="text-xs text-zinc-400">Orçamento: R$ {player.budget.toLocaleString("pt-BR")}</p>
        </div>

        <div className="w-40 rounded-lg bg-black/55 p-2 backdrop-blur-sm">
          <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-zinc-400">{layout.label}</p>
          <div className="relative h-32 w-full rounded border border-zinc-700 bg-zinc-900/70">
            {layout.buildings.map((b, i) => (
              <MiniMapDot key={`b${i}`} x={b.x} z={b.z} color="#6b7280" size={4} />
            ))}
            {layout.npcs.map((n, i) => (
              <MiniMapDot key={`n${i}`} x={n.x} z={n.z} color="#38bdf8" size={4} />
            ))}
            {activeMissionIndexes.map((idx) =>
              layout.missionSpawns[idx] ? (
                <MiniMapDot key={idx} x={layout.missionSpawns[idx].x} z={layout.missionSpawns[idx].z} color="#facc15" size={7} />
              ) : null
            )}
            <MiniMapDot x={layout.quartelSpawn.x} z={layout.quartelSpawn.z} color="#22c55e" size={5} />
            <MiniMapDot x={playerPos.x} z={playerPos.z} color="#34d399" size={7} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 w-56 space-y-1.5 rounded-lg bg-black/55 p-3 backdrop-blur-sm">
        <IndicatorBarMini label="Moral da tropa" value={indicators.troopMorale} />
        <IndicatorBarMini label="Confiança da população" value={indicators.publicTrust} />
        <IndicatorBarMini label="Recursos" value={indicators.resources} />
        <IndicatorBarMini label="Reputação institucional" value={indicators.reputation} />
      </div>

      <div className="absolute bottom-4 right-4 rounded-lg bg-black/55 px-3 py-2 text-right text-xs text-zinc-300 backdrop-blur-sm">
        <p>WASD/setas: mover · A/D: girar · Shift: correr</p>
        <p>E: entrar/sair da viatura {inVehicle && "(em viatura)"}</p>
        <p>Ponto verde no radar: Quartel (treinamentos)</p>
        {activeMissionIndexes.length > 0 && (
          <p className="text-amber-300">Objetivo: siga os marcadores amarelos no radar</p>
        )}
      </div>
    </div>
  );
}
