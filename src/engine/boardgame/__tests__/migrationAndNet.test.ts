import { describe, it, expect } from 'vitest';
import {
  breakAmountIntoVndNotes,
  createDefaultBoardGamePackage,
} from '@/types/boardgame';
import {
  applyLogDelta,
  buildPeerSyncView,
  createInitialState,
  createMonopolyPackageV2,
  getCounterValue,
  getDeltaSince,
  isReadOnlyViewerMode,
  migrateV1toV2,
  resolveHostIntent,
  validateGamePackage,
} from '../index';

describe('Cluster C, E, J: Migration v1->v2 & Host-Authoritative Multiplayer', () => {
  it('migrates an in-progress v1 BoardGamePackage idempotently and passes v2 validator', () => {
    const v1 = createDefaultBoardGamePackage({
      id: 'v1-monopoly',
      layoutMode: 'perimeter_ring',
      rows: 5,
      cols: 5,
      width: 500,
      height: 500,
    });
    v1.pawns = [
      {
        id: 'p1',
        name: 'Pawn 1',
        imageUrl: '',
        color: '#E0562D',
        width: 28,
        height: 28,
        relX: 0,
        relY: 0,
        currentTileId: v1.tiles[2].id,
        controlledByUserId: 'p1',
      },
      {
        id: 'p2',
        name: 'Pawn 2',
        imageUrl: '',
        color: '#2563eb',
        width: 28,
        height: 28,
        relX: 0,
        relY: 0,
        currentTileId: v1.tiles[0].id,
        controlledByUserId: 'p2',
      },
    ];
    v1.matchState.isPlaying = true;
    v1.matchState.turnOrder = ['p1', 'p2'];
    v1.matchState.currentTurnIndex = 1;
    v1.matchState.playerBalances = {
      p1: breakAmountIntoVndNotes(1450000),
      p2: breakAmountIntoVndNotes(2100000),
    };
    v1.matchState.jailTurnsRemaining = { p1: 2 };

    const first = migrateV1toV2(v1, 77);
    expect(first.migratedFromV1).toBe(true);
    expect(validateGamePackage(first.pkg)).toEqual({ valid: true, errors: [] });
    expect(first.state.status).toBe('playing');
    expect(first.state.turn.currentIndex).toBe(1);
    expect(getCounterValue(first.state, 'cash', 'p1')).toBe(1450000);
    expect(getCounterValue(first.state, 'cash', 'p2')).toBe(2100000);
    expect(getCounterValue(first.state, 'jail_turns', 'p1')).toBe(2);
    expect(first.state.pieces['pawn-p1'].zoneId).toBe(v1.tiles[2].id);

    // Idempotent check on v2 input
    const second = migrateV1toV2(first.pkg, 77);
    expect(second.migratedFromV1).toBe(false);
    expect(second.pkg).toEqual(first.pkg);
  });

  it('syncs multiplayer clients via action log deltas, supports reconnect catch-up, and blocks ?mode=view', () => {
    const pkg = createMonopolyPackageV2();
    let hostState = createInitialState(pkg, 555);
    let clientState = createInitialState(pkg, 555);

    expect(isReadOnlyViewerMode('?room=abc&mode=view')).toBe(true);
    expect(isReadOnlyViewerMode('?room=abc')).toBe(false);

    // Viewer mode rejected on host
    const viewerAttempt = resolveHostIntent(
      hostState,
      { type: 'intent', playerId: 'p1', action: { type: 'start_game' } },
      pkg,
      true
    );
    expect(viewerAttempt.error).toBeDefined();

    // Host processes start_game + roll
    const step1 = resolveHostIntent(
      hostState,
      { type: 'intent', playerId: 'p1', action: { type: 'start_game' } },
      pkg
    );
    expect(step1.error).toBeUndefined();
    hostState = step1.state;

    const step2 = resolveHostIntent(
      hostState,
      { type: 'intent', playerId: 'p1', action: { type: 'press_button', playerId: 'p1', buttonId: 'btn-roll' } },
      pkg
    );
    expect(step2.error).toBeUndefined();
    hostState = step2.state;

    // Client reconnects from seq 0 and catches up using delta
    const catchUpDelta = getDeltaSince(hostState, 0);
    expect(catchUpDelta.entries.length).toBe(2);

    const synced = applyLogDelta(clientState, catchUpDelta, pkg);
    expect(synced.synced).toBe(true);
    expect(synced.state.stateChecksum).toBe(hostState.stateChecksum);

    // Peer sync view redacts hidden chance-deck cards
    const p2View = buildPeerSyncView(hostState, 'p2');
    expect(p2View.pieces['chance-1'].hidden).toBe(true);
  });
});
