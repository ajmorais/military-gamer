"use client";

import { TRAINING_COURSES } from "@/modules/training/courses";
import type { Player } from "@/types";

interface HeadquartersOverlayProps {
  player: Player;
  onTrain: (courseId: string) => void;
  onClose: () => void;
}

export function HeadquartersOverlay({ player, onTrain, onClose }: HeadquartersOverlayProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-lg border border-zinc-700 bg-zinc-900/95 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quartel da FSTS</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
            Fechar (Esc)
          </button>
        </div>
        <p className="text-sm text-zinc-400">Orçamento disponível: R$ {player.budget.toLocaleString("pt-BR")}</p>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Treinamentos disponíveis</p>
          {TRAINING_COURSES.map((course) => (
            <div key={course.id} className="flex items-center justify-between rounded border border-zinc-700 p-2">
              <div>
                <p className="text-sm font-medium">{course.name}</p>
                <p className="text-xs text-zinc-400">{course.description}</p>
                <p className="text-xs text-zinc-500">
                  Custo: R$ {course.cost.toLocaleString("pt-BR")} · {course.durationCycles} ciclo(s)
                </p>
              </div>
              <button
                disabled={player.budget < course.cost}
                onClick={() => onTrain(course.id)}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
              >
                Aplicar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
