"use client";

import { useEffect, useState } from "react";

interface PromotionCutsceneProps {
  rankLabel: string;
  onDone: () => void;
}

export function PromotionCutscene({ rankLabel, onDone }: PromotionCutsceneProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const hideTimer = setTimeout(() => setVisible(false), 2400);
    const doneTimer = setTimeout(onDone, 2900);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Promoção concedida</p>
      <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{rankLabel}</h2>
    </div>
  );
}
