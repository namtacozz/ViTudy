import {
  BankTransactionLog,
  BoardGameMatchState,
  BoardGamePackage,
  BoardTile,
  GameCardItem,
  MatchSnapshot,
  breakAmountIntoVndNotes,
  calculateBalanceTotal,
  createEmptyBalance,
} from '@/types/boardgame';
import { DeskItem } from '@/types/studyspace';

export interface TransferParams {
  fromId: string; // 'bank' hoặc pawnId
  toId: string; // 'bank' hoặc pawnId
  amount: number;
  reason: string;
}

export interface TransferResult {
  ok: boolean;
  error?: string;
  pkg: BoardGamePackage;
}

/**
 * Tạo checksum chống chỉnh sửa trực tiếp playerBalances qua DevTools.
 * Mọi thay đổi số dư hợp lệ đều phải đi qua applyTransfer để cập nhật checksum mới.
 */
export function computeLedgerChecksum(
  playerBalances: Record<string, Record<number, number>>,
  logs: BankTransactionLog[]
): string {
  const sortedIds = Object.keys(playerBalances || {}).sort();
  const balanceSignature = sortedIds
    .map((id) => {
      const bal = playerBalances[id] || {};
      const total = calculateBalanceTotal(bal as any);
      return `${id}:${total}`;
    })
    .join('|');
  const lastLogId = logs.length > 0 ? logs[logs.length - 1].id : 'none';
  const payload = `${balanceSignature}#${logs.length}#${lastLogId}`;
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `lg_${(hash >>> 0).toString(16)}`;
}

export function verifyLedgerIntegrity(matchState: BoardGameMatchState): {
  valid: boolean;
  error?: string;
} {
  if (!matchState.ledgerChecksum) {
    return { valid: true };
  }
  const expected = computeLedgerChecksum(matchState.playerBalances || {}, matchState.logs || []);
  if (expected !== matchState.ledgerChecksum) {
    return {
      valid: false,
      error: 'Phát hiện số dư bị chỉnh sửa trái phép ngoài sổ cái. Giao dịch bị từ chối.',
    };
  }
  return { valid: true };
}

/**
 * Hàm DUY NHẤT được phép thay đổi số dư người chơi / ngân hàng.
 * Kiểm tra toàn vẹn sổ cái, kiểm tra số dư >= 0 và ghi BankTransactionLog.
 */
export function applyTransfer(
  pkg: BoardGamePackage,
  params: TransferParams
): TransferResult {
  const { fromId, toId, amount, reason } = params;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: 'Số tiền giao dịch phải lớn hơn 0.', pkg };
  }
  if (fromId === toId) {
    return { ok: false, error: 'Bên gửi và bên nhận không được trùng nhau.', pkg };
  }

  const integrity = verifyLedgerIntegrity(pkg.matchState);
  if (!integrity.valid) {
    return { ok: false, error: integrity.error, pkg };
  }

  const roundedAmount = Math.round(amount);
  const nextBalances = { ...(pkg.matchState.playerBalances || {}) };

  if (fromId !== 'bank') {
    const currentFrom = calculateBalanceTotal(nextBalances[fromId]);
    if (currentFrom < roundedAmount) {
      return {
        ok: false,
        error: `${pkg.matchState.playerNames?.[fromId] || fromId} không đủ số dư (${currentFrom.toLocaleString('vi-VN')}đ < ${roundedAmount.toLocaleString('vi-VN')}đ).`,
        pkg,
      };
    }
    const newFromTotal = currentFrom - roundedAmount;
    if (newFromTotal < 0) {
      return { ok: false, error: 'Số dư không thể âm.', pkg };
    }
    nextBalances[fromId] = breakAmountIntoVndNotes(newFromTotal);
  }

  if (toId !== 'bank') {
    const currentTo = calculateBalanceTotal(nextBalances[toId] || createEmptyBalance());
    nextBalances[toId] = breakAmountIntoVndNotes(currentTo + roundedAmount);
  }

  const fromLabel = fromId === 'bank' ? 'Ngân hàng' : (pkg.matchState.playerNames?.[fromId] || fromId);
  const toLabel = toId === 'bank' ? 'Ngân hàng' : (pkg.matchState.playerNames?.[toId] || toId);

  const newLog: BankTransactionLog = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    message: `${fromLabel} → ${toLabel}: ${roundedAmount.toLocaleString('vi-VN')}đ (${reason})`,
    fromId,
    toId,
    amount: roundedAmount,
    reason,
  };

  const nextLogs = [...(pkg.matchState.logs || []), newLog];
  const nextChecksum = computeLedgerChecksum(nextBalances, nextLogs);

  return {
    ok: true,
    pkg: {
      ...pkg,
      updatedAt: new Date().toISOString(),
      matchState: {
        ...pkg.matchState,
        playerBalances: nextBalances,
        logs: nextLogs,
        ledgerChecksum: nextChecksum,
      },
    },
  };
}

