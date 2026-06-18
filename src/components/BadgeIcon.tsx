"use client";

import { generateBadgeSvg } from "@/modules/player/badgeGenerator";

export function BadgeIcon({ seed, size = 64 }: { seed: string; size?: number }) {
  const svg = generateBadgeSvg(seed);
  return (
    <div
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="Emblema de unidade fictício"
    />
  );
}
