import { BankTransactionLogEntry, FieldValue } from '../schema/types';
import {
  clampCounterValue,
  getCounterValue,
  resolveCounterKey,
} from '../core/counterHelpers';
import { breakAmountIntoNotes, DEFAULT_VND_DENOMINATIONS } from '../core/denomination';
import { resolveParam } from '../core/expressions';
import { ActionHandler } from './types';

function syncDenominatedNotes(
  state: Parameters<ActionHandler>[0],
  counterId: string,
  key: string,
  value: number,
  currentMap: Record<string, Record<number, number>>
): Record<string, Record<number, number>> {
  const def = state.counterDefs[counterId];
  if (def?.kind !== 'denominated') return currentMap;
  const denoms = def.denominations?.length ? def.denominations : DEFAULT_VND_DENOMINATIONS;
  return {
    ...currentMap,
    [key]: breakAmountIntoNotes(value, denoms),
  };
}

export const setCounterAction: ActionHandler = (state, params, ctx) => {
  const counterId = String(resolveParam(params.counterId, state, ctx) ?? '');
  const targetId = (resolveParam(params.targetId, state, ctx) as string | null) ?? null;
  if (!counterId) return { state, events: [] };

  const key = resolveCounterKey(state, counterId, targetId);
  const current = getCounterValue(state, counterId, targetId);
  const nextRaw =
    params.delta !== undefined
      ? current + Number(resolveParam(params.delta, state, ctx))
      : Number(resolveParam(params.value, state, ctx) ?? current);
  const nextVal = clampCounterValue(state, counterId, nextRaw);

  return {
    state: {
      ...state,
      counters: {
        ...state.counters,
        [key]: nextVal,
      },
      denominatedCounters: syncDenominatedNotes(
        state,
        counterId,
        key,
        nextVal,
        state.denominatedCounters
      ),
    },
    events: [
      {
        type: 'counter_changed',
        actorId: targetId,
        entityId: counterId,
        data: { key, previous: current, value: nextVal },
      },
    ],
  };
};

export const transferAction: ActionHandler = (state, params, ctx) => {
  const counterId = String(resolveParam(params.counterId, state, ctx) ?? '');
  const fromId = (resolveParam(params.fromId, state, ctx) as string | null) ?? null;
  const toId = (resolveParam(params.toId, state, ctx) as string | null) ?? null;
  const rawAmount = Number(resolveParam(params.amount, state, ctx) ?? 0);
  const reason = String(resolveParam(params.reason, state, ctx) ?? 'transfer');

  if (!counterId) return { state, events: [] };
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return { state, events: [], error: 'Transfer amount must be greater than 0' };
  }
  if (fromId && toId && fromId === toId) {
    return { state, events: [], error: 'Transfer source and target cannot be the same' };
  }

  const amount = Math.round(rawAmount);
  const def = state.counterDefs[counterId];
  const nextCounters = { ...state.counters };
  let nextDenom = state.denominatedCounters;
  const events = [];

  if (fromId && fromId !== 'bank') {
    const fromKey = resolveCounterKey(state, counterId, fromId);
    const fromCur = getCounterValue(state, counterId, fromId);
    const fromNextRaw = fromCur - amount;
    if (def?.min !== undefined && fromNextRaw < def.min) {
      return {
        state,
        events: [],
        error: `Insufficient counter "${counterId}" for "${fromId}" (${fromCur} < ${amount})`,
      };
    }
    const fromNext = clampCounterValue(state, counterId, fromNextRaw);
    nextCounters[fromKey] = fromNext;
    nextDenom = syncDenominatedNotes(state, counterId, fromKey, fromNext, nextDenom);
    events.push({
      type: 'counter_changed' as const,
      actorId: fromId,
      entityId: counterId,
      data: { key: fromKey, previous: fromCur, value: fromNext },
    });
  }

  if (toId && toId !== 'bank') {
    const toKey = resolveCounterKey(state, counterId, toId);
    const toCur = getCounterValue(state, counterId, toId);
    const toNextRaw = toCur + amount;
    if (def?.max !== undefined && toNextRaw > def.max) {
      return {
        state,
        events: [],
        error: `Counter "${counterId}" for "${toId}" exceeds max (${def.max})`,
      };
    }
    const toNext = clampCounterValue(state, counterId, toNextRaw);
    nextCounters[toKey] = toNext;
    nextDenom = syncDenominatedNotes(state, counterId, toKey, toNext, nextDenom);
    events.push({
      type: 'counter_changed' as const,
      actorId: toId,
      entityId: counterId,
      data: { key: toKey, previous: toCur, value: toNext },
    });
  }

  const logEntry: BankTransactionLogEntry = {
    id: `tx-${state.tick}-${state.bankLogs.length + 1}`,
    tick: state.tick,
    fromId,
    toId,
    counterId,
    amount,
    reason,
    ...(def?.kind === 'denominated'
      ? {
          notes: breakAmountIntoNotes(
            amount,
            def.denominations?.length ? def.denominations : DEFAULT_VND_DENOMINATIONS
          ),
        }
      : {}),
  };

  return {
    state: {
      ...state,
      counters: nextCounters,
      denominatedCounters: nextDenom,
      bankLogs: [...state.bankLogs, logEntry],
    },
    events,
  };
};

export const setFieldAction: ActionHandler = (state, params, ctx) => {
  const entityId = String(resolveParam(params.entityId, state, ctx) ?? '');
  const key = String(resolveParam(params.key, state, ctx) ?? '');
  const value = resolveParam(params.value, state, ctx) as FieldValue;
  if (!entityId || !key) return { state, events: [] };

  if (state.pieces[entityId]) {
    const p = state.pieces[entityId];
    return {
      state: {
        ...state,
        pieces: {
          ...state.pieces,
          [entityId]: { ...p, fields: { ...p.fields, [key]: value } },
        },
      },
      events: [],
    };
  }
  if (state.zones[entityId]) {
    const z = state.zones[entityId];
    return {
      state: {
        ...state,
        zones: {
          ...state.zones,
          [entityId]: { ...z, fields: { ...z.fields, [key]: value } },
        },
      },
      events: [],
    };
  }
  if (state.players[entityId]) {
    const pl = state.players[entityId];
    return {
      state: {
        ...state,
        players: {
          ...state.players,
          [entityId]: {
            ...pl,
            ...(key === 'eliminated' ? { eliminated: Boolean(value) } : {}),
            fields: { ...pl.fields, [key]: value },
          },
        },
      },
      events: [],
    };
  }

  return { state, events: [] };
};

export const setOwnerAction: ActionHandler = (state, params, ctx) => {
  const entityId = String(resolveParam(params.entityId, state, ctx) ?? '');
  const ownerId = (resolveParam(params.ownerId, state, ctx) as string | null) ?? null;
  if (!entityId) return { state, events: [] };

  if (state.pieces[entityId]) {
    return {
      state: {
        ...state,
        pieces: {
          ...state.pieces,
          [entityId]: { ...state.pieces[entityId], ownerId },
        },
      },
      events: [],
    };
  }
  if (state.zones[entityId]) {
    return {
      state: {
        ...state,
        zones: {
          ...state.zones,
          [entityId]: { ...state.zones[entityId], ownerId },
        },
      },
      events: [],
    };
  }
  return { state, events: [] };
};