/**
 * Dọn sạch toàn bộ dữ liệu mồ côi trong BoardGamePackage:
 * - GameNodeLink trỏ tới tile/card không còn tồn tại
 * - Thẻ Sổ Đỏ có linkedTileId không còn tồn tại
 * - Pawn có currentTileId trỏ tới tile đã bị xóa
 * - activeTriggeredInfoTileIds trỏ tới tile không tồn tại
 */
export function cleanupBoardGameOrphans(pkg: BoardGamePackage): BoardGamePackage {
  const validTileIds = new Set(pkg.tiles.map((t) => t.id));
  const validDeckIds = new Set(pkg.decks.map((d) => d.id));

  const cleanedDecks = pkg.decks.map((deck) => ({
    ...deck,
    cards: deck.cards.filter((card) => !card.linkedTileId || validTileIds.has(card.linkedTileId)),
  }));

  const validCardIds = new Set<string>();
  for (const d of cleanedDecks) {
    for (const c of d.cards) validCardIds.add(c.id);
  }

  const isValidEndpoint = (id: string) =>
    validTileIds.has(id) || validDeckIds.has(id) || validCardIds.has(id);

  const cleanedLinks = pkg.links.filter(
    (link) => isValidEndpoint(link.sourceId) && isValidEndpoint(link.targetId)
  );

  const cleanedPawns = pkg.pawns.map((pawn) =>
    pawn.currentTileId && !validTileIds.has(pawn.currentTileId)
      ? { ...pawn, currentTileId: null }
      : pawn
  );

  const cleanedTriggeredIds = (pkg.matchState.activeTriggeredInfoTileIds || []).filter((id) =>
    validTileIds.has(id)
  );

  return {
    ...pkg,
    tiles: pkg.tiles.map((t) =>
      t.deckId && !validDeckIds.has(t.deckId) ? { ...t, deckId: undefined } : t
    ),
    decks: cleanedDecks,
    links: cleanedLinks,
    pawns: cleanedPawns,
    matchState: {
      ...pkg.matchState,
      activeTriggeredInfoTileIds: cleanedTriggeredIds,
    },
  };
}

/**
 * Xóa một ô trên bàn cờ một cách an toàn:
 * tự động xóa các ô external_info chỉ gắn vào ô này, dọn GameNodeLink,
 * xóa thẻ Sổ Đỏ liên kết với ô này và đưa quân cờ đứng trên ô về null.
 */
export function deleteBoardTileSafe(pkg: BoardGamePackage, tileId: string): BoardGamePackage {
  const preCleaned = cleanupBoardGameOrphans(pkg);
  const targetExternalIds = new Set(
    preCleaned.links
      .filter((l) => l.sourceId === tileId && l.linkType === 'on_step_show_info')
      .map((l) => l.targetId)
  );

  // Chỉ xóa external_info nếu không có ô hợp lệ khác trỏ tới nó
  const stillReferencedExternal = new Set(
    preCleaned.links
      .filter((l) => l.sourceId !== tileId && targetExternalIds.has(l.targetId))
      .map((l) => l.targetId)
  );

  const removedTileIds = new Set<string>([tileId]);
  for (const extId of targetExternalIds) {
    if (!stillReferencedExternal.has(extId)) {
      const tile = preCleaned.tiles.find((t) => t.id === extId);
      if (tile?.role === 'external_info') {
        removedTileIds.add(extId);
      }
    }
  }

  const nextPkg: BoardGamePackage = {
    ...preCleaned,
    updatedAt: new Date().toISOString(),
    tiles: preCleaned.tiles.filter((t) => !removedTileIds.has(t.id)),
  };

  return cleanupBoardGameOrphans(nextPkg);
}

