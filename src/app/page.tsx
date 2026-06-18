"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TitleScreen } from "@/components/world/TitleScreen";
import { CharacterCreation, type CharacterAppearance } from "@/components/world/CharacterCreation";
import { Hud } from "@/components/world/Hud";
import { IncidentOverlay } from "@/components/world/IncidentOverlay";
import { createNewPlayer } from "@/hooks/usePlayer";
import { rankForXp } from "@/modules/player/rankUtils";
import { REGIONS } from "@/modules/operations/regions";
import { applyIndicatorsDelta } from "@/modules/operations/indicators";
import { applyBudgetDelta } from "@/modules/economy/budget";
import { generateIncident, randomIncidentType } from "@/modules/incidents/incidentGenerator";
import type { Incident, Player, RegionId } from "@/types";

const GameScene = dynamic(() => import("@/components/world/GameScene").then((m) => m.GameScene), {
  ssr: false,
});

type GameStage = "title" | "creation" | "playing";

export default function Home() {
  const [stage, setStage] = useState<GameStage>("title");
  const [appearance, setAppearance] = useState<CharacterAppearance | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [missionAvailable, setMissionAvailable] = useState(true);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
  const [inVehicle, setInVehicle] = useState(false);

  function handleConfirmCreation(appearanceInput: CharacterAppearance) {
    setAppearance(appearanceInput);
    setPlayer(createNewPlayer(appearanceInput.displayName));
    setStage("playing");
  }

  function handleMissionTrigger() {
    if (!player) return;
    const type = randomIncidentType();
    const severity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
    setIncident(generateIncident(player.assignedRegionId, type, severity));
    setMissionAvailable(false);
  }

  function handleResolveIncident(optionId: string) {
    if (!incident || !player) return;
    const option = incident.options.find((o) => o.id === optionId);
    if (!option) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const xp = prev.xp + option.xpReward;
      return {
        ...prev,
        xp,
        rank: rankForXp(xp),
        budget: applyBudgetDelta(prev.budget, option.budgetDelta),
        indicators: applyIndicatorsDelta(prev.indicators, option.impact),
      };
    });
    setIncident(null);
    setTimeout(() => setMissionAvailable(true), 4000);
  }

  function handleRegionChange(regionId: RegionId) {
    setPlayer((prev) => (prev ? { ...prev, assignedRegionId: regionId } : prev));
    setMissionAvailable(true);
    setIncident(null);
  }

  if (stage === "title") {
    return <TitleScreen onStart={() => setStage("creation")} />;
  }

  if (stage === "creation" || !player || !appearance) {
    return <CharacterCreation onConfirm={handleConfirmCreation} />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <GameScene
        regionId={player.assignedRegionId}
        missionAvailable={missionAvailable && !incident}
        onMissionTrigger={handleMissionTrigger}
        onPositionChange={(x, z, vehicle) => {
          setPlayerPos({ x, z });
          setInVehicle(vehicle);
        }}
        uniformColor={appearance.uniformColor}
        skinColor={appearance.skinColor}
      />

      <Hud player={player} playerPos={playerPos} inVehicle={inVehicle} missionAvailable={missionAvailable && !incident} />

      <div className="pointer-events-auto absolute right-4 top-32 rounded-lg bg-black/55 p-2 backdrop-blur-sm">
        <label className="block text-[10px] uppercase tracking-wide text-zinc-400">Região designada</label>
        <select
          className="mt-1 w-40 rounded border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-white"
          value={player.assignedRegionId}
          onChange={(e) => handleRegionChange(e.target.value as RegionId)}
        >
          {REGIONS.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {incident && (
        <div className="pointer-events-auto absolute inset-0">
          <IncidentOverlay incident={incident} onResolve={handleResolveIncident} />
        </div>
      )}
    </div>
  );
}
