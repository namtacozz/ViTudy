export const DEFAULT_VND_DENOMINATIONS: readonly number[] = [
  500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000,
];

/**
 * Greedy breakdown of a scalar amount into denominated notes.
 * Used as the strategy for CounterDef { kind: 'denominated' }.
 */
export function breakAmountIntoNotes(
  amount: number,
  denominations: readonly number[] = DEFAULT_VND_DENOMINATIONS
): Record<number, number> {
  const sorted = [...denominations].filter((d) => d > 0).sort((a, b) => b - a);
  const notes: Record<number, number> = {};
  for (const denom of sorted) {
    notes[denom] = 0;
  }

  let remaining = Math.max(0, Math.round(amount));
  for (const denom of sorted) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      notes[denom] = count;
      remaining -= count * denom;
    }
  }
  return notes;
}

export function sumNotes(notes: Record<number, number> | undefined): number {
  if (!notes) return 0;
  let total = 0;
  for (const [denom, count] of Object.entries(notes)) {
    total += Number(denom) * Number(count || 0);
  }
  return total;
}
