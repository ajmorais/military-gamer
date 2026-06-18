"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TitleScreen } from "@/components/world/TitleScreen";
import { CharacterCreation, type CharacterAppearance } from "@/components/world/CharacterCreation";
import { Hud } from "@/components/world/Hud";
import { IncidentOverlay } from "@/components/world/IncidentOverlay";
import { HeadquartersOverlay } from "@/components/world/HeadquartersOverlay";
import { PromotionCutscene } from "@/components/world/PromotionCutscene";
import { createNewPlayer } from "@/hooks/usePlayer";
import { RANK_LABELS, rankForXp } from "@/modules/player/rankUtils";
import { REGIONS } from "@/modules/operations/regions";
import { applyIndicatorsDelta } from "@/modules/operations/indicators";
import { applyBudgetDelta } from "@/modules/economy/budget";
import { generateIncident, randomIncidentType } from "@/modules/incidents/incidentGenerator";
import { TRAINING_COURSES } from "@/modules/training/courses";
import { REGION_WORLD_LAYOUTS } from "@/modules/world/regionLayouts";
import type { Incident, Player, RegionId } from "@/types";

const GameScene = dynamic(() => import("@/components/world/GameScene").then((m) => m.GameScene), {
  ssr: false,
});

const SAVE_KEY = "sertao_operacoes_save_v1";

type GameStage = "title" | "creation" | "playing";

interface SaveData {
  player: Player;
  appearance: CharacterAppearance;
}

function loadSave(): SaveData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export default function Home() {
  const [stage, setStage] = useState<GameStage>("title");
  const [hasSave] = useState(() => loadSave() !== null);
  const [appearance, setAppearance] = useState<CharacterAppearance | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [activeMissionIndexes, setActiveMissionIndexes] = useState<number[]>([0, 1]);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
  const [inVehicle, setInVehicle] = useState(false);
  const [showHeadquarters, setShowHeadquarters] = useState(false);
  const [promotionRankLabel, setPromotionRankLabel] = useState<string | null>(null);

  useEffect(() => {
    if (stage === "playing" && player && appearance) {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({ player, appearance }));
    }
  }, [stage, player, appearance]);

  function handleConfirmCreation(appearanceInput: CharacterAppearance) {
    setAppearance(appearanceInput);
    setPlayer(createNewPlayer(appearanceInput.displayName));
    setStage("playing");
  }

  function handleContinue() {
    const save = loadSave();
    if (!save) return;
    setAppearance(save.appearance);
    setPlayer(save.player);
    setStage("playing");
  }

  function handleMissionTrigger(index: number) {
    if (!player) return;
    const type = randomIncidentType();
    const severity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
    setIncident(generateIncident(player.assignedRegionId, type, severity));
    setActiveMissionIndexes((prev) => prev.filter((i) => i !== index));
  }

  function handleResolveIncident(optionId: string) {
    if (!incident || !player) return;
    const option = incident.options.find((o) => o.id === optionId);
    if (!option) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const xp = prev.xp + option.xpReward;
      const newRank = rankForXp(xp);
      if (newRank !== prev.rank) {
        setPromotionRankLabel(RANK_LABELS[newRank]);
      }
      return {
        ...prev,
        xp,
        rank: newRank,
        budget: applyBudgetDelta(prev.budget, option.budgetDelta),
        indicators: applyIndicatorsDelta(prev.indicators, option.impact),
      };
    });
    setIncident(null);
    const totalSpawns = REGION_WORLD_LAYOUTS[player.assignedRegionId].missionSpawns.length;
    setTimeout(() => {
      setActiveMissionIndexes((prev) => {
        const missing = Array.from({ length: totalSpawns }, (_, i) => i).filter((i) => !prev.includes(i));
        return missing.length ? [...prev, missing[0]] : prev;
      });
    }, 4000);
  }

  function handleRegionChange(regionId: RegionId) {
    setPlayer((prev) => (prev ? { ...prev, assignedRegionId: regionId } : prev));
    setActiveMissionIndexes([0, 1]);
    setIncident(null);
    setShowHeadquarters(false);
  }

  function handleTrain(courseId: string) {
    const course = TRAINING_COURSES.find((c) => c.id === courseId);
    if (!course || !player || player.budget < course.cost) return;
    setPlayer((prev) => {
      if (!prev) return prev;
      const delta =
        course.effect.attribute === "trainingLevel"
          ? { reputation: course.effect.amount * 3, troopMorale: course.effect.amount * 2 }
          : { troopMorale: course.effect.amount * 0.6 };
      return {
        ...prev,
        budget: applyBudgetDelta(prev.budget, -course.cost),
        indicators: applyIndicatorsDelta(prev.indicators, delta),
      };
    });
  }

  if (stage === "title") {
    return <TitleScreen onStart={() => setStage("creation")} onContinue={handleContinue} hasSave={hasSave} />;
  }

  if (stage === "creation" || !player || !appearance) {
    return <CharacterCreation onConfirm={handleConfirmCreation} />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <GameScene
        regionId={player.assignedRegionId}
        activeMissionIndexes={incident ? [] : activeMissionIndexes}
        onMissionTrigger={handleMissionTrigger}
        onQuartelEnter={() => setShowHeadquarters(true)}
        onPositionChange={(x, z, vehicle) => {
          setPlayerPos({ x, z });
          setInVehicle(vehicle);
        }}
        uniformColor={appearance.uniformColor}
        skinColor={appearance.skinColor}
      />

      <Hud player={player} playerPos={playerPos} inVehicle={inVehicle} activeMissionIndexes={activeMissionIndexes} />

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

      {showHeadquarters && !incident && (
        <HeadquartersOverlay player={player} onTrain={handleTrain} onClose={() => setShowHeadquarters(false)} />
      )}

      {promotionRankLabel && (
        <PromotionCutscene rankLabel={promotionRankLabel} onDone={() => setPromotionRankLabel(null)} />
      )}
    </div>
  );
}
