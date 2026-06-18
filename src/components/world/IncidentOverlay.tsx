"use client";

import type { Incident } from "@/types";

interface IncidentOverlayProps {
  incident: Incident;
  onResolve: (optionId: string) => void;
}

export function IncidentOverlay({ incident, onResolve }: IncidentOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md space-y-3 rounded-lg border border-zinc-700 bg-zinc-900/95 p-5 text-white shadow-xl">
        <p className="text-xs uppercase tracking-wide text-amber-400">Ocorrência · Severidade {incident.severity}/5</p>
        <h3 className="text-lg font-semibold">{incident.title}</h3>
        <p className="text-sm text-zinc-300">{incident.description}</p>
        <div className="flex flex-col gap-2 pt-2">
          {incident.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onResolve(option.id)}
              className="rounded border border-zinc-600 p-2 text-left text-sm transition hover:border-emerald-500 hover:bg-zinc-800"
            >
              <span className="font-medium">{option.label}</span>
              <span className="block text-zinc-400">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
