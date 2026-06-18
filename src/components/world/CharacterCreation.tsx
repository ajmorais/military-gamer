"use client";

import { useState } from "react";

const SKIN_TONES = ["#e8b894", "#c98a5e", "#9c6b43", "#6e4a30"];
const UNIFORM_COLORS = ["#2f3b2f", "#33424d", "#3a2f2f", "#2f3340"];

export interface CharacterAppearance {
  displayName: string;
  skinColor: string;
  uniformColor: string;
}

interface CharacterCreationProps {
  onConfirm: (appearance: CharacterAppearance) => void;
}

export function CharacterCreation({ onConfirm }: CharacterCreationProps) {
  const [displayName, setDisplayName] = useState("Comandante");
  const [skinColor, setSkinColor] = useState(SKIN_TONES[0]);
  const [uniformColor, setUniformColor] = useState(UNIFORM_COLORS[0]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-zinc-950 px-4 text-white">
      <h2 className="text-2xl font-semibold">Criação de personagem</h2>

      <div className="flex h-40 w-40 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
        <svg width="80" height="120" viewBox="0 0 80 120">
          <circle cx="40" cy="30" r="20" fill={skinColor} />
          <rect x="15" y="50" width="50" height="60" rx="10" fill={uniformColor} />
        </svg>
      </div>

      <label className="flex w-full max-w-xs flex-col gap-1 text-sm text-zinc-300">
        Nome de guerra
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-800 p-2 text-sm"
          maxLength={24}
        />
      </label>

      <div className="space-y-1 text-sm text-zinc-300">
        <p>Tom de pele</p>
        <div className="flex gap-2">
          {SKIN_TONES.map((color) => (
            <button
              key={color}
              onClick={() => setSkinColor(color)}
              className={`h-8 w-8 rounded-full border-2 ${skinColor === color ? "border-emerald-400" : "border-transparent"}`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1 text-sm text-zinc-300">
        <p>Cor do uniforme (original, fictício)</p>
        <div className="flex gap-2">
          {UNIFORM_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setUniformColor(color)}
              className={`h-8 w-8 rounded border-2 ${uniformColor === color ? "border-emerald-400" : "border-transparent"}`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => onConfirm({ displayName: displayName || "Comandante", skinColor, uniformColor })}
        className="rounded bg-emerald-600 px-6 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-emerald-500"
      >
        Confirmar e entrar em serviço
      </button>
    </div>
  );
}
