'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DeskItem } from '@/types/studyspace';
import {
  BoardGamePackage,
  BoardTile,
  GameCardDeck,
  GamePawn,
  SavedDrawingAsset,
  createStarterVndBalance,
} from '@/types/boardgame';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useDeskItemInteraction } from '@/hooks/useDeskItemInteraction';
import { GameCabinetStorage } from '@/services/GameCabinetStorage';
import {
  applyTransfer,
  buyProperty,
  declareBankruptcy,
  deleteBoardTileSafe,
  endTurn,
  getActivePlayerId,
  initMatch,
  mortgageProperty,
  payRent,
  redoMatchMove,
  rollAndMove,
  undoMatchMove,
  upgradeHouse,
} from '@/lib/boardGameEngine';
import {
  BoardGameEventType,
  BoardGameRealtimeEvent,
  resolveRoomGameAction,
} from '@/hooks/useRealtimeMultiplayer';
import { BoardCanvas } from './boardgame/BoardCanvas';
import { ActionPanel } from './boardgame/ActionPanel';
import { TileFormEditorModal } from './boardgame/TileFormEditorModal';
import { DeckAndDeedModal } from './boardgame/DeckAndDeedModal';
import { CurrencyAndBankPanel } from './boardgame/CurrencyAndBankPanel';
import {
  Gamepad2,
  Play,
  Pencil,
  Landmark,
  PackageCheck,
  Layers,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

interface BoardGameArenaProps {
  item: DeskItem;
  isSelected: boolean;
}

export const BoardGameArena = React.memo(function BoardGameArena({
  item,
  isSelected,
}: BoardGameArenaProps) {
  const {
    updateBoardGame,
    removeDeskItem,
    activeTool,
    activeGamePenTool,
    setActiveGamePenTool,
    setActiveTool,
    transform,
  } = useStudySpace();

  const pkg: BoardGamePackage | undefined = item.boardGameData;
  const w = pkg?.mapConfig.width || item.width || 770;
  const h = pkg?.mapConfig.height || item.height || 770;

  const isViewer =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mode') === 'view';

  const [isEditMode, setIsEditMode] = useState(!pkg?.matchState?.isPlaying);
  const [editingTile, setEditingTile] = useState<BoardTile | null>(null);
  const [editingDeck, setEditingDeck] = useState<GameCardDeck | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const [pkgTitle, setPkgTitle] = useState(pkg?.title || 'Board Game Mới');
  const [pkgDesc, setPkgDesc] = useState(pkg?.description || '');
  const [pkgMinPlayers, setPkgMinPlayers] = useState(pkg?.minPlayers || 2);
  const [pkgMaxPlayers, setPkgMaxPlayers] = useState(pkg?.maxPlayers || 4);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [draftMousePos, setDraftMousePos] = useState<{ x: number; y: number } | null>(null);
  const [pendingFitPawnAsset, setPendingFitPawnAsset] = useState<SavedDrawingAsset | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);

  const { isDragging, handleMouseDown } = useDeskItemInteraction({
    itemId: item.id,
    itemX: item.x,
    itemY: item.y,
    rotation: item.rotation,
    width: w,
    height: h,
  });

  const showToast = useCallback((msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2600);
  }, []);

  const commitPkg = useCallback(
    (next: BoardGamePackage) => {
      updateBoardGame(item.id, {
        ...next,
        updatedAt: new Date().toISOString(),
      });
    },
    [item.id, updateBoardGame]
  );

  const isOnlineRoom =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('room');
  const isHost =
    typeof window === 'undefined'
      ? true
      : Boolean((window as unknown as { __vitudyIsHost?: boolean }).__vitudyIsHost ?? true);

  const emitRealtimeGameEvent = useCallback(
    (
      eventType: BoardGameEventType,
      actorPawnId: string,
      payload?: Record<string, unknown>,
      kind?: 'intent' | 'authoritative_state'
    ) => {
      if (!pkg || typeof window === 'undefined') return;
      const activeTurnPawnId = getActivePlayerId(pkg) || actorPawnId;
      window.dispatchEvent(
        new CustomEvent('vitudy:emit-game-event', {
          detail: {
            gameId: pkg.id,
            eventType,
            actorPawnId,
            activeTurnPawnId,
            kind,
            payload,
            timestamp: Date.now(),
          },
        })
      );
    },
    [pkg]
  );

  const commitAndSyncHost = useCallback(
    (nextPkg: BoardGamePackage) => {
      commitPkg(nextPkg);
      if (isOnlineRoom && isHost) {
        const activeTurnPawnId = getActivePlayerId(nextPkg) || nextPkg.pawns[0]?.id || 'host';
        emitRealtimeGameEvent(
          'STATE_SYNC',
          activeTurnPawnId,
          { pkg: nextPkg },
          'authoritative_state'
        );
      }
    },
    [commitPkg, isOnlineRoom, isHost, emitRealtimeGameEvent]
  );

  // Lắng nghe sự kiện từ Bảng Vẽ 4 Góc
  useEffect(() => {
    const onAddFree = (e: Event) => {
      if (!pkg) return;
      const detail = (e as CustomEvent<{ asset: SavedDrawingAsset }>).detail;
      if (!detail?.asset) return;
      e.preventDefault();
      const newPawn: GamePawn = {
        id: `pawn-${Date.now()}`,
        name: detail.asset.name || `Quân ${pkg.pawns.length + 1}`,
        drawingAssetId: detail.asset.id,
        imageUrl: detail.asset.dataUrl,
        color: '#E0562D',
        width: 48,
        height: 48,
        relX: Math.round(w / 2),
        relY: Math.round(h / 2),
        controlledByUserId: `player-${pkg.pawns.length + 1}`,
      };
      const nextBalances = { ...(pkg.matchState.playerBalances || {}) };
      if (!nextBalances[newPawn.id]) {
        nextBalances[newPawn.id] = createStarterVndBalance();
      }
      commitPkg({
        ...pkg,
        pawns: [...pkg.pawns, newPawn],
        matchState: {
          ...pkg.matchState,
          playerBalances: nextBalances,
          playerNames: {
            ...pkg.matchState.playerNames,
            [newPawn.id]: newPawn.name,
          },
        },
      });
    };

    const onStartFit = (e: Event) => {
      const detail = (e as CustomEvent<{ asset: SavedDrawingAsset }>).detail;
      if (detail?.asset) setPendingFitPawnAsset(detail.asset);
    };

    window.addEventListener('vitudy:add-pawn-to-board', onAddFree);
    window.addEventListener('vitudy:start-fit-pawn-mode', onStartFit);
    return () => {
      window.removeEventListener('vitudy:add-pawn-to-board', onAddFree);
      window.removeEventListener('vitudy:start-fit-pawn-mode', onStartFit);
    };
  }, [pkg, commitPkg, w, h]);

  // Lắng nghe sự kiện Realtime Broadcast (Host-Authoritative STATE_SYNC & Intent)
  useEffect(() => {
    if (!pkg) return;
    const executeAuthoritativeEvent = (evt: BoardGameRealtimeEvent) => {
      if (!evt || evt.gameId !== pkg.id) return;

      if (evt.eventType === 'ROLL' && Array.isArray(evt.payload?.values)) {
        const basePkg =
          typeof evt.payload?.tileId === 'string'
            ? {
                ...pkg,
                tiles: pkg.tiles.map((t) =>
                  t.id === evt.payload?.tileId && t.diceConfig
                    ? {
                        ...t,
                        diceConfig: {
                          ...t.diceConfig,
                          lastRollValues: evt.payload.values as number[],
                          rollTimestamp: Date.now(),
                        },
                      }
                    : t
                ),
              }
            : pkg;
        const res = rollAndMove(basePkg, evt.payload.values as number[]);
        commitAndSyncHost(res.pkg);
      } else if (evt.eventType === 'BUY' && typeof evt.payload?.tileId === 'string') {
        const res = buyProperty(pkg, evt.actorPawnId, evt.payload.tileId);
        if (res.ok) commitAndSyncHost(res.pkg);
      } else if (evt.eventType === 'PAY' && typeof evt.payload?.tileId === 'string') {
        const res = payRent(pkg, evt.actorPawnId, evt.payload.tileId);
        if (res.ok) commitAndSyncHost(res.pkg);
      } else if (evt.eventType === 'UPGRADE' && typeof evt.payload?.tileId === 'string') {
        const res = upgradeHouse(pkg, evt.actorPawnId, evt.payload.tileId);
        if (res.ok) commitAndSyncHost(res.pkg);
      } else if (evt.eventType === 'MORTGAGE' && typeof evt.payload?.tileId === 'string') {
        const res = mortgageProperty(pkg, evt.actorPawnId, evt.payload.tileId);
        if (res.ok) commitAndSyncHost(res.pkg);
      } else if (evt.eventType === 'BANKRUPT') {
        commitAndSyncHost(declareBankruptcy(pkg, evt.actorPawnId));
      } else if (evt.eventType === 'END_TURN') {
        commitAndSyncHost(endTurn(pkg));
      } else if (evt.eventType === 'UNDO') {
        commitAndSyncHost(undoMatchMove(pkg));
      } else if (evt.eventType === 'REDO') {
        commitAndSyncHost(redoMatchMove(pkg));
      }
    };

    const onStateSync = (e: Event) => {
      const evt = (e as CustomEvent<BoardGameRealtimeEvent>).detail;
      if (!evt || evt.gameId !== pkg.id) return;
      const syncedPkg = evt.payload?.pkg as BoardGamePackage | undefined;
      if (syncedPkg && syncedPkg.id === pkg.id) {
        commitPkg(syncedPkg);
      }
    };

    const onIntent = (e: Event) => {
      if (!isHost) return;
      const evt = (e as CustomEvent<BoardGameRealtimeEvent>).detail;
      executeAuthoritativeEvent(evt);
    };

    const onLegacyEvent = (e: Event) => {
      if (!isHost) return;
      const evt = (e as CustomEvent<BoardGameRealtimeEvent>).detail;
      executeAuthoritativeEvent(evt);
    };

    window.addEventListener('vitudy:game-state-sync', onStateSync);
    window.addEventListener('vitudy:game-intent', onIntent);
    window.addEventListener('vitudy:game-event', onLegacyEvent);
    return () => {
      window.removeEventListener('vitudy:game-state-sync', onStateSync);
      window.removeEventListener('vitudy:game-intent', onIntent);
      window.removeEventListener('vitudy:game-event', onLegacyEvent);
    };
  }, [pkg, isHost, commitPkg, commitAndSyncHost]);

  if (!pkg) return null;

  const activePlayerId = getActivePlayerId(pkg);
  const playersList =
    pkg.pawns.length > 0
      ? pkg.pawns.map((p) => ({ id: p.id, name: p.name }))
      : [
          { id: 'player-1', name: 'Người chơi 1' },
          { id: 'player-2', name: 'Người chơi 2' },
        ];

  const handleTriggerDrawDeck = useCallback(
    (tile: BoardTile) => {
      const link = pkg.links.find(
        (l) => l.sourceId === tile.id && l.linkType === 'on_step_draw_deck'
      );
      const targetDeck =
        (link ? pkg.decks.find((d) => d.id === link.targetId) : undefined) ||
        pkg.decks.find((d) => d.id === tile.deckId) ||
        pkg.decks.find((d) => d.deckType === 'draw_deck');

      if (!targetDeck || targetDeck.cards.length === 0) {
        showToast('Bộ bài trống! Hãy chuyển sang chế độ Thiết kế để thêm thẻ.');
        return;
      }

      const picked = targetDeck.cards[Math.floor(Math.random() * targetDeck.cards.length)];
      let nextPkg: BoardGamePackage = {
        ...pkg,
        matchState: {
          ...pkg.matchState,
          lastDrawnCard: {
            deckId: targetDeck.id,
            deckName: targetDeck.name,
            card: picked,
            drawnAt: Date.now(),
          },
        },
      };

      const actorId = activePlayerId || pkg.pawns[0]?.id;
      if (actorId && picked.effect?.type === 'money_delta' && picked.effect.value) {
        const val = picked.effect.value;
        const res = applyTransfer(nextPkg, {
          fromId: val > 0 ? 'bank' : actorId,
          toId: val > 0 ? actorId : 'bank',
          amount: Math.abs(val),
          reason: `Rút thẻ "${picked.title}"`,
        });
        if (res.ok) nextPkg = res.pkg;
      }

      commitPkg(nextPkg);
    },
    [pkg, activePlayerId, commitPkg, showToast]
  );

  const handleTileClick = useCallback(
    (e: React.MouseEvent, tile: BoardTile) => {
      e.stopPropagation();

      if (pendingFitPawnAsset) {
        const fitSize = Math.max(24, Math.min(tile.width, tile.height) - 10);
        const newPawn: GamePawn = {
          id: `pawn-${Date.now()}`,
          name: pendingFitPawnAsset.name || `Quân ${pkg.pawns.length + 1}`,
          drawingAssetId: pendingFitPawnAsset.id,
          imageUrl: pendingFitPawnAsset.dataUrl,
          color: '#E0562D',
          width: fitSize,
          height: fitSize,
          relX: Math.round(tile.relX + tile.width / 2),
          relY: Math.round(tile.relY + tile.height / 2),
          currentTileId: tile.id,
        };
        const nextBalances = { ...(pkg.matchState.playerBalances || {}) };
        if (!nextBalances[newPawn.id]) {
          nextBalances[newPawn.id] = createStarterVndBalance();
        }
        commitPkg({
          ...pkg,
          pawns: [...pkg.pawns, newPawn],
          matchState: {
            ...pkg.matchState,
            playerBalances: nextBalances,
            playerNames: { ...pkg.matchState.playerNames, [newPawn.id]: newPawn.name },
          },
        });
        setPendingFitPawnAsset(null);
        showToast(`Đã đặt quân cờ vừa khít ô "${tile.title || tile.id}"!`);
        return;
      }

      if (activeTool === 'game_pen' && activeGamePenTool === 'connect_nodes') {
        if (!connectSourceId) {
          setConnectSourceId(tile.id);
        } else if (connectSourceId !== tile.id) {
          const linkType = tile.role === 'external_info' ? 'on_step_show_info' : 'on_step_draw_deck';
          commitPkg({
            ...pkg,
            links: [
              ...pkg.links,
              { id: `link-${Date.now()}`, sourceId: connectSourceId, targetId: tile.id, linkType },
            ],
          });
          setConnectSourceId(null);
          setDraftMousePos(null);
          showToast('Đã nối dây kích hoạt thành công!');
        } else {
          setConnectSourceId(null);
        }
        return;
      }

      if (isEditMode) {
        setEditingTile(tile);
      }
    },
    [pendingFitPawnAsset, pkg, activeTool, activeGamePenTool, connectSourceId, isEditMode, commitPkg, showToast]
  );

  const handleDeleteTile = useCallback(
    (tileId: string) => {
      commitPkg(deleteBoardTileSafe(pkg, tileId));
    },
    [pkg, commitPkg]
  );

  const handleRollComplete = useCallback(
    (tileId: string, values: number[], total: number) => {
      if (isViewer) return;
      const updatedTilesPkg: BoardGamePackage = {
        ...pkg,
        tiles: pkg.tiles.map((t) =>
          t.id === tileId && t.diceConfig
            ? { ...t, diceConfig: { ...t.diceConfig, lastRollValues: values, rollTimestamp: Date.now() } }
            : t
        ),
      };

      if (isEditMode || pkg.pawns.length === 0) {
        commitPkg(updatedTilesPkg);
        showToast(`Tung thử được ${total} điểm (${values.join(' + ')})`);
        return;
      }

      const activeId = getActivePlayerId(updatedTilesPkg) || updatedTilesPkg.pawns[0]?.id || 'player-1';
      const decision = resolveRoomGameAction({
        isOnline: isOnlineRoom,
        isHost,
        isViewer,
        actorPawnId: activeId,
        activeTurnPawnId: activeId,
      });
      if (decision === 'reject') {
        showToast('Chế độ xem không thể tung xúc xắc.');
        return;
      }
      if (decision === 'send_intent') {
        emitRealtimeGameEvent('ROLL', activeId, { tileId, values, total }, 'intent');
        showToast(`Đã gửi lượt tung (${total} điểm) tới chủ phòng.`);
        return;
      }

      const res = rollAndMove(updatedTilesPkg, values);
      commitAndSyncHost(res.pkg);
      if (res.events.length > 0) {
        showToast(res.events[res.events.length - 1]);
      }
    },
    [isViewer, isOnlineRoom, isHost, pkg, isEditMode, commitPkg, commitAndSyncHost, emitRealtimeGameEvent, showToast]
  );

  const handleStartDragPawn = useCallback(
    (e: React.PointerEvent, pawn: GamePawn) => {
      e.stopPropagation();
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const origX = pawn.relX;
      const origY = pawn.relY;
      const scale = transform.scale || 1;

      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startClientX) / scale;
        const dy = (ev.clientY - startClientY) / scale;
        commitPkg({
          ...pkg,
          pawns: pkg.pawns.map((p) =>
            p.id === pawn.id ? { ...p, relX: Math.round(origX + dx), relY: Math.round(origY + dy) } : p
          ),
        });
      };

      const onUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        const dx = (ev.clientX - startClientX) / scale;
        const dy = (ev.clientY - startClientY) / scale;
        const cx = origX + dx;
        const cy = origY + dy;

        const landedTile = pkg.tiles.find(
          (t) =>
            t.role !== 'external_info' &&
            t.role !== 'bank_zone' &&
            t.role !== 'dice_drop_zone' &&
            cx >= t.relX &&
            cx <= t.relX + t.width &&
            cy >= t.relY &&
            cy <= t.relY + t.height
        );

        const triggeredIds = landedTile
          ? pkg.links
              .filter((l) => l.sourceId === landedTile.id && l.linkType === 'on_step_show_info')
              .map((l) => l.targetId)
          : [];

        commitPkg({
          ...pkg,
          pawns: pkg.pawns.map((p) =>
            p.id === pawn.id
              ? {
                  ...p,
                  relX: Math.round(origX + dx),
                  relY: Math.round(origY + dy),
                  currentTileId: landedTile ? landedTile.id : null,
                }
              : p
          ),
          matchState: {
            ...pkg.matchState,
            activeTriggeredInfoTileIds: triggeredIds,
          },
        });
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [pkg, transform.scale, commitPkg]
  );

  const handleArenaClick = (e: React.MouseEvent) => {
    if (activeTool !== 'game_pen' || !arenaRef.current) return;
    if (
      activeGamePenTool === 'select' ||
      activeGamePenTool === 'connect_nodes' ||
      activeGamePenTool === 'create_map'
    ) {
      return;
    }

    e.stopPropagation();
    const rect = arenaRef.current.getBoundingClientRect();
    const scale = transform.scale || 1;
    const relX = Math.round((e.clientX - rect.left) / scale);
    const relY = Math.round((e.clientY - rect.top) / scale);

    if (activeGamePenTool === 'create_tile') {
      const tileW = pkg.mapConfig.tileSize || 70;
      const newTile: BoardTile = {
        id: `tile-custom-${Date.now()}`,
        role: 'normal_cell',
        shape: 'square',
        relX: relX - Math.round(tileW / 2),
        relY: relY - Math.round(tileW / 2),
        width: tileW,
        height: tileW,
        hasFunction: true,
        title: 'Ô mới',
        price: 100000,
        form: {
          hasHeader: true,
          headerBgColor: '#E0562D',
          hasBodyImage: false,
          hasFooterPrice: true,
          borderStyle: 'solid',
        },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newTile] });
      setActiveGamePenTool('select');
    } else if (activeGamePenTool === 'create_dice') {
      const newDice: BoardTile = {
        id: `dice-${Date.now()}`,
        role: 'dice_drop_zone',
        shape: 'circle',
        relX: relX - 70,
        relY: relY - 70,
        width: 140,
        height: 140,
        hasFunction: true,
        title: 'Ô Thả Xúc Xắc',
        diceConfig: { diceCount: 2 },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newDice] });
      setActiveGamePenTool('select');
    } else if (activeGamePenTool === 'create_draw_tile') {
      const tileW = pkg.mapConfig.tileSize || 70;
      const newTile: BoardTile = {
        id: `draw-tile-${Date.now()}`,
        role: 'draw_card_tile',
        shape: 'square',
        relX: relX - Math.round(tileW / 2),
        relY: relY - Math.round(tileW / 2),
        width: tileW,
        height: tileW,
        hasFunction: true,
        title: pkg.decks.length % 2 === 0 ? 'Cơ hội' : 'Khí vận',
        form: {
          hasHeader: true,
          headerBgColor: '#9333ea',
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'solid',
        },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newTile] });
      setActiveGamePenTool('select');
    } else if (activeGamePenTool === 'create_external_info') {
      const newInfo: BoardTile = {
        id: `ext-info-${Date.now()}`,
        role: 'external_info',
        shape: 'rect',
        relX: relX - 95,
        relY: relY - 60,
        width: 190,
        height: 120,
        hasFunction: true,
        title: 'Bảng thông tin đất',
        propertyDetails: {
          baseRent: 20000,
          houseCost: 100000,
          rentsByLevel: [20000, 60000, 140000, 300000, 500000],
          resellValue: 80000,
          currentHouses: 0,
        },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newInfo] });
      setActiveGamePenTool('select');
    } else if (activeGamePenTool === 'create_bank') {
      const bankTile: BoardTile = {
        id: `bank-${Date.now()}`,
        role: 'bank_zone',
        shape: 'rect',
        relX: relX - 110,
        relY: relY - 55,
        width: 220,
        height: 110,
        hasFunction: true,
        title: 'NGÂN HÀNG TRUNG TÂM',
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, bankTile] });
      setActiveGamePenTool('select');
    } else if (activeGamePenTool === 'create_deck') {
      const deckIdx = pkg.decks.length + 1;
      const newDeck: GameCardDeck = {
        id: `deck-${Date.now()}`,
        name: deckIdx === 1 ? 'Cơ hội' : deckIdx === 2 ? 'Khí vận' : `Bộ thẻ ${deckIdx}`,
        deckType: 'draw_deck',
        color: deckIdx % 2 === 1 ? '#E0562D' : '#2563eb',
        relX: relX - 50,
        relY: relY - 36,
        width: 100,
        height: 72,
        cards: [],
      };
      commitPkg({ ...pkg, decks: [...pkg.decks, newDeck] });
      setEditingDeck(newDeck);
      setActiveGamePenTool('select');
    } else if (activeGamePenTool === 'place_pawn') {
      const idx = pkg.pawns.length + 1;
      const colors = ['#E0562D', '#2563eb', '#16a34a', '#9333ea'];
      const newPawn: GamePawn = {
        id: `pawn-${Date.now()}`,
        name: `Người chơi ${idx}`,
        imageUrl: '',
        color: colors[(idx - 1) % colors.length],
        width: 34,
        height: 34,
        relX,
        relY,
      };
      const nextBalances = { ...(pkg.matchState.playerBalances || {}) };
      if (!nextBalances[newPawn.id]) nextBalances[newPawn.id] = createStarterVndBalance();
      commitPkg({
        ...pkg,
        pawns: [...pkg.pawns, newPawn],
        matchState: {
          ...pkg.matchState,
          playerBalances: nextBalances,
          playerNames: { ...pkg.matchState.playerNames, [newPawn.id]: newPawn.name },
        },
      });
      setActiveGamePenTool('select');
    }
  };

  const handleSaveToCabinet = async () => {
    const finalPkg: BoardGamePackage = {
      ...pkg,
      title: pkgTitle.trim() || pkg.title,
      description: pkgDesc.trim(),
      minPlayers: pkgMinPlayers,
      maxPlayers: pkgMaxPlayers,
      updatedAt: new Date().toISOString(),
    };
    commitPkg(finalPkg);
    const res = await GameCabinetStorage.saveGame(finalPkg);
    setIsPackageModalOpen(false);
    if (!res.ok) {
      showToast(res.error || 'Lỗi lưu Tủ Game!');
      return;
    }
    showToast(`Đã đóng gói "${finalPkg.title}" vào Tủ Game cá nhân!`);
  };

  const handleTogglePlayMode = () => {
    if (isEditMode) {
      const started = pkg.matchState.isPlaying ? pkg : initMatch(pkg);
      commitPkg(started);
      setIsEditMode(false);
      setActiveTool('cursor');
    } else {
      setIsEditMode(true);
    }
  };

  const normalTilesCount = pkg.tiles.filter((t) => t.role === 'normal_cell').length;

  return (
    <div
      ref={arenaRef}
      data-desk-item="true"
      onMouseDown={handleMouseDown}
      onClick={handleArenaClick}
      onMouseMove={(e) => {
        if (connectSourceId && arenaRef.current) {
          const rect = arenaRef.current.getBoundingClientRect();
          const scale = transform.scale || 1;
          setDraftMousePos({
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale,
          });
        }
      }}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: w,
        height: h,
        zIndex: item.zIndex,
        transform: `rotate(${item.rotation}deg)`,
        cursor: pendingFitPawnAsset ? 'crosshair' : isDragging ? 'grabbing' : 'default',
      }}
      className={`rounded-2xl bg-slate-50/90 border-2 shadow-xl transition-shadow select-none ${
        isSelected ? 'border-[#E0562D] ring-4 ring-[#E0562D]/15' : 'border-slate-300'
      }`}
    >
      {/* THANH ĐIỀU KHIỂN ĐỈNH BÀN CỜ */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="interactive-control absolute -top-11 left-0 right-0 flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-md"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Gamepad2 className="w-4 h-4 text-[#E0562D] shrink-0" />
          <span className="text-xs font-black text-slate-900 truncate">{pkg.title}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
            {pkg.mapConfig.rows}×{pkg.mapConfig.cols}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlayMode}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              isEditMode
                ? 'bg-[#E0562D] text-white hover:bg-[#c9451e]'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isEditMode ? <Play className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
            <span>{isEditMode ? 'Chơi ngay' : 'Thiết kế'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBankOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Landmark className="w-3 h-3 text-[#E0562D]" />
            <span>Ngân hàng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPkgTitle(pkg.title);
              setPkgDesc(pkg.description);
              setIsPackageModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#9A3412] border border-[#FFEDD5] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <PackageCheck className="w-3 h-3" />
            <span>Đóng gói</span>
          </button>

          {!isViewer && (
            <button
              type="button"
              title="Xóa bàn cờ"
              onClick={() => removeDeskItem(item.id)}
              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BẢN ĐỒ, Ô CỜ, XÚC XẮC & QUÂN CỜ */}
      <BoardCanvas
        pkg={pkg}
        boardX={item.x}
        boardY={item.y}
        transform={transform}
        isEditMode={isEditMode}
        connectSourceId={connectSourceId}
        draftMousePos={draftMousePos}
        canConnect={activeTool === 'game_pen' && activeGamePenTool === 'connect_nodes'}
        activePlayerId={activePlayerId}
        canDragPawns={isEditMode || Boolean(pkg.matchState.freeDragMode)}
        onTileClick={handleTileClick}
        onDeleteTile={handleDeleteTile}
        onTriggerDrawDeck={handleTriggerDrawDeck}
        onOpenBank={() => setIsBankOpen(true)}
        onRollComplete={handleRollComplete}
        onStartDragPawn={handleStartDragPawn}
      />

      {/* CÁC BỘ THẺ / SỔ ĐỎ */}
      {pkg.decks.map((deck) => (
        <div
          key={deck.id}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (activeTool === 'game_pen' && activeGamePenTool === 'connect_nodes' && connectSourceId) {
              commitPkg({
                ...pkg,
                links: [
                  ...pkg.links,
                  {
                    id: `link-${Date.now()}`,
                    sourceId: connectSourceId,
                    targetId: deck.id,
                    linkType: 'on_step_draw_deck',
                  },
                ],
              });
              setConnectSourceId(null);
              setDraftMousePos(null);
              showToast(`Đã kết nối tới bộ bài "${deck.name}"!`);
              return;
            }
            setEditingDeck(deck);
          }}
          style={{
            position: 'absolute',
            left: deck.relX,
            top: deck.relY,
            width: deck.width,
            height: deck.height,
            borderColor: deck.color,
          }}
          className="interactive-control rounded-xl bg-white border-2 shadow-md p-2 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-transform z-20"
        >
          <div className="flex items-center justify-between gap-1">
            <Layers className="w-3.5 h-3.5" style={{ color: deck.color }} />
            <span className="text-[10px] font-bold text-slate-500">{deck.cards.length} thẻ</span>
          </div>
          <div className="text-[11px] font-black text-slate-900 truncate">{deck.name}</div>
          <div className="text-[9px] font-bold" style={{ color: deck.color }}>
            {deck.deckType === 'title_deeds' ? 'Quản lý Sổ Đỏ' : 'Mở bộ thẻ'}
          </div>
        </div>
      ))}

      {/* THANH HÀNH ĐỘNG CHƠI GAME */}
      {!isEditMode && (
        <ActionPanel
          pkg={pkg}
          isViewer={isViewer}
          onBuyProperty={(pawnId, tileId) => {
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: pawnId,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Chưa tới lượt hoặc bạn đang ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('BUY', pawnId, { tileId }, 'intent');
              return showToast('Đã gửi yêu cầu mua đất tới chủ phòng...');
            }
            const res = buyProperty(pkg, pawnId, tileId);
            if (!res.ok) return showToast(res.error || 'Không thể mua ô này.');
            commitAndSyncHost(res.pkg);
            showToast('Mua đất thành công!');
          }}
          onPayRent={(pawnId, tileId) => {
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: pawnId,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Chưa tới lượt hoặc bạn đang ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('PAY', pawnId, { tileId }, 'intent');
              return showToast('Đã gửi yêu cầu trả thuê tới chủ phòng...');
            }
            const res = payRent(pkg, pawnId, tileId);
            if (!res.ok) return showToast(res.error || 'Không thể trả tiền thuê.');
            commitAndSyncHost(res.pkg);
            showToast('Đã thanh toán tiền thuê!');
          }}
          onUpgradeHouse={(pawnId, tileId) => {
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: pawnId,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Chưa tới lượt hoặc bạn đang ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('UPGRADE', pawnId, { tileId }, 'intent');
              return showToast('Đã gửi yêu cầu nâng nhà tới chủ phòng...');
            }
            const res = upgradeHouse(pkg, pawnId, tileId);
            if (!res.ok) return showToast(res.error || 'Không thể nâng nhà.');
            commitAndSyncHost(res.pkg);
            showToast('Đã nâng cấp thêm 1 nhà!');
          }}
          onMortgageProperty={(pawnId, tileId) => {
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: pawnId,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Chưa tới lượt hoặc bạn đang ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('MORTGAGE', pawnId, { tileId }, 'intent');
              return showToast('Đã gửi yêu cầu thế chấp tới chủ phòng...');
            }
            const res = mortgageProperty(pkg, pawnId, tileId);
            if (!res.ok) return showToast(res.error || 'Không thể thế chấp.');
            commitAndSyncHost(res.pkg);
            showToast('Đã thế chấp ô đất nhận tiền mặt!');
          }}
          onDeclareBankruptcy={(pawnId) => {
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: pawnId,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Chưa tới lượt hoặc bạn đang ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('BANKRUPT', pawnId, undefined, 'intent');
              return showToast('Đã gửi yêu cầu phá sản tới chủ phòng...');
            }
            commitAndSyncHost(declareBankruptcy(pkg, pawnId));
            showToast('Người chơi đã tuyên bố phá sản.');
          }}
          onEndTurn={() => {
            const actor = activePlayerId || pkg.pawns[0]?.id || 'player-1';
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: actor,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Chưa tới lượt hoặc bạn đang ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('END_TURN', actor, undefined, 'intent');
              return;
            }
            commitAndSyncHost(endTurn(pkg));
          }}
          onUndoMove={() => {
            const actor = activePlayerId || pkg.pawns[0]?.id || 'host';
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: actor,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Không thể hoàn tác ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('UNDO', actor, undefined, 'intent');
              return showToast('Đã gửi yêu cầu hoàn tác tới chủ phòng...');
            }
            commitAndSyncHost(undoMatchMove(pkg));
          }}
          onRedoMove={() => {
            const actor = activePlayerId || pkg.pawns[0]?.id || 'host';
            const decision = resolveRoomGameAction({
              isOnline: isOnlineRoom,
              isHost,
              isViewer,
              actorPawnId: actor,
              activeTurnPawnId: activePlayerId,
            });
            if (decision === 'reject') return showToast('Không thể làm lại ở chế độ xem.');
            if (decision === 'send_intent') {
              emitRealtimeGameEvent('REDO', actor, undefined, 'intent');
              return showToast('Đã gửi yêu cầu làm lại tới chủ phòng...');
            }
            commitAndSyncHost(redoMatchMove(pkg));
          }}
          onToggleFreeDrag={() =>
            commitPkg({
              ...pkg,
              matchState: {
                ...pkg.matchState,
                freeDragMode: !pkg.matchState.freeDragMode,
              },
            })
          }
        />
      )}

      {/* THẺ BÀI VỪA RÚT */}
      {pkg.matchState?.lastDrawnCard && !isEditMode && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="interactive-control absolute top-4 left-1/2 -translate-x-1/2 z-40 w-72 bg-white border-2 border-[#E0562D] rounded-2xl shadow-2xl p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#E0562D] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {pkg.matchState.lastDrawnCard.deckName}
            </span>
            <button
              type="button"
              onClick={() =>
                commitPkg({ ...pkg, matchState: { ...pkg.matchState, lastDrawnCard: null } })
              }
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-sm font-black text-slate-900 mt-1">
            {pkg.matchState.lastDrawnCard.card.title}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {pkg.matchState.lastDrawnCard.card.description}
          </p>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {savedToast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg whitespace-nowrap">
          {savedToast}
        </div>
      )}

      {/* MODALS */}
      <TileFormEditorModal
        isOpen={Boolean(editingTile)}
        tile={editingTile}
        totalNormalTilesCount={normalTilesCount}
        onClose={() => setEditingTile(null)}
        onSaveTile={(updatedTile) => {
          commitPkg({
            ...pkg,
            tiles: pkg.tiles.map((t) => (t.id === updatedTile.id ? updatedTile : t)),
          });
        }}
        onApplyFormToAll={(formTemplate) => {
          commitPkg({
            ...pkg,
            tiles: pkg.tiles.map((t) =>
              t.role === 'normal_cell' ? { ...t, form: { ...formTemplate } } : t
            ),
          });
          showToast('Đã áp dụng mẫu form lên toàn bộ ô cờ!');
        }}
        onAiFillAllTiles={(aiItems) => {
          let i = 0;
          commitPkg({
            ...pkg,
            tiles: pkg.tiles.map((t) => {
              if (t.role !== 'normal_cell') return t;
              const info = aiItems[i % aiItems.length];
              i++;
              return {
                ...t,
                title: info.title,
                price: info.price,
                hasFunction: true,
                form: {
                  hasHeader: true,
                  headerBgColor: info.headerColor,
                  hasBodyImage: Boolean(t.form?.hasBodyImage),
                  hasFooterPrice: true,
                  borderStyle: t.form?.borderStyle || 'solid',
                },
                propertyDetails: {
                  baseRent: info.baseRent,
                  houseCost: info.houseCost,
                  rentsByLevel: [
                    info.baseRent,
                    info.baseRent * 3,
                    info.baseRent * 7,
                    info.baseRent * 15,
                    info.baseRent * 25,
                  ],
                  resellValue: Math.round(info.price * 0.5),
                  currentHouses: 0,
                },
              };
            }),
          });
          showToast('AI đã thiết kế toàn bộ ô đất cho bàn cờ!');
        }}
      />

      <DeckAndDeedModal
        isOpen={Boolean(editingDeck)}
        deck={editingDeck}
        boardTiles={pkg.tiles}
        playerIds={playersList}
        onClose={() => setEditingDeck(null)}
        onUpdateDeck={(updatedDeck) => {
          commitPkg({
            ...pkg,
            decks: pkg.decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)),
          });
          setEditingDeck(updatedDeck);
        }}
        onAutoGenerateDeeds={() => {
          if (!editingDeck) return;
          const deckId = editingDeck.id;
          const propertyTiles = pkg.tiles.filter(
            (t) => t.role === 'normal_cell' && t.hasFunction && t.price
          );
          const deedCards = propertyTiles.map((t, idx) => ({
            id: `deed-auto-${t.id}-${idx}`,
            title: `Sổ Đỏ: ${t.title || `Ô ${idx + 1}`}`,
            description: `Giá trị ${(t.price || 0).toLocaleString('vi-VN')}đ`,
            linkedTileId: t.id,
            ownerPlayerId: null,
          }));
          commitPkg({
            ...pkg,
            decks: pkg.decks.map((d) => (d.id === deckId ? { ...d, cards: deedCards } : d)),
          });
          showToast(`Đã sinh ${deedCards.length} Sổ Đỏ liên kết ô đất!`);
        }}
      />

      <CurrencyAndBankPanel
        isOpen={isBankOpen}
        pkg={pkg}
        players={playersList}
        onClose={() => setIsBankOpen(false)}
        onUpdatePackage={commitPkg}
      />

      {isPackageModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9995] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Đóng gói Board Game</span>
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tên trò chơi</label>
                  <input
                    type="text"
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#E0562D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Mô tả luật chơi</label>
                  <textarea
                    value={pkgDesc}
                    onChange={(e) => setPkgDesc(e.target.value)}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#E0562D]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Tối thiểu</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={pkgMinPlayers}
                      onChange={(e) => setPkgMinPlayers(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Tối đa</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={pkgMaxPlayers}
                      onChange={(e) => setPkgMaxPlayers(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveToCabinet}
                  className="px-4 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold cursor-pointer"
                >
                  Lưu vào Tủ Game
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
});
