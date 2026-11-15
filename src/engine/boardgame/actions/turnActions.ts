import { getActivePlayerId } from '../core/counterHelpers';
import { resolveParam } from '../core/expressions';
import { nextInt } from '../core/rng';
import { ActionHandler } from './types';

export const rollAction: ActionHandler = (state, params, ctx) => {
  const randomizerId = String(resolveParam(params.randomizerId, state, ctx) ?? '');
  const rand = state.randomizers[randomizerId];
  const sidesList =
    (Array.isArray(params.sides) ? (params.sides as number[]) : null) ??
    rand?.sides ?? [6];

  let rng = state.rngState;
  const values: number[] = [];

  // Optional forced values from physics presentation layer (recorded deterministically in log)
  const forced = Array.isArray(params.forcedValues) ? (params.forcedValues as number[]) : null;
  if (forced && forced.length > 0) {
    for (const v of forced) values.push(Number(v));
  } else {
    for (const sides of sidesList) {
      const r = nextInt(rng, 1, Math.max(2, sides));
      rng = r.nextState;
      values.push(r.value);
    }
  }

  const total = values.reduce((a, b) => a + b, 0);
  const actorId = (resolveParam(params.playerId, state, ctx) as string | null) ?? getActivePlayerId(state);

  return {
    state: {
      ...state,
      rngState: rng,
      lastRoll: { randomizerId: randomizerId || 'dice', values, total },
    },
    events: [
      {
        type: 'dice_rolled',
        actorId,
        entityId: randomizerId || 'dice',
        data: { values, total },
      },
    ],
  };
};

export const skipTurnAction: ActionHandler = (state, params, ctx) => {
  const playerId = String(
    resolveParam(params.playerId, state, ctx) ?? getActivePlayerId(state) ?? ''
  );
  const count = Math.max(1, Number(resolveParam(params.count, state, ctx) ?? 1));
  if (!playerId) return { state, events: [] };

  const prev = state.turn.skippedPlayers[playerId] || 0;
  return {
    state: {
      ...state,
      turn: {
        ...state.turn,
        skippedPlayers: { ...state.turn.skippedPlayers, [playerId]: prev + count },
      },
    },
    events: [],
  };
};

export const extraTurnAction: ActionHandler = (state, params, ctx) => {
  const playerId = String(
    resolveParam(params.playerId, state, ctx) ?? getActivePlayerId(state) ?? ''
  );
  const count = Math.max(1, Number(resolveParam(params.count, state, ctx) ?? 1));
  if (!playerId) return { state, events: [] };

  const prev = state.turn.extraTurns[playerId] || 0;
  return {
    state: {
      ...state,
      turn: {
        ...state.turn,
        extraTurns: { ...state.turn.extraTurns, [playerId]: prev + count },
      },
    },
    events: [],
  };
};

export const reverseOrderAction: ActionHandler = (state) => {
  return {
    state: {
      ...state,
      turn: {
        ...state.turn,
        direction: state.turn.direction === 1 ? -1 : 1,
      },
    },
    events: [],
  };
};

export const setPhaseAction: ActionHandler = (state, params, ctx) => {
  const phase = String(resolveParam(params.phase, state, ctx) ?? '');
  if (!phase) return { state, events: [] };
  const actorId = getActivePlayerId(state);
  return {
    state: {
      ...state,
      turn: {
        ...state.turn,
        phase,
      },
    },
    events: [{ type: 'phase_enter', actorId, entityId: phase }],
  };
};

export const nextTurnAction: ActionHandler = (state, _params, _ctx, pkg) => {
  const { order, currentIndex, direction, skippedPlayers, extraTurns, round } = state.turn;
  if (order.length === 0 || state.status === 'ended') {
    return { state, events: [] };
  }

  const prevPlayerId = order[currentIndex] ?? null;
  const events = [];
  if (prevPlayerId) {
    events.push({ type: 'turn_end' as const, actorId: prevPlayerId });
  }

  // Extra turn check
  if (prevPlayerId && (extraTurns[prevPlayerId] || 0) > 0) {
    const nextExtra = { ...extraTurns, [prevPlayerId]: extraTurns[prevPlayerId] - 1 };
    const initialPhase = pkg.turnConfig.initialPhase;
    events.push({ type: 'turn_start' as const, actorId: prevPlayerId });
    events.push({ type: 'phase_enter' as const, actorId: prevPlayerId, entityId: initialPhase });
    return {
      state: {
        ...state,
        turn: {
          ...state.turn,
          phase: initialPhase,
          extraTurns: nextExtra,
        },
      },
      events,
    };
  }

  let nextIdx = currentIndex;
  let nextRound = round;
  const nextSkipped = { ...skippedPlayers };
  let guard = 0;

  while (guard < order.length * 2) {
    guard++;
    const rawNext = nextIdx + direction;
    if (rawNext >= order.length) {
      nextIdx = 0;
      nextRound += 1;
    } else if (rawNext < 0) {
      nextIdx = order.length - 1;
      nextRound += 1;
    } else {
      nextIdx = rawNext;
    }

    const candId = order[nextIdx];
    const cand = state.players[candId];
    if (!cand || cand.eliminated) continue;

    if ((nextSkipped[candId] || 0) > 0) {
      nextSkipped[candId] -= 1;
      continue;
    }
    break;
  }

  const nextPlayerId = order[nextIdx] ?? null;
  const initialPhase = pkg.turnConfig.initialPhase;
  if (nextPlayerId) {
    events.push({ type: 'turn_start' as const, actorId: nextPlayerId });
    events.push({ type: 'phase_enter' as const, actorId: nextPlayerId, entityId: initialPhase });
  }

  return {
    state: {
      ...state,
      turn: {
        ...state.turn,
        currentIndex: nextIdx,
        phase: initialPhase,
        round: nextRound,
        skippedPlayers: nextSkipped,
      },
    },
    events,
  };
};