/**
 * Dọn sạch tham chiếu mồ côi giữa các vật thể trên bàn học khi xóa 1 DeskItem
 * (VD: xóa artboard sẽ gỡ drawingAssetId mồ côi trên các pawn của board_game;
 * xóa board_game sẽ chạy cleanupBoardGameOrphans / dọn sạch).
 */
export function cleanupDeskItemsOnDelete(items: DeskItem[], deletedId: string): DeskItem[] {
  const deletedItem = items.find((i) => i.id === deletedId);
  const remaining = items.filter((i) => i.id !== deletedId);

  if (!deletedItem) return remaining;

  return remaining.map((item) => {
    if (item.type === 'board_game' && item.boardGameData) {
      let pkg = cleanupBoardGameOrphans(item.boardGameData);
      if (deletedItem.type === 'artboard') {
        pkg = {
          ...pkg,
          pawns: pkg.pawns.map((p) =>
            p.drawingAssetId === deletedId ? { ...p, drawingAssetId: undefined } : p
          ),
        };
      }
      return { ...item, boardGameData: pkg };
    }
    return item;
  });
}

/**
 * Lấy danh sách các ô đi trên bàn cờ theo đúng thứ tự vòng đi.
 */
export function getOrderedBoardTrack(pkg: BoardGamePackage): BoardTile[] {
  const trackTiles = pkg.tiles.filter(
    (t) => t.role !== 'external_info' && t.role !== 'bank_zone' && t.role !== 'dice_drop_zone'
  );
  if (trackTiles.length === 0) return [];

  const { rows, cols, layoutMode } = pkg.mapConfig;
  if (layoutMode === 'perimeter_ring' && rows >= 2 && cols >= 2) {
    const orderIndex = (t: BoardTile): number => {
      const r = t.gridRow ?? 0;
      const c = t.gridCol ?? 0;
      if (r === 0) return c; // Top row left -> right
      if (c === cols - 1) return cols + r - 1; // Right col top -> bottom
      if (r === rows - 1) return cols + (rows - 1) + (cols - 1 - c); // Bottom row right -> left
      if (c === 0) return cols + (rows - 1) + (cols - 1) + (rows - 1 - r); // Left col bottom -> top
      return 10000 + r * cols + c;
    };
    return [...trackTiles].sort((a, b) => orderIndex(a) - orderIndex(b));
  }

  return [...trackTiles].sort((a, b) => {
    const ra = a.gridRow ?? 0;
    const rb = b.gridRow ?? 0;
    if (ra !== rb) return ra - rb;
    return (a.gridCol ?? 0) - (b.gridCol ?? 0);
  });
}

function createSnapshot(pkg: BoardGamePackage): MatchSnapshot {
  return {
    playerBalances: structuredClone(pkg.matchState.playerBalances),
    pawns: structuredClone(pkg.pawns),
    tiles: structuredClone(pkg.tiles),
    decks: structuredClone(pkg.decks),
    currentTurnIndex: pkg.matchState.currentTurnIndex ?? 0,
    turnPhase: pkg.matchState.turnPhase ?? 'roll',
    jailTurnsRemaining: { ...(pkg.matchState.jailTurnsRemaining || {}) },
    bankruptPlayerIds: [...(pkg.matchState.bankruptPlayerIds || [])],
    winnerId: pkg.matchState.winnerId ?? null,
    lastDiceRoll: pkg.matchState.lastDiceRoll ?? null,
    lastDrawnCard: pkg.matchState.lastDrawnCard ?? null,
    ledgerChecksum: pkg.matchState.ledgerChecksum,
  };
}

function pushUndoSnapshot(pkg: BoardGamePackage, snap: MatchSnapshot): BoardGamePackage {
  const prevUndo = pkg.matchState.undoStack || [];
  const nextUndo = [...prevUndo.slice(-29), snap];
  return {
    ...pkg,
    matchState: {
      ...pkg.matchState,
      undoStack: nextUndo,
      redoStack: [],
    },
  };
}

