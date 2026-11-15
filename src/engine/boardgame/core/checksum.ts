import { EngineState } from '../schema/types';

function fnvMixStr(h: number, seedMult: number, str: string): number {
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, seedMult) >>> 0;
  }
  return h;
}

function hashRecursive(value: unknown, h1: number, h2: number): [number, number] {
  if (value === null || value === undefined) {
    return [fnvMixStr(h1, 0x01000193, 'n'), fnvMixStr(h2, 0x01000193, 'n')];
  }
  if (typeof value === 'boolean') {
    const tag = value ? 'T' : 'F';
    return [fnvMixStr(h1, 0x01000193, tag), fnvMixStr(h2, 0x01000193, tag)];
  }
  if (typeof value === 'number') {
    const s = String(value);
    return [fnvMixStr(h1, 0x01000193, s), fnvMixStr(h2, 0x01000193, s)];
  }
  if (typeof value === 'string') {
    h1 = fnvMixStr(h1, 0x01000193, 's:');
    h2 = fnvMixStr(h2, 0x01000193, 's:');
    return [fnvMixStr(h1, 0x01000193, value), fnvMixStr(h2, 0x01000193, value)];
  }
  if (Array.isArray(value)) {
    h1 = fnvMixStr(h1, 0x01000193, '[');
    h2 = fnvMixStr(h2, 0x01000193, '[');
    for (let i = 0; i < value.length; i++) {
      [h1, h2] = hashRecursive(value[i], h1, h2);
    }
    return [fnvMixStr(h1, 0x01000193, ']'), fnvMixStr(h2, 0x01000193, ']')];
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    h1 = fnvMixStr(h1, 0x01000193, '{');
    h2 = fnvMixStr(h2, 0x01000193, '{');
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = obj[k];
      if (v === undefined) continue;
      h1 = fnvMixStr(h1, 0x01000193, k);
      h2 = fnvMixStr(h2, 0x01000193, k);
      [h1, h2] = hashRecursive(v, h1, h2);
    }
    return [fnvMixStr(h1, 0x01000193, '}'), fnvMixStr(h2, 0x01000193, '}')];
  }
  return [h1, h2];
}

/**
 * Computes a deterministic 64-bit (dual FNV-1a) checksum of the full EngineState
 * using zero-allocation recursive hashing and O(1) log chaining.
 * Note (ADR-021): Checksum guards against accidental tampering; cheat prevention relies on host authority.
 */
export function computeStateChecksum(state: EngineState): string {
  const lastLog = state.logs.length > 0 ? state.logs[state.logs.length - 1] : null;
  const lastBank = state.bankLogs.length > 0 ? state.bankLogs[state.bankLogs.length - 1] : null;

  const normalized = {
    ...state,
    counterDefs: undefined,
    randomizers: undefined,
    stateChecksum: undefined,
    logs: state.logs.length,
    lastLogSeq: lastLog?.seq ?? 0,
    lastLogAction: lastLog?.action ?? null,
    bankLogs: state.bankLogs.length,
    lastBankId: lastBank?.id ?? null,
  };

  const [h1, h2] = hashRecursive(normalized, 0x811c9dc5, 0x9e3779b9);
  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

export function verifyStateChecksum(state: EngineState): {
  valid: boolean;
  expected?: string;
  actual: string;
} {
  const actual = computeStateChecksum(state);
  if (!state.stateChecksum) {
    return { valid: true, actual };
  }
  return {
    valid: state.stateChecksum === actual,
    expected: state.stateChecksum,
    actual,
  };
}
