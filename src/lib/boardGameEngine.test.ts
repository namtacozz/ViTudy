import { describe, it, expect } from 'vitest';
import {
  BoardGamePackage,
  calculateBalanceTotal,
  createDefaultBoardGamePackage,
  breakAmountIntoVndNotes,
} from '@/types/boardgame';
import {
  applyTransfer,
  buyProperty,
  cleanupBoardGameOrphans,
  cleanupDeskItemsOnDelete,
  computeTileRent,
  declareBankruptcy,
  deleteBoardTileSafe,
  endTurn,
  getActivePlayerId,
  getOrderedBoardTrack,
  initMatch,
  mortgageProperty,
  payRent,
  redoMatchMove,
  rollAndMove,
  undoMatchMove,
  upgradeHouse,
  verifyLedgerIntegrity,
} from './boardGameEngine';
import { canEmitGameEvent } from '@/hooks/useRealtimeMultiplayer';
import { DeskItem } from '@/types/studyspace';

function makeTestGame(): BoardGamePackage {
  const pkg = createDefaultBoardGamePackage({
    id: 'game-engine-test',
    layoutMode: 'perimeter_ring',
    rows: 4,
    cols: 4,
    width: 400,
    height: 400,
  });

  const ordered = getOrderedBoardTrack(pkg);
  const startId = ordered[0]?.id;
  const penaltyId = ordered[2]?.id;
  const jailId = ordered[4]?.id;

  const tiles = pkg.tiles.map((t, idx) => {
    if (t.id === startId) return { ...t, role: 'start_tile' as const, title: 'Xuất phát' };
    if (t.id === penaltyId) return { ...t, role: 'penalty_tile' as const, title: 'Thuế', penaltyAmount: 50000 };
    if (t.id === jailId) return { ...t, role: 'jail_tile' as const, title: 'Nhà tù', jailTurns: 2 };
    return {
      ...t,
      title: `Đất ${idx}`,
      price: 100000,
      hasFunction: true,
      propertyDetails: {
        baseRent: 20000,
        houseCost: 50000,
        rentsByLevel: [20000, 60000, 140000, 300000, 500000] as [number, number, number, number, number],
        resellValue: 50000,
        currentHouses: 0,
      },
    };
  });

  return {
    ...pkg,
    startingCashPerPlayer: 500000,
    tiles,
    pawns: [
      { id: 'p1', name: 'An', imageUrl: '', color: '#E0562D', width: 32, height: 32, relX: 0, relY: 0 },
      { id: 'p2', name: 'Bình', imageUrl: '', color: '#2563eb', width: 32, height: 32, relX: 0, relY: 0 },
    ],
  };
}

