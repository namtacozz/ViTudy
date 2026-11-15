import {
  ActionSpec,
  EngineEvent,
  EngineState,
  EntityId,
  GamePackageV2,
  PendingInput,
} from '../schema/types';
import { EvalContext } from '../core/expressions';

export interface ActionExecutionResult {
  state: EngineState;
  events: EngineEvent[];
  enqueue?: ActionSpec[];
  pauseForInput?: Omit<PendingInput, 'resumeQueue'>;
  error?: string;
}

export type ActionHandler = (
  state: EngineState,
  params: Record<string, unknown>,
  ctx: EvalContext,
  pkg: GamePackageV2
) => ActionExecutionResult;

/**
 * Shared helper to move a piece into a target zone cleanly, updating both
 * piece.zoneId and zonePieces index, and emitting piece_leave / piece_enter / zone_empty.
 */
export function movePieceHelper(
  state: EngineState,
  pieceId: EntityId,
  toZoneId: EntityId | null,
  actorId?: EntityId | null,
  position: 'top' | 'bottom' = 'top'
): { state: EngineState; events: EngineEvent[] } {
  const piece = state.pieces[pieceId];
  if (!piece) return { state, events: [] };

  const fromZoneId = piece.zoneId;
  if (fromZoneId === toZoneId) return { state, events: [] };

  const nextZonePieces = { ...state.zonePieces };
  const events: EngineEvent[] = [];

  if (fromZoneId && nextZonePieces[fromZoneId]) {
    const remaining = nextZonePieces[fromZoneId].filter((id) => id !== pieceId);
    nextZonePieces[fromZoneId] = remaining;
    events.push({
      type: 'piece_leave',
      actorId: actorId ?? piece.ownerId ?? null,
      entityId: pieceId,
      targetId: fromZoneId,
    });
    if (remaining.length === 0) {
      events.push({
        type: 'zone_empty',
        actorId: actorId ?? null,
        entityId: fromZoneId,
      });
    }
  }

  if (toZoneId && state.zones[toZoneId]) {
    const list = [...(nextZonePieces[toZoneId] || [])].filter((id) => id !== pieceId);
    if (position === 'bottom') {
      list.unshift(pieceId);
    } else {
      list.push(pieceId);
    }
    nextZonePieces[toZoneId] = list;
  }

  const nextPieces = {
    ...state.pieces,
    [pieceId]: {
      ...piece,
      zoneId: toZoneId,
    },
  };

  if (toZoneId) {
    events.push({
      type: 'piece_enter',
      actorId: actorId ?? piece.ownerId ?? null,
      entityId: pieceId,
      targetId: toZoneId,
      data: { fromZoneId },
    });
  }

  return {
    state: {
      ...state,
      pieces: nextPieces,
      zonePieces: nextZonePieces,
    },
    events,
  };
}
