import type { GlobalIndicators, GlobalIndicatorsDelta } from "@/types";

export const DEFAULT_INDICATORS: GlobalIndicators = {
  troopMorale: 60,
  publicTrust: 60,
  resources: 60,
  reputation: 60,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyIndicatorsDelta(
  indicators: GlobalIndicators,
  delta: GlobalIndicatorsDelta
): GlobalIndicators {
  return {
    troopMorale: clamp(indicators.troopMorale + (delta.troopMorale ?? 0)),
    publicTrust: clamp(indicators.publicTrust + (delta.publicTrust ?? 0)),
    resources: clamp(indicators.resources + (delta.resources ?? 0)),
    reputation: clamp(indicators.reputation + (delta.reputation ?? 0)),
  };
}
