import {
  ActionLogEntry,
  EngineState,
  EntityId,
  GameAction,
  GamePackageV2,
} from '../schema/types';
import { computeStateChecksum } from '../core/checksum';
import { reduce } from '../core/reducer';
import { viewFor } from '../view/viewFor';

export interface ClientIntent {
  type: 'intent';
  playerId: EntityId;
  action: GameAction;
  clientSeq?: number;
}

export interface ActionLogDelta {
  fromSeq: number;
  entries: ActionLogEntry[];
  checksum: string;
}

export function isReadOnlyViewerMode(search?: string): boolean {
  if (!search) return false;
  try {
    const params = new URLSearchParams(search);
    return params.get('mode') === 'view';
  } catch {
    return false;
  }
}

export function canDispatchIntent(
  isViewerMode: boolean,
  playerId: EntityId | null,
  state: EngineState
): boolean {
  if (isViewerMode || !playerId) return false;
  if (state.status === 'ended') return false;
  if (state.pending) return state.pending.playerId === playerId;
  return true;
}

/**
 * Host executes client intent through pure reducer and returns a delta of action logs.
 */
export function resolveHostIntent(
  hostState: EngineState,
  intent: ClientIntent,
  pkg: GamePackageV2,
  isViewerMode = false
): { state: EngineState; delta?: ActionLogDelta; error?: string } {
  if (!canDispatchIntent(isViewerMode, intent.playerId, hostState)) {
    return { state: hostState, error: 'Action rejected: viewer mode or unauthorized player' };
  }

  const prevLen = hostState.logs.length;
  const res = reduce(hostState, intent.action, pkg);
  if (res.error) {
    return { state: hostState, error: res.error };
  }

  const newEntries = res.state.logs.slice(prevLen);
  return {
    state: res.state,
    delta: {
      fromSeq: prevLen + 1,
      entries: newEntries,
      checksum: res.state.stateChecksum || computeStateChecksum(res.state),
    },
  };
}

/**
 * Reconnect catch-up: returns missing log entries after `lastKnownSeq`.
 */
export function getDeltaSince(
  hostState: EngineState,
  lastKnownSeq: number
): ActionLogDelta {
  const entries = hostState.logs.filter((e) => e.seq > lastKnownSeq);
  return {
    fromSeq: lastKnownSeq + 1,
    entries,
    checksum: hostState.stateChecksum || computeStateChecksum(hostState),
  };
}

/**
 * Client applies log delta from host using its local pure reducer and verifies checksum.
 */
export function applyLogDelta(
  clientState: EngineState,
  delta: ActionLogDelta,
  pkg: GamePackageV2
): { state: EngineState; synced: boolean; error?: string } {
  let state = clientState;
  for (const entry of delta.entries) {
    if (entry.seq <= state.logs.length) continue;
    const res = reduce(state, entry.action, pkg);
    if (res.error) {
      return { state, synced: false, error: res.error };
    }
    state = res.state;
  }

  const actualChecksum = state.stateChecksum || computeStateChecksum(state);
  if (delta.entries.length > 0 && actualChecksum !== delta.checksum) {
    return {
      state,
      synced: false,
      error: `Checksum mismatch after delta sync (${actualChecksum} !== ${delta.checksum})`,
    };
  }

  return { state, synced: true };
}

/**
 * Produces a redacted snapshot for a specific remote peer so hidden cards never leak.
 */
export function buildPeerSyncView(
  hostState: EngineState,
  viewerPlayerId: EntityId | null
): EngineState {
  return viewFor(hostState, viewerPlayerId);
}
