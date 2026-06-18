export const STARTING_BUDGET = 5000;

export function applyBudgetDelta(current: number, delta: number): number {
  return Math.max(0, current + delta);
}
