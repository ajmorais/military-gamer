"use client";

import { useState } from "react";
import type { BossEncounter } from "@/modules/narrative/bosses";

interface BossEncounterOverlayProps {
  encounter: BossEncounter;
  onResolve: (choiceId: string) => void;
}

export function BossEncounterOverlay({ encounter, onResolve }: BossEncounterOverlayProps) {
  const [slide, setSlide] = useState(0);
  const [chosenId, setChosenId] = useState<string | null>(null);

  const inIntro = slide < encounter.introLines.length;
  const chosen = chosenId ? encounter.choices.find((c) => c.id === chosenId) : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg space-y-3 rounded-lg border border-red-800/60 bg-zinc-900/95 p-5 text-white shadow-xl">
        <p className="text-xs uppercase tracking-wide text-red-400">Encontro · {encounter.title}</p>
        <h3 className="text-lg font-semibold">{encounter.name}</h3>

        {inIntro && (
          <>
            <p className="text-sm text-zinc-300">{encounter.introLines[slide]}</p>
            <button
              onClick={() => setSlide((s) => s + 1)}
              className="rounded border border-zinc-600 px-3 py-1.5 text-sm hover:border-emerald-500 hover:bg-zinc-800"
            >
              Continuar
            </button>
          </>
        )}

        {!inIntro && !chosen && (
          <div className="flex flex-col gap-2 pt-1">
            {encounter.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setChosenId(choice.id)}
                className="rounded border border-zinc-600 p-2 text-left text-sm transition hover:border-red-500 hover:bg-zinc-800"
              >
                <span className="font-medium">{choice.label}</span>
                <span className="block text-zinc-400">{choice.description}</span>
              </button>
            ))}
          </div>
        )}

        {chosen && (
          <>
            <p className="text-sm text-zinc-300">{chosen.outcome}</p>
            <button
              onClick={() => onResolve(chosen.id)}
              className="rounded border border-zinc-600 px-3 py-1.5 text-sm hover:border-emerald-500 hover:bg-zinc-800"
            >
              Encerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
