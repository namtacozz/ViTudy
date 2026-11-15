import { resolveParam } from '../core/expressions';
import { deterministicShuffle } from '../core/rng';
import { ActionHandler, movePieceHelper } from './types';

export const shuffleAction: ActionHandler = (state, params, ctx) => {
  const zoneId = String(resolveParam(params.zoneId, state, ctx) ?? '');
  const list = state.zonePieces[zoneId];
  if (!list || list.length <= 1) return { state, events: [] };

  const { result, nextState: nextRng } = deterministicShuffle(list, state.rngState);
  return {
    state: {
      ...state,
      rngState: nextRng,
      zonePieces: {
        ...state.zonePieces,
        [zoneId]: result,
      },
    },
    events: [],
  };
};

export const drawAction: ActionHandler = (state, params, ctx) => {
  const fromZoneId = String(resolveParam(params.fromZoneId, state, ctx) ?? '');
  const toZoneId = String(resolveParam(params.toZoneId, state, ctx) ?? '');
  const count = Math.max(1, Number(resolveParam(params.count, state, ctx) ?? 1));
  const actorId = (resolveParam(params.playerId, state, ctx) as string | null) ?? ctx.playerId ?? null;

  let curState = state;
  const allEvents = [];

  for (let i = 0; i < count; i++) {
    const stack = curState.zonePieces[fromZoneId] || [];
    if (stack.length === 0) break;
    const topPieceId = stack[stack.length - 1];
    const moved = movePieceHelper(curState, topPieceId, toZoneId, actorId, 'top');
    curState = moved.state;
    allEvents.push(...moved.events);
  }

  return { state: curState, events: allEvents };
};

export const discardAction: ActionHandler = (state, params, ctx) => {
  const pieceId = String(resolveParam(params.pieceId, state, ctx) ?? '');
  const toZoneId = String(resolveParam(params.toZoneId, state, ctx) ?? '');
  const actorId = (resolveParam(params.playerId, state, ctx) as string | null) ?? ctx.playerId ?? null;
  if (!pieceId || !toZoneId) return { state, events: [] };

  const moved = movePieceHelper(state, pieceId, toZoneId, actorId, 'top');
  return {
    state: moved.state,
    events: [
      ...moved.events,
      { type: 'card_played', actorId, entityId: pieceId, targetId: toZoneId },
    ],
  };
};

export const dealAction: ActionHandler = (state, params, ctx) => {
  const fromZoneId = String(resolveParam(params.fromZoneId, state, ctx) ?? '');
  const countPerPlayer = Math.max(1, Number(resolveParam(params.count, state, ctx) ?? 1));

  let curState = state;
  const allEvents = [];
  const players = curState.turn.order
    .map((pid) => curState.players[pid])
    .filter((p) => p && p.handZoneId && !p.eliminated);

  for (let round = 0; round < countPerPlayer; round++) {
    for (const player of players) {
      const stack = curState.zonePieces[fromZoneId] || [];
      if (stack.length === 0) break;
      const topPieceId = stack[stack.length - 1];
      const moved = movePieceHelper(curState, topPieceId, player.handZoneId!, player.id, 'top');
      curState = moved.state;
      allEvents.push(...moved.events);
    }
  }

  return { state: curState, events: allEvents };
};
