"use client";

import { useState } from "react";
import { BadgeIcon } from "@/components/BadgeIcon";
import { IndicatorBar } from "@/components/IndicatorBar";
import { createNewPlayer } from "@/hooks/usePlayer";
import { RANK_LABELS, rankForXp, xpToNextRank } from "@/modules/player/rankUtils";
import { REGIONS } from "@/modules/operations/regions";
import { applyIndicatorsDelta } from "@/modules/operations/indicators";
import { applyBudgetDelta } from "@/modules/economy/budget";
import { generateIncident, randomIncidentType } from "@/modules/incidents/incidentGenerator";
import type { Incident, Player } from "@/types";

export default function Home() {
  const [player, setPlayer] = useState<Player>(() => createNewPlayer("Comandante"));
  const [incident, setIncident] = useState<Incident | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const { nextRank, remaining } = xpToNextRank(player.xp);

  function dispatchNewIncident() {
    const type = randomIncidentType();
    const severity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
    setIncident(generateIncident(player.assignedRegionId, type, severity));
  }

  function resolveIncident(optionId: string) {
    if (!incident) return;
    const option = incident.options.find((o) => o.id === optionId);
    if (!option) return;

    setPlayer((prev) => {
      const xp = prev.xp + option.xpReward;
      return {
        ...prev,
        xp,
        rank: rankForXp(xp),
        budget: applyBudgetDelta(prev.budget, option.budgetDelta),
        indicators: applyIndicatorsDelta(prev.indicators, option.impact),
      };
    });

    setLog((prev) => [
      `Ocorrência "${incident.title}" resolvida com a opção "${option.label}" (+${option.xpReward} XP).`,
      ...prev,
    ].slice(0, 8));
    setIncident(null);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Sertão Operações — Centro de Comando
        </h1>
        <p className="text-xs text-zinc-500">
          Força de Segurança Territorial do Sertão (FSTS) · Estado fictício de Nova Aratanha
        </p>
      </header>

      <main className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <section className="md:col-span-1 space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <BadgeIcon seed={player.badgeSeed} size={56} />
            <div>
              <p className="font-medium">{player.displayName}</p>
              <p className="text-sm text-zinc-400">{RANK_LABELS[player.rank]}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            XP: {player.xp}
            {nextRank && ` · ${remaining} XP até ${RANK_LABELS[nextRank]}`}
          </p>
          <p className="text-sm text-zinc-400">Orçamento: R$ {player.budget.toLocaleString("pt-BR")}</p>

          <div className="space-y-2 pt-2">
            <IndicatorBar label="Moral da tropa" value={player.indicators.troopMorale} />
            <IndicatorBar label="Confiança da população" value={player.indicators.publicTrust} />
            <IndicatorBar label="Recursos" value={player.indicators.resources} />
            <IndicatorBar label="Reputação institucional" value={player.indicators.reputation} />
          </div>

          <label className="block pt-2 text-sm text-zinc-400">
            Região designada
            <select
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-sm"
              value={player.assignedRegionId}
              onChange={(e) =>
                setPlayer((prev) => ({ ...prev, assignedRegionId: e.target.value as Player["assignedRegionId"] }))
              }
            >
              {REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Patrulhamento</h2>
              <button
                onClick={dispatchNewIncident}
                className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
              >
                Iniciar ronda preventiva
              </button>
            </div>

            {incident ? (
              <div className="mt-4 space-y-3 rounded border border-zinc-700 bg-zinc-800 p-3">
                <p className="text-sm text-zinc-400">Severidade {incident.severity}/5</p>
                <h3 className="font-medium">{incident.title}</h3>
                <p className="text-sm text-zinc-300">{incident.description}</p>
                <div className="flex flex-col gap-2 pt-2">
                  {incident.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => resolveIncident(option.id)}
                      className="rounded border border-zinc-600 p-2 text-left text-sm hover:border-emerald-500 hover:bg-zinc-700"
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="block text-zinc-400">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Nenhuma ocorrência ativa. Inicie uma ronda preventiva para gerar uma nova ocorrência fictícia.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-medium">Registro de operações</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {log.length === 0 && <li>Sem registros ainda.</li>}
              {log.map((entry, i) => (
                <li key={i}>· {entry}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-4 text-xs text-zinc-500">
        Esta obra é inteiramente fictícia. Qualquer semelhança com instituições, organizações ou pessoas reais
        é mera coincidência. O jogo não possui vínculo, autorização ou representação oficial de qualquer órgão
        público.
      </footer>
    </div>
  );
}