export function undoMatchMove(pkg: BoardGamePackage): BoardGamePackage {
  const undoStack = pkg.matchState.undoStack || [];
  if (undoStack.length === 0) return pkg;
  const previous = undoStack[undoStack.length - 1];
  const currentSnap = createSnapshot(pkg);

  return {
    ...pkg,
    updatedAt: new Date().toISOString(),
    pawns: structuredClone(previous.pawns),
    tiles: structuredClone(previous.tiles),
    decks: structuredClone(previous.decks),
    matchState: {
      ...pkg.matchState,
      playerBalances: structuredClone(previous.playerBalances),
      currentTurnIndex: previous.currentTurnIndex,
      turnPhase: previous.turnPhase,
      jailTurnsRemaining: { ...previous.jailTurnsRemaining },
      bankruptPlayerIds: [...previous.bankruptPlayerIds],
      winnerId: previous.winnerId,
      lastDiceRoll: previous.lastDiceRoll,
      lastDrawnCard: previous.lastDrawnCard,
      ledgerChecksum: computeLedgerChecksum(previous.playerBalances, pkg.matchState.logs),
      undoStack: undoStack.slice(0, -1),
      redoStack: [...(pkg.matchState.redoStack || []), currentSnap],
    },
  };
}

export function redoMatchMove(pkg: BoardGamePackage): BoardGamePackage {
  const redoStack = pkg.matchState.redoStack || [];
  if (redoStack.length === 0) return pkg;
  const next = redoStack[redoStack.length - 1];
  const currentSnap = createSnapshot(pkg);

  return {
    ...pkg,
    updatedAt: new Date().toISOString(),
    pawns: structuredClone(next.pawns),
    tiles: structuredClone(next.tiles),
    decks: structuredClone(next.decks),
    matchState: {
      ...pkg.matchState,
      playerBalances: structuredClone(next.playerBalances),
      currentTurnIndex: next.currentTurnIndex,
      turnPhase: next.turnPhase,
      jailTurnsRemaining: { ...next.jailTurnsRemaining },
      bankruptPlayerIds: [...next.bankruptPlayerIds],
      winnerId: next.winnerId,
      lastDiceRoll: next.lastDiceRoll,
      lastDrawnCard: next.lastDrawnCard,
      ledgerChecksum: computeLedgerChecksum(next.playerBalances, pkg.matchState.logs),
      undoStack: [...(pkg.matchState.undoStack || []), currentSnap],
      redoStack: redoStack.slice(0, -1),
    },
  };
}