describe('boardGameEngine & Money Ledger', () => {
  it('applyTransfer transfers money between players and logs BankTransactionLog', () => {
    const pkg = initMatch(makeTestGame());
    const t1 = applyTransfer(pkg, { fromId: 'p1', toId: 'p2', amount: 120000, reason: 'Chuyển thử' });
    expect(t1.ok).toBe(true);
    expect(calculateBalanceTotal(t1.pkg.matchState.playerBalances['p1'])).toBe(380000);
    expect(calculateBalanceTotal(t1.pkg.matchState.playerBalances['p2'])).toBe(620000);
    expect(t1.pkg.matchState.logs.some((l) => l.reason === 'Chuyển thử')).toBe(true);
  });

  it('applyTransfer rejects insufficient balance (>= 0 guard)', () => {
    const pkg = initMatch(makeTestGame());
    const res = applyTransfer(pkg, { fromId: 'p1', toId: 'bank', amount: 999000, reason: 'Vượt số dư' });
    expect(res.ok).toBe(false);
    expect(calculateBalanceTotal(res.pkg.matchState.playerBalances['p1'])).toBe(500000);
  });

  it('applyTransfer rejects negative, zero, and same-party transfers', () => {
    const pkg = initMatch(makeTestGame());
    expect(applyTransfer(pkg, { fromId: 'p1', toId: 'bank', amount: -10000, reason: 'Âm' }).ok).toBe(false);
    expect(applyTransfer(pkg, { fromId: 'p1', toId: 'bank', amount: 0, reason: '0' }).ok).toBe(false);
    expect(applyTransfer(pkg, { fromId: 'p1', toId: 'p1', amount: 10000, reason: 'Trùng' }).ok).toBe(false);
  });

  it('detects and rejects DevTools tampering on playerBalances via ledgerChecksum', () => {
    const pkg = initMatch(makeTestGame());
    const tampered: BoardGamePackage = {
      ...pkg,
      matchState: {
        ...pkg.matchState,
        playerBalances: {
          ...pkg.matchState.playerBalances,
          p1: breakAmountIntoVndNotes(9999000),
        },
      },
    };
    expect(verifyLedgerIntegrity(tampered.matchState).valid).toBe(false);
    const res = applyTransfer(tampered, { fromId: 'p1', toId: 'bank', amount: 100000, reason: 'Mua đất' });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('chỉnh sửa trái phép');
  });

  it('orders perimeter_ring track clockwise and awards pass-Start salary on wrap-around', () => {
    const pkg = initMatch(makeTestGame(), 200000);
    const track = getOrderedBoardTrack(pkg);
    expect(track.length).toBe(12);

    const rolled = rollAndMove(pkg, [6, 7]);
    expect(rolled.passedStart).toBe(true);
    expect(rolled.landedTile?.id).toBe(track[1].id);
    expect(calculateBalanceTotal(rolled.pkg.matchState.playerBalances['p1'])).toBe(700000);
  });

  it('deducts penalty when landing on penalty_tile', () => {
    const pkg = initMatch(makeTestGame());
    const hitPenalty = rollAndMove(pkg, [1, 1]);
    expect(hitPenalty.landedTile?.role).toBe('penalty_tile');
    expect(calculateBalanceTotal(hitPenalty.pkg.matchState.playerBalances['p1'])).toBe(450000);
  });

  it('holds player in jail_tile and releases on doubles', () => {
    const pkg = initMatch(makeTestGame());
    const hitJail = rollAndMove(pkg, [2, 2]);
    expect(hitJail.landedTile?.role).toBe('jail_tile');
    expect(hitJail.pkg.matchState.jailTurnsRemaining?.['p1']).toBe(2);

    const stayJail = rollAndMove(hitJail.pkg, [2, 3]);
    expect(stayJail.pkg.matchState.jailTurnsRemaining?.['p1']).toBe(1);
    expect(stayJail.landedTile).toBeNull();

    const escapeJail = rollAndMove(stayJail.pkg, [4, 4]);
    expect(escapeJail.pkg.matchState.jailTurnsRemaining?.['p1']).toBe(0);
    expect(escapeJail.landedTile).not.toBeNull();
  });

  it('buys unowned land and assigns title deed ownership', () => {
    const pkg = initMatch(makeTestGame());
    const landTile = getOrderedBoardTrack(pkg)[1];
    const bought = buyProperty(pkg, 'p1', landTile.id);
    expect(bought.ok).toBe(true);
    expect(calculateBalanceTotal(bought.pkg.matchState.playerBalances['p1'])).toBe(400000);
    // Không thể mua lại đất đã có chủ
    expect(buyProperty(bought.pkg, 'p2', landTile.id).ok).toBe(false);
  });

  it('upgrades houses and increases computed rent', () => {
    let pkg = initMatch(makeTestGame());
    const landTile = getOrderedBoardTrack(pkg)[1];
    pkg = buyProperty(pkg, 'p1', landTile.id).pkg;

    const upgraded = upgradeHouse(pkg, 'p1', landTile.id);
    expect(upgraded.ok).toBe(true);
    const updatedTile = upgraded.pkg.tiles.find((t) => t.id === landTile.id)!;
    expect(updatedTile.propertyDetails?.currentHouses).toBe(1);
    expect(computeTileRent(updatedTile)).toBe(60000);
  });

  it('pays rent from visitor to property owner', () => {
    let pkg = initMatch(makeTestGame());
    const landTile = getOrderedBoardTrack(pkg)[1];
    pkg = buyProperty(pkg, 'p1', landTile.id).pkg;

    const rented = payRent(pkg, 'p2', landTile.id);
    expect(rented.ok).toBe(true);
    expect(calculateBalanceTotal(rented.pkg.matchState.playerBalances['p2'])).toBe(480000);
    expect(calculateBalanceTotal(rented.pkg.matchState.playerBalances['p1'])).toBe(420000);
  });

  it('mortgages property for cash and waives rent while mortgaged', () => {
    let pkg = initMatch(makeTestGame());
    const landTile = getOrderedBoardTrack(pkg)[1];
    pkg = buyProperty(pkg, 'p1', landTile.id).pkg;

    const mortgaged = mortgageProperty(pkg, 'p1', landTile.id);
    expect(mortgaged.ok).toBe(true);
    expect(calculateBalanceTotal(mortgaged.pkg.matchState.playerBalances['p1'])).toBe(450000);
    expect(payRent(mortgaged.pkg, 'p2', landTile.id).ok).toBe(false);
  });

  it('supports Undo and Redo of match moves', () => {
    const pkg = initMatch(makeTestGame());
    const track = getOrderedBoardTrack(pkg);
    const moved = rollAndMove(pkg, [1]).pkg;
    expect(moved.pawns[0].currentTileId).toBe(track[1].id);

    const undone = undoMatchMove(moved);
    expect(undone.pawns[0].currentTileId).toBe(track[0].id);

    const redone = redoMatchMove(undone);
    expect(redone.pawns[0].currentTileId).toBe(track[1].id);
  });

  it('rotates turns and declares winner when opponent goes bankrupt', () => {
    const pkg = initMatch(makeTestGame());
    expect(getActivePlayerId(pkg)).toBe('p1');
    const nextTurn = endTurn(pkg);
    expect(getActivePlayerId(nextTurn)).toBe('p2');

    const finished = declareBankruptcy(nextTurn, 'p2');
    expect(finished.matchState.winnerId).toBe('p1');
    expect(finished.matchState.isPlaying).toBe(false);
    expect(finished.matchState.turnPhase).toBe('ended');
  });

  it('deleteBoardTileSafe cleans orphaned external_info, links, deeds, and pawn tileId', () => {
    let pkg = makeTestGame();
    const landTile = pkg.tiles[1];
    pkg = {
      ...pkg,
      tiles: [
        ...pkg.tiles,
        {
          id: 'ext-1',
          role: 'external_info',
          shape: 'rect',
          relX: 420,
          relY: 0,
          width: 150,
          height: 100,
          hasFunction: true,
        },
      ],
      links: [
        { id: 'lnk-1', sourceId: landTile.id, targetId: 'ext-1', linkType: 'on_step_show_info' },
        { id: 'lnk-dangling', sourceId: 'missing-tile', targetId: 'ext-1', linkType: 'on_step_show_info' },
      ],
      decks: [
        {
          id: 'deck-deed',
          name: 'Sổ Đỏ',
          deckType: 'title_deeds',
          color: '#16a34a',
          relX: 10,
          relY: 10,
          width: 100,
          height: 70,
          cards: [
            { id: 'c1', title: 'Sổ đỏ 1', description: '', linkedTileId: landTile.id, ownerPlayerId: 'p1' },
          ],
        },
      ],
      pawns: [{ ...pkg.pawns[0], currentTileId: landTile.id, drawingAssetId: 'artboard-1' }],
    };

    const cleaned = deleteBoardTileSafe(pkg, landTile.id);
    expect(cleaned.tiles.some((t) => t.id === 'ext-1')).toBe(false);
    expect(cleaned.links).toHaveLength(0);
    expect(cleaned.decks[0].cards).toHaveLength(0);
    expect(cleaned.pawns[0].currentTileId).toBeNull();
    expect(cleanupBoardGameOrphans(cleaned).tiles.length).toBeGreaterThan(0);
  });

  it('cleanupDeskItemsOnDelete removes orphaned drawingAssetId when deleting an artboard', () => {
    const pkg = makeTestGame();
    pkg.pawns[0].drawingAssetId = 'artboard-1';
    const items: DeskItem[] = [
      {
        id: 'artboard-1',
        type: 'artboard',
        title: 'Vẽ',
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        zIndex: 1,
        pageCount: 1,
        currentPageIndex: 0,
        pages: [],
      },
      {
        id: 'bg-1',
        type: 'board_game',
        title: 'Game',
        x: 100,
        y: 0,
        rotation: 0,
        scale: 1,
        zIndex: 2,
        pageCount: 1,
        currentPageIndex: 0,
        pages: [],
        boardGameData: pkg,
      },
    ];
    const remaining = cleanupDeskItemsOnDelete(items, 'artboard-1');
    expect(remaining).toHaveLength(1);
    expect(remaining[0].boardGameData?.pawns[0].drawingAssetId).toBeUndefined();
  });

  it('enforces realtime event permissions (only active-turn non-viewer may emit)', () => {
    expect(canEmitGameEvent({ isViewer: true, actorPawnId: 'p1', activeTurnPawnId: 'p1' })).toBe(false);
    expect(canEmitGameEvent({ isViewer: false, actorPawnId: 'p2', activeTurnPawnId: 'p1' })).toBe(false);
    expect(canEmitGameEvent({ isViewer: false, actorPawnId: 'p1', activeTurnPawnId: 'p1' })).toBe(true);
  });

  it('enforces host-authoritative room action resolution (including UNDO/REDO)', async () => {
    const { resolveRoomGameAction } = await import('@/hooks/useRealtimeMultiplayer');
    expect(
      resolveRoomGameAction({
        isOnline: false,
        isHost: false,
        isViewer: false,
        actorPawnId: 'p1',
        activeTurnPawnId: 'p1',
      })
    ).toBe('execute_local');

    expect(
      resolveRoomGameAction({
        isOnline: true,
        isHost: true,
        isViewer: false,
        actorPawnId: 'p1',
        activeTurnPawnId: 'p1',
      })
    ).toBe('execute_and_broadcast_state');

    // Non-host active player sends intent (e.g. UNDO/REDO/ROLL/BUY) instead of mutating locally
    expect(
      resolveRoomGameAction({
        isOnline: true,
        isHost: false,
        isViewer: false,
        actorPawnId: 'p2',
        activeTurnPawnId: 'p2',
      })
    ).toBe('send_intent');

    // Viewer or out-of-turn non-host is rejected
    expect(
      resolveRoomGameAction({
        isOnline: true,
        isHost: false,
        isViewer: true,
        actorPawnId: 'p1',
        activeTurnPawnId: 'p1',
      })
    ).toBe('reject');
    expect(
      resolveRoomGameAction({
        isOnline: true,
        isHost: false,
        isViewer: false,
        actorPawnId: 'p1',
        activeTurnPawnId: 'p2',
      })
    ).toBe('reject');
  });

  it('cleans up all orphans (deeds, links, external_info, currentTileId, drawingAssetId) when deleting board_game or land tile', () => {
    const pkg = createDefaultBoardGamePackage({
      id: 'orphan-check',
      layoutMode: 'perimeter_ring',
      rows: 5,
      cols: 5,
      width: 350,
      height: 350,
    });
    const landTile = pkg.tiles.find((t) => t.role === 'normal_cell')!;
    const extTile = {
      ...landTile,
      id: 'ext-1',
      role: 'external_info' as const,
      title: 'Thông tin đất',
    };
    pkg.tiles.push(extTile);
    pkg.links.push({
      id: 'link-ext-1',
      sourceId: landTile.id,
      targetId: extTile.id,
      linkType: 'on_step_show_info',
    });
    pkg.decks.push({
      id: 'deed-deck-1',
      name: 'Sổ đỏ',
      deckType: 'title_deeds',
      color: '#E0562D',
      relX: 0,
      relY: 0,
      width: 80,
      height: 110,
      cards: [
        {
          id: 'deed-card-1',
          title: 'Sổ đỏ Ô 1',
          description: 'Quyền sở hữu',
          linkedTileId: landTile.id,
        },
      ],
    });
    pkg.pawns = [
      {
        id: 'p1',
        name: 'P1',
        drawingAssetId: 'art-del-1',
        imageUrl: '',
        color: '#E0562D',
        width: 30,
        height: 30,
        relX: 0,
        relY: 0,
        currentTileId: landTile.id,
      },
    ];

    const afterTileDel = deleteBoardTileSafe(pkg, landTile.id);
    expect(afterTileDel.tiles.some((t) => t.id === landTile.id)).toBe(false);
    expect(afterTileDel.tiles.some((t) => t.id === extTile.id)).toBe(false);
    expect(afterTileDel.links).toHaveLength(0);
    expect(afterTileDel.decks[0].cards).toHaveLength(0);
    expect(afterTileDel.pawns[0].currentTileId).toBeFalsy();

    // Deleting board_game itself removes it cleanly
    const remainingItems = cleanupDeskItemsOnDelete(
      [
        {
          id: 'bg-del-1',
          type: 'board_game',
          title: 'Game',
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          zIndex: 1,
          pageCount: 1,
          currentPageIndex: 0,
          pages: [],
          boardGameData: afterTileDel,
        },
      ],
      'bg-del-1'
    );
    expect(remainingItems).toHaveLength(0);
  });
});
