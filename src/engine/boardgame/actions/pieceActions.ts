import { Piece } from '../schema/types';
import { resolveParam } from '../core/expressions';
import { ActionHandler, movePieceHelper } from './types';

export const movePieceAction: ActionHandler = (state, params, ctx) => {
  const pieceId = String(resolveParam(params.pieceId, state, ctx) ?? '');
  const toZoneId = resolveParam(params.toZoneId, state, ctx) as string | null;
  const position = (resolveParam(params.position, state, ctx) as 'top' | 'bottom') || 'top';
  if (!pieceId || !state.pieces[pieceId]) {
    return { state, events: [] };
  }
  const actorId = (resolveParam(params.actorId, state, ctx) as string | null) ?? ctx.playerId ?? null;
  return movePieceHelper(state, pieceId, toZoneId, actorId, position);
};

export const spawnAction: ActionHandler = (state, params, ctx) => {
  const id =
    (resolveParam(params.id, state, ctx) as string) ||
    `piece-${state.tick}-${Object.keys(state.pieces).length + 1}`;
  if (state.pieces[id]) {
    return { state, events: [], error: `Piece "${id}" already exists` };
  }
  const zoneId = (resolveParam(params.zoneId, state, ctx) as string | null) ?? null;
  const ownerId = (resolveParam(params.ownerId, state, ctx) as string | null) ?? null;
  const name = String(resolveParam(params.name, state, ctx) ?? 'Piece');
  const tags = Array.isArray(params.tags) ? (params.tags as string[]) : [];
  const faces = Array.isArray(params.faces)
    ? (params.faces as Piece['faces'])
    : [{ label: name, color: String(params.color ?? '#E0562D') }];

  const piece: Piece = {
    id,
    name,
    faces,
    activeFace: 0,
    rotation: 0,
    zoneId: null,
    ownerId,
    tags,
    fields: (params.fields as Piece['fields']) || {},
  };

  let nextState: typeof state = {
    ...state,
    pieces: { ...state.pieces, [id]: piece },
  };
  if (zoneId && nextState.zones[zoneId]) {
    return movePieceHelper(nextState, id, zoneId, ownerId);
  }
  return { state: nextState, events: [] };
};

export const destroyAction: ActionHandler = (state, params, ctx) => {
  const pieceId = String(resolveParam(params.pieceId, state, ctx) ?? '');
  const piece = state.pieces[pieceId];
  if (!piece) return { state, events: [] };

  const moved = movePieceHelper(state, pieceId, null, ctx.playerId ?? null);
  const nextPieces = { ...moved.state.pieces };
  delete nextPieces[pieceId];

  return {
    state: { ...moved.state, pieces: nextPieces },
    events: moved.events,
  };
};

export const flipAction: ActionHandler = (state, params, ctx) => {
  const pieceId = String(resolveParam(params.pieceId, state, ctx) ?? '');
  const piece = state.pieces[pieceId];
  if (!piece || piece.faces.length === 0) return { state, events: [] };

  const targetFace = params.faceIndex !== undefined
    ? Number(resolveParam(params.faceIndex, state, ctx))
    : (piece.activeFace + 1) % piece.faces.length;

  const clamped = Math.max(0, Math.min(piece.faces.length - 1, targetFace));
  return {
    state: {
      ...state,
      pieces: {
        ...state.pieces,
        [pieceId]: { ...piece, activeFace: clamped },
      },
    },
    events: [],
  };
};

export const rotateAction: ActionHandler = (state, params, ctx) => {
  const pieceId = String(resolveParam(params.pieceId, state, ctx) ?? '');
  const piece = state.pieces[pieceId];
  if (!piece) return { state, events: [] };

  const delta = params.delta !== undefined ? Number(resolveParam(params.delta, state, ctx)) : 90;
  const absolute = params.angle !== undefined ? Number(resolveParam(params.angle, state, ctx)) : null;
  const nextRot = (((absolute !== null ? absolute : piece.rotation + delta) % 360) + 360) % 360;

  return {
    state: {
      ...state,
      pieces: {
        ...state.pieces,
        [pieceId]: { ...piece, rotation: nextRot },
      },
    },
    events: [],
  };
};