export function initMatch(pkg: BoardGamePackage, passStartSalary = 200000): BoardGamePackage {
  const track = getOrderedBoardTrack(pkg);
  const startTile = track.find((t) => t.role === 'start_tile') || track[0] || null;
  const turnOrder = pkg.pawns.map((p) => p.id);

  const playerBalances: Record<string, Record<number, number>> = {
    ...(pkg.matchState.playerBalances || {}),
  };
  const playerNames: Record<string, string> = {
    ...(pkg.matchState.playerNames || {}),
  };

  for (const pawn of pkg.pawns) {
    playerNames[pawn.id] = pawn.name;
    if (!playerBalances[pawn.id]) {
      playerBalances[pawn.id] = breakAmountIntoVndNotes(pkg.startingCashPerPlayer || 1500000);
    }
  }

  const pawns = pkg.pawns.map((p) => ({
    ...p,
    currentTileId: p.currentTileId || startTile?.id || null,
    relX: startTile ? startTile.relX + startTile.width / 2 : p.relX,
    relY: startTile ? startTile.relY + startTile.height / 2 : p.relY,
  }));

  const logs = [
    ...(pkg.matchState.logs || []),
    {
      id: `tx-start-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `Bắt đầu ván đấu với ${turnOrder.length} người chơi.`,
    },
  ];

  return {
    ...pkg,
    updatedAt: new Date().toISOString(),
    pawns,
    matchState: {
      ...pkg.matchState,
      isPlaying: true,
      playerBalances: playerBalances as any,
      playerNames,
      turnOrder,
      currentTurnIndex: 0,
      turnPhase: 'roll',
      jailTurnsRemaining: {},
      bankruptPlayerIds: [],
      winnerId: null,
      passStartSalary,
      logs,
      ledgerChecksum: computeLedgerChecksum(playerBalances, logs),
      undoStack: [],
      redoStack: [],
    },
  };
}

export function getActivePlayerId(pkg: BoardGamePackage): string | null {
  const order = pkg.matchState.turnOrder || pkg.pawns.map((p) => p.id);
  if (order.length === 0) return null;
  const idx = pkg.matchState.currentTurnIndex ?? 0;
  return order[idx % order.length] || null;
}

export function findDeedForTile(
  pkg: BoardGamePackage,
  tileId: string
): { deckIndex: number; cardIndex: number; card: GameCardItem } | null {
  for (let d = 0; d < pkg.decks.length; d++) {
    const cIdx = pkg.decks[d].cards.findIndex((c) => c.linkedTileId === tileId);
    if (cIdx !== -1) {
      return { deckIndex: d, cardIndex: cIdx, card: pkg.decks[d].cards[cIdx] };
    }
  }
  return null;
}

export function rollAndMove(
  pkg: BoardGamePackage,
  diceValues: number[]
): {
  pkg: BoardGamePackage;
  landedTile: BoardTile | null;
  events: string[];
  passedStart: boolean;
} {
  const activeId = getActivePlayerId(pkg);
  if (!activeId) {
    return { pkg, landedTile: null, events: ['Chưa có quân cờ nào trên bàn.'], passedStart: false };
  }

  const snap = createSnapshot(pkg);
  const track = getOrderedBoardTrack(pkg);
  if (track.length === 0) {
    return { pkg, landedTile: null, events: ['Bàn cờ chưa có ô nào.'], passedStart: false };
  }

  const events: string[] = [];
  const total = diceValues.reduce((sum, v) => sum + v, 0);
  const isDoubles = diceValues.length >= 2 && diceValues.every((v) => v === diceValues[0]);
  const jailMap = { ...(pkg.matchState.jailTurnsRemaining || {}) };
  const activeName = pkg.matchState.playerNames?.[activeId] || activeId;

  let nextPkg: BoardGamePackage = {
    ...pkg,
    matchState: {
      ...pkg.matchState,
      lastDiceRoll: { values: diceValues, total, rolledAt: Date.now() },
    },
  };

  // Kiểm tra trạng thái ngồi tù
  if ((jailMap[activeId] || 0) > 0) {
    if (isDoubles) {
      jailMap[activeId] = 0;
      events.push(`${activeName} tung được đôi ${diceValues.join('+')} và ra tù ngay!`);
    } else {
      jailMap[activeId] -= 1;
      events.push(
        `${activeName} đang ở ô Tù (còn ${jailMap[activeId]} lượt).`
      );
      nextPkg = {
        ...nextPkg,
        matchState: {
          ...nextPkg.matchState,
          jailTurnsRemaining: jailMap,
          turnPhase: 'action',
        },
      };
      return {
        pkg: pushUndoSnapshot(nextPkg, snap),
        landedTile: null,
        events,
        passedStart: false,
      };
    }
  }

  const pawnIndex = nextPkg.pawns.findIndex((p) => p.id === activeId);
  if (pawnIndex === -1) {
    return { pkg, landedTile: null, events: ['Không tìm thấy quân cờ đang tới lượt.'], passedStart: false };
  }

  const currentTileId = nextPkg.pawns[pawnIndex].currentTileId;
  const currentTrackIndex = Math.max(
    0,
    track.findIndex((t) => t.id === currentTileId)
  );
  const rawNextIndex = currentTrackIndex + total;
  const passedStart = rawNextIndex >= track.length;
  const nextTrackIndex = ((rawNextIndex % track.length) + track.length) % track.length;
  const landedTile = track[nextTrackIndex];

  const updatedPawns = nextPkg.pawns.map((p, idx) =>
    idx === pawnIndex
      ? {
          ...p,
          currentTileId: landedTile.id,
          relX: landedTile.relX + landedTile.width / 2,
          relY: landedTile.relY + landedTile.height / 2,
        }
      : p
  );

  // Kích hoạt external_info gắn với ô vừa đáp
  const triggeredInfoIds = nextPkg.links
    .filter((l) => l.sourceId === landedTile.id && l.linkType === 'on_step_show_info')
    .map((l) => l.targetId);

  nextPkg = {
    ...nextPkg,
    pawns: updatedPawns,
    matchState: {
      ...nextPkg.matchState,
      jailTurnsRemaining: jailMap,
      activeTriggeredInfoTileIds: triggeredInfoIds,
      turnPhase: 'action',
    },
  };

  events.push(`${activeName} tung được ${total} điểm, đi tới ô "${landedTile.title || landedTile.id}".`);

  // Qua ô Start nhận lương
  if (passedStart) {
    const salary = nextPkg.matchState.passStartSalary ?? 200000;
    const salaryRes = applyTransfer(nextPkg, {
      fromId: 'bank',
      toId: activeId,
      amount: salary,
      reason: 'Qua ô Xuất phát nhận lương',
    });
    if (salaryRes.ok) {
      nextPkg = salaryRes.pkg;
      events.push(`${activeName} đi qua ô Xuất phát, nhận +${salary.toLocaleString('vi-VN')}đ.`);
    }
  }

  // Xử lý ô Phạt tiền
  if (landedTile.role === 'penalty_tile') {
    const penalty = landedTile.penaltyAmount ?? landedTile.price ?? 100000;
    const penRes = applyTransfer(nextPkg, {
      fromId: activeId,
      toId: 'bank',
      amount: penalty,
      reason: `Phạt tại ô ${landedTile.title || 'Thuế/Phạt'}`,
    });
    if (penRes.ok) {
      nextPkg = penRes.pkg;
      events.push(`${activeName} nộp phạt ${penalty.toLocaleString('vi-VN')}đ.`);
    } else {
      events.push(penRes.error || 'Không đủ tiền nộp phạt!');
    }
  }

  // Xử lý ô Tù
  if (landedTile.role === 'jail_tile') {
    const turns = landedTile.jailTurns ?? 2;
    nextPkg = {
      ...nextPkg,
      matchState: {
        ...nextPkg.matchState,
        jailTurnsRemaining: {
          ...(nextPkg.matchState.jailTurnsRemaining || {}),
          [activeId]: turns,
        },
      },
    };
    events.push(`${activeName} bị giữ tại ô Tù ${turns} lượt.`);
  }

  return {
    pkg: pushUndoSnapshot(nextPkg, snap),
    landedTile,
    events,
    passedStart,
  };
}

export function buyProperty(
  pkg: BoardGamePackage,
  pawnId: string,
  tileId: string
): TransferResult {
  const tile = pkg.tiles.find((t) => t.id === tileId);
  if (!tile || !tile.price || tile.price <= 0) {
    return { ok: false, error: 'Ô này không phải bất động sản có thể mua.', pkg };
  }

  const existingDeed = findDeedForTile(pkg, tileId);
  if (existingDeed?.card.ownerPlayerId) {
    return { ok: false, error: 'Ô đất này đã có chủ sở hữu.', pkg };
  }

  const snap = createSnapshot(pkg);
  const transferRes = applyTransfer(pkg, {
    fromId: pawnId,
    toId: 'bank',
    amount: tile.price,
    reason: `Mua ô "${tile.title || tile.id}"`,
  });
  if (!transferRes.ok) return transferRes;

  let nextDecks = [...transferRes.pkg.decks];
  if (existingDeed) {
    nextDecks = nextDecks.map((d, idx) =>
      idx === existingDeed.deckIndex
        ? {
            ...d,
            cards: d.cards.map((c, cIdx) =>
              cIdx === existingDeed.cardIndex ? { ...c, ownerPlayerId: pawnId } : c
            ),
          }
        : d
    );
  } else {
    // Tự tạo hoặc gắn vào bộ Sổ Đỏ đầu tiên
    const deedDeckIdx = nextDecks.findIndex((d) => d.deckType === 'title_deeds');
    const newCard: GameCardItem = {
      id: `deed-${tile.id}-${Date.now()}`,
      title: `Sổ đỏ: ${tile.title || tile.id}`,
      description: `Chứng nhận quyền sở hữu ô ${tile.title || tile.id}.`,
      linkedTileId: tile.id,
      ownerPlayerId: pawnId,
    };
    if (deedDeckIdx !== -1) {
      nextDecks[deedDeckIdx] = {
        ...nextDecks[deedDeckIdx],
        cards: [...nextDecks[deedDeckIdx].cards, newCard],
      };
    } else {
      nextDecks.push({
        id: `deck-deeds-${Date.now()}`,
        name: 'Bộ Sổ Đỏ',
        deckType: 'title_deeds',
        color: '#16a34a',
        relX: 20,
        relY: 20,
        width: 110,
        height: 76,
        cards: [newCard],
      });
    }
  }

  return {
    ok: true,
    pkg: pushUndoSnapshot({ ...transferRes.pkg, decks: nextDecks }, snap),
  };
}

export function computeTileRent(tile: BoardTile): number {
  const details = tile.propertyDetails;
  if (!details) return Math.round((tile.price || 100000) * 0.1);
  if (details.isMortgaged) return 0;
  const lvl = Math.max(0, Math.min(4, details.currentHouses || 0));
  return details.rentsByLevel?.[lvl] ?? details.baseRent;
}

export function payRent(
  pkg: BoardGamePackage,
  payerPawnId: string,
  tileId: string
): TransferResult {
  const tile = pkg.tiles.find((t) => t.id === tileId);
  if (!tile) return { ok: false, error: 'Không tìm thấy ô đất.', pkg };
  if (tile.propertyDetails?.isMortgaged) {
    return { ok: false, error: 'Ô đất đang thế chấp, không thu tiền thuê.', pkg };
  }

  const deed = findDeedForTile(pkg, tileId);
  const ownerId = deed?.card.ownerPlayerId;
  if (!ownerId || ownerId === payerPawnId) {
    return { ok: false, error: 'Không cần trả tiền thuê cho ô này.', pkg };
  }
  if ((pkg.matchState.bankruptPlayerIds || []).includes(ownerId)) {
    return { ok: false, error: 'Chủ sở hữu đã phá sản.', pkg };
  }

  const rent = computeTileRent(tile);
  if (rent <= 0) return { ok: false, error: 'Tiền thuê bằng 0.', pkg };

  const snap = createSnapshot(pkg);
  const res = applyTransfer(pkg, {
    fromId: payerPawnId,
    toId: ownerId,
    amount: rent,
    reason: `Tiền thuê tại "${tile.title || tile.id}"`,
  });
  if (!res.ok) return res;
  return { ok: true, pkg: pushUndoSnapshot(res.pkg, snap) };
}

export function upgradeHouse(
  pkg: BoardGamePackage,
  pawnId: string,
  tileId: string
): TransferResult {
  const tile = pkg.tiles.find((t) => t.id === tileId);
  if (!tile || !tile.propertyDetails) {
    return { ok: false, error: 'Ô đất không hỗ trợ nâng cấp nhà.', pkg };
  }
  const deed = findDeedForTile(pkg, tileId);
  if (deed?.card.ownerPlayerId !== pawnId) {
    return { ok: false, error: 'Bạn không phải chủ sở hữu ô đất này.', pkg };
  }
  if (tile.propertyDetails.isMortgaged) {
    return { ok: false, error: 'Không thể nâng nhà khi ô đất đang thế chấp.', pkg };
  }
  if ((tile.propertyDetails.currentHouses || 0) >= 4) {
    return { ok: false, error: 'Ô đất đã đạt cấp nhà tối đa (4 nhà).', pkg };
  }

  const cost = tile.propertyDetails.houseCost || 100000;
  const snap = createSnapshot(pkg);
  const res = applyTransfer(pkg, {
    fromId: pawnId,
    toId: 'bank',
    amount: cost,
    reason: `Nâng cấp nhà tại "${tile.title || tile.id}"`,
  });
  if (!res.ok) return res;

  const updatedTiles = res.pkg.tiles.map((t) =>
    t.id === tileId && t.propertyDetails
      ? {
          ...t,
          propertyDetails: {
            ...t.propertyDetails,
            currentHouses: (t.propertyDetails.currentHouses || 0) + 1,
          },
        }
      : t
  );

  return { ok: true, pkg: pushUndoSnapshot({ ...res.pkg, tiles: updatedTiles }, snap) };
}

export function mortgageProperty(
  pkg: BoardGamePackage,
  pawnId: string,
  tileId: string
): TransferResult {
  const tile = pkg.tiles.find((t) => t.id === tileId);
  if (!tile) return { ok: false, error: 'Không tìm thấy ô đất.', pkg };
  const deed = findDeedForTile(pkg, tileId);
  if (deed?.card.ownerPlayerId !== pawnId) {
    return { ok: false, error: 'Bạn không sở hữu ô đất này.', pkg };
  }
  if (tile.propertyDetails?.isMortgaged) {
    return { ok: false, error: 'Ô đất đã được thế chấp trước đó.', pkg };
  }

  const mortgageValue =
    tile.propertyDetails?.resellValue || Math.round((tile.price || 100000) * 0.5);
  const snap = createSnapshot(pkg);
  const res = applyTransfer(pkg, {
    fromId: 'bank',
    toId: pawnId,
    amount: mortgageValue,
    reason: `Thế chấp "${tile.title || tile.id}"`,
  });
  if (!res.ok) return res;

  const updatedTiles = res.pkg.tiles.map((t) =>
    t.id === tileId
      ? {
          ...t,
          propertyDetails: {
            baseRent: t.propertyDetails?.baseRent ?? 20000,
            houseCost: t.propertyDetails?.houseCost ?? 100000,
            rentsByLevel: t.propertyDetails?.rentsByLevel ?? [20000, 60000, 140000, 300000, 500000],
            resellValue: mortgageValue,
            currentHouses: t.propertyDetails?.currentHouses ?? 0,
            upgradeRuleText: t.propertyDetails?.upgradeRuleText,
            isMortgaged: true,
          },
        }
      : t
  );

  return { ok: true, pkg: pushUndoSnapshot({ ...res.pkg, tiles: updatedTiles }, snap) };
}

export function declareBankruptcy(
  pkg: BoardGamePackage,
  pawnId: string,
  creditorId = 'bank'
): BoardGamePackage {
  const snap = createSnapshot(pkg);
  let working = pkg;

  const remaining = calculateBalanceTotal(working.matchState.playerBalances[pawnId]);
  if (remaining > 0) {
    const res = applyTransfer(working, {
      fromId: pawnId,
      toId: creditorId,
      amount: remaining,
      reason: 'Thanh lý tài sản do phá sản',
    });
    if (res.ok) working = res.pkg;
  }

  // Thu hồi hoặc chuyển nhượng Sổ Đỏ của người phá sản
  const nextDecks = working.decks.map((d) => ({
    ...d,
    cards: d.cards.map((c) =>
      c.ownerPlayerId === pawnId
        ? { ...c, ownerPlayerId: creditorId === 'bank' ? null : creditorId }
        : c
    ),
  }));

  const bankruptSet = new Set([...(working.matchState.bankruptPlayerIds || []), pawnId]);
  const order = working.matchState.turnOrder || working.pawns.map((p) => p.id);
  const survivors = order.filter((id) => !bankruptSet.has(id));
  const winnerId = survivors.length === 1 ? survivors[0] : null;

  const nextPkg: BoardGamePackage = {
    ...working,
    decks: nextDecks,
    matchState: {
      ...working.matchState,
      bankruptPlayerIds: Array.from(bankruptSet),
      winnerId,
      isPlaying: winnerId ? false : working.matchState.isPlaying,
      turnPhase: winnerId ? 'ended' : working.matchState.turnPhase,
    },
  };

  return pushUndoSnapshot(nextPkg, snap);
}

export function endTurn(pkg: BoardGamePackage): BoardGamePackage {
  const order = pkg.matchState.turnOrder || pkg.pawns.map((p) => p.id);
  if (order.length === 0) return pkg;
  const bankruptSet = new Set(pkg.matchState.bankruptPlayerIds || []);
  const survivors = order.filter((id) => !bankruptSet.has(id));
  if (survivors.length <= 1) {
    return {
      ...pkg,
      matchState: {
        ...pkg.matchState,
        winnerId: survivors[0] || null,
        isPlaying: false,
        turnPhase: 'ended',
      },
    };
  }

  let nextIdx = ((pkg.matchState.currentTurnIndex ?? 0) + 1) % order.length;
  for (let guard = 0; guard < order.length; guard++) {
    if (!bankruptSet.has(order[nextIdx])) break;
    nextIdx = (nextIdx + 1) % order.length;
  }

  return {
    ...pkg,
    updatedAt: new Date().toISOString(),
    matchState: {
      ...pkg.matchState,
      currentTurnIndex: nextIdx,
      turnPhase: 'roll',
    },
  };
}
