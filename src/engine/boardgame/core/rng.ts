/**
 * Pure deterministic Mulberry32 PRNG.
 * Never uses Math.random() or Date.now().
 */
export function nextRng(rngState: number): { value: number; nextState: number } {
  let t = (rngState + 0x6d2b79f5) | 0;
  const nextState = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}

export function nextInt(
  rngState: number,
  min: number,
  max: number
): { value: number; nextState: number } {
  const { value, nextState } = nextRng(rngState);
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return {
    value: Math.floor(value * (hi - lo + 1)) + lo,
    nextState,
  };
}

export function deterministicShuffle<T>(
  items: readonly T[],
  rngState: number
): { result: T[]; nextState: number } {
  const arr = [...items];
  let state = rngState;
  for (let i = arr.length - 1; i > 0; i--) {
    const r = nextInt(state, 0, i);
    state = r.nextState;
    const j = r.value;
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return { result: arr, nextState: state };
}
