'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DeskItem } from '@/types/studyspace';
import {
  BoardGamePackage,
  BoardTile,
  GameCardDeck,
  GamePawn,
  SavedDrawingAsset,
  breakAmountIntoVndNotes,
  calculateBalanceTotal,
  createStarterVndBalance,
} from '@/types/boardgame';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useDeskItemInteraction } from '@/hooks/useDeskItemInteraction';
import { GameCabinetStorage } from '@/services/GameCabinetStorage';
import { TopDownDice3D } from './boardgame/TopDownDice3D';
import { GameLinkLayer } from './boardgame/GameLinkLayer';
import { TileFormEditorModal } from './boardgame/TileFormEditorModal';
import { DeckAndDeedModal } from './boardgame/DeckAndDeedModal';
import { CurrencyAndBankPanel } from './boardgame/CurrencyAndBankPanel';
import {
  Gamepad2,
  Play,
  Pencil,
  Landmark,
  PackageCheck,
  Dices,
  Layers,
  Link2,
  Plus,
  Trash2,
  X,
  ShieldCheck,
  Sparkles,
  Home,
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

  const [isEditMode, setIsEditMode] = useState(!pkg?.matchState?.isPlaying);
  const [editingTile, setEditingTile] = useState<BoardTile | null>(null);
  const [editingDeck, setEditingDeck] = useState<GameCardDeck | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // State đóng gói game
  const [pkgTitle, setPkgTitle] = useState(pkg?.title || 'Board Game Mới');
  const [pkgDesc, setPkgDesc] = useState(pkg?.description || '');
  const [pkgMinPlayers, setPkgMinPlayers] = useState(pkg?.minPlayers || 2);
  const [pkgMaxPlayers, setPkgMaxPlayers] = useState(pkg?.maxPlayers || 4);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // State kéo dây kết nối (Visual Connector)
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [draftMousePos, setDraftMousePos] = useState<{ x: number; y: number } | null>(null);

  // State chờ bấm ô để khớp quân cờ từ Bảng Vẽ 4 Góc
  const [pendingFitPawnAsset, setPendingFitPawnAsset] = useState<SavedDrawingAsset | null>(null);

  // State chọn ô thông tin đang bật (khi quân cờ đứng lên hoặc khi bấm xem)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('player-1');

  const arenaRef = useRef<HTMLDivElement>(null);

  const { isDragging, handleMouseDown } = useDeskItemInteraction({
    itemId: item.id,
    itemX: item.x,
    itemY: item.y,
    rotation: item.rotation,
    width: w,
    height: h,
  });

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
        relX: Math.round(w / 2 - 24),
        relY: Math.round(h / 2 - 24),
        controlledByUserId: `player-${pkg.pawns.length + 1}`,
      };
      const nextBalances = { ...(pkg.matchState.playerBalances || {}) };
      const pid = newPawn.controlledByUserId!;
      if (!nextBalances[pid]) {
        nextBalances[pid] = createStarterVndBalance();
      }
      updateBoardGame(item.id, {
        ...pkg,
        pawns: [...pkg.pawns, newPawn],
        matchState: {
          ...pkg.matchState,
          playerBalances: nextBalances,
          playerNames: {
            ...pkg.matchState.playerNames,
            [pid]: newPawn.name,
          },
        },
      });
    };

    const onStartFit = (e: Event) => {
      const detail = (e as CustomEvent<{ asset: SavedDrawingAsset }>).detail;
      if (detail?.asset) {
        setPendingFitPawnAsset(detail.asset);
      }
    };

    window.addEventListener('vitudy:add-pawn-to-board', onAddFree);
    window.addEventListener('vitudy:start-fit-pawn-mode', onStartFit);
    return () => {
      window.removeEventListener('vitudy:add-pawn-to-board', onAddFree);
      window.removeEventListener('vitudy:start-fit-pawn-mode', onStartFit);
    };
  }, [pkg, item.id, updateBoardGame, w, h]);

  if (!pkg) return null;

  const playersList =
    pkg.pawns.length > 0
      ? pkg.pawns.map((p, i) => ({
          id: p.controlledByUserId || `player-${i + 1}`,
          name: p.name,
        }))
      : [
          { id: 'player-1', name: 'Người chơi 1' },
          { id: 'player-2', name: 'Người chơi 2' },
        ];

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 2600);
  };

  // Helper cập nhật package
  const commitPkg = (next: BoardGamePackage) => {
    updateBoardGame(item.id, {
      ...next,
      updatedAt: new Date().toISOString(),
    });
  };

  // Xử lý khi click vào 1 ô trên bàn cờ
  const handleTileClick = (tile: BoardTile, e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Nếu đang ở chế độ Khớp Quân Cờ từ Bảng Vẽ 4 Góc
    if (pendingFitPawnAsset) {
      const fitSize = Math.round(Math.min(tile.width, tile.height) * 0.82);
      const pid = `player-${pkg.pawns.length + 1}`;
      const newPawn: GamePawn = {
        id: `pawn-${Date.now()}`,
        name: pendingFitPawnAsset.name || `Quân ${pkg.pawns.length + 1}`,
        drawingAssetId: pendingFitPawnAsset.id,
        imageUrl: pendingFitPawnAsset.dataUrl,
        color: '#E0562D',
        width: fitSize,
        height: fitSize,
        relX: Math.round(tile.relX + (tile.width - fitSize) / 2),
        relY: Math.round(tile.relY + (tile.height - fitSize) / 2),
        currentTileId: tile.id,
        controlledByUserId: pid,
      };
      const nextBalances = { ...(pkg.matchState.playerBalances || {}) };
      if (!nextBalances[pid]) nextBalances[pid] = createStarterVndBalance();

      commitPkg({
        ...pkg,
        pawns: [...pkg.pawns, newPawn],
        matchState: {
          ...pkg.matchState,
          playerBalances: nextBalances,
          playerNames: { ...pkg.matchState.playerNames, [pid]: newPawn.name },
        },
      });
      setPendingFitPawnAsset(null);
      showToast(`Đã đặt quân cờ "${newPawn.name}" vừa khít vào ô!`);
      return;
    }

    // 2. Nếu đang dùng công cụ Kéo dây kết nối
    if (activeTool === 'game_pen' && activeGamePenTool === 'connect_nodes') {
      if (!connectSourceId) {
        setConnectSourceId(tile.id);
        return;
      }
      if (connectSourceId !== tile.id) {
        const linkType =
          tile.role === 'external_info' ? 'on_step_show_info' : 'on_step_draw_deck';
        const newLink = {
          id: `link-${Date.now()}`,
          sourceId: connectSourceId,
          targetId: tile.id,
          linkType: linkType as 'on_step_show_info' | 'on_step_draw_deck',
        };
        commitPkg({ ...pkg, links: [...pkg.links, newLink] });
        setConnectSourceId(null);
        setDraftMousePos(null);
        showToast('Đã kết nối sự kiện giữa 2 ô!');
        return;
      }
    }

    // 3. Nếu click vào Ô Ngân Hàng -> Mở Quầy Ngân Hàng & Tiền VNĐ
    if (tile.role === 'bank_zone') {
      setIsBankOpen(true);
      return;
    }

    // 4. Trong chế độ Thiết kế -> Mở chỉnh sửa form ô
    if (isEditMode && tile.role !== 'dice_drop_zone') {
      setEditingTile(tile);
    }
  };

  // Kéo thả quân cờ trên bàn cờ & tự động kích hoạt ô đứng lên
  const handlePawnPointerDown = (pawn: GamePawn, e: React.PointerEvent) => {
    e.stopPropagation();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const origX = pawn.relX;
    const origY = pawn.relY;
    const scale = transform.scale || 1;

    if (pawn.controlledByUserId) {
      setSelectedPlayerId(pawn.controlledByUserId);
    }

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startClientX) / scale;
      const dy = (ev.clientY - startClientY) / scale;
      const nx = Math.round(origX + dx);
      const ny = Math.round(origY + dy);

      updateBoardGame(item.id, {
        ...pkg,
        pawns: pkg.pawns.map((p) => (p.id === pawn.id ? { ...p, relX: nx, relY: ny } : p)),
      });
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);

      const dx = (ev.clientX - startClientX) / scale;
      const dy = (ev.clientY - startClientY) / scale;
      const cx = origX + dx + pawn.width / 2;
      const cy = origY + dy + pawn.height / 2;

      // Tìm ô nằm dưới tâm quân cờ
      const landedTile = pkg.tiles.find(
        (t) =>
          (t.role === 'normal_cell' || t.role === 'draw_card_tile') &&
          cx >= t.relX &&
          cx <= t.relX + t.width &&
          cy >= t.relY &&
          cy <= t.relY + t.height
      );

      let triggeredIds: string[] = [];
      let nextCardDraw = pkg.matchState.lastDrawnCard;
      let nextBalances = { ...pkg.matchState.playerBalances };
      let nextLogs = [...(pkg.matchState.logs || [])];

      if (landedTile) {
        // Kiểm tra kết nối tới Ô thông tin ngoài map
        const infoLinks = pkg.links.filter(
          (l) => l.sourceId === landedTile.id && l.linkType === 'on_step_show_info'
        );
        triggeredIds = infoLinks.map((l) => l.targetId);

        // Kiểm tra kết nối tới Bộ thẻ rút (Cơ hội / Khí vận)
        const deckLink = pkg.links.find(
          (l) => l.sourceId === landedTile.id && l.linkType === 'on_step_draw_deck'
        );
        if (deckLink) {
          const targetDeck = pkg.decks.find((d) => d.id === deckLink.targetId);
          if (targetDeck && targetDeck.cards.length > 0) {
            const picked = targetDeck.cards[Math.floor(Math.random() * targetDeck.cards.length)];
            nextCardDraw = {
              deckId: targetDeck.id,
              deckName: targetDeck.name,
              card: picked,
              drawnAt: Date.now(),
            };
            const pid = pawn.controlledByUserId || 'player-1';
            if (picked.effect?.type === 'money_delta' && picked.effect.value) {
              const cur = calculateBalanceTotal(nextBalances[pid]);
              const nextAmt = Math.max(0, cur + picked.effect.value);
              nextBalances[pid] = breakAmountIntoVndNotes(nextAmt);
              nextLogs = [
                {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString('vi-VN'),
                  message: `${pawn.name} rút "${picked.title}" (${picked.effect.value > 0 ? '+' : ''}${picked.effect.value.toLocaleString('vi-VN')}đ).`,
                },
                ...nextLogs,
              ].slice(0, 30);
            }
          }
        }
      }

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
          playerBalances: nextBalances,
          activeTriggeredInfoTileIds: triggeredIds,
          lastDrawnCard: nextCardDraw,
          logs: nextLogs,
        },
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Kéo thả các thành phần bên trong Map (Ô ngoài map, Bộ bài, Ô xúc xắc, Ngân hàng) trong Edit Mode
  const handleSubItemDrag = (
    kind: 'tile' | 'deck',
    targetId: string,
    origX: number,
    origY: number,
    e: React.MouseEvent
  ) => {
    if (!isEditMode) return;
    if (activeTool === 'game_pen' && activeGamePenTool === 'connect_nodes') return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const scale = transform.scale || 1;
    let moved = false;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      if (!moved) return;

      const nx = Math.round(origX + dx);
      const ny = Math.round(origY + dy);

      if (kind === 'tile') {
        updateBoardGame(item.id, {
          ...pkg,
          tiles: pkg.tiles.map((t) => (t.id === targetId ? { ...t, relX: nx, relY: ny } : t)),
        });
      } else {
        updateBoardGame(item.id, {
          ...pkg,
          decks: pkg.decks.map((d) => (d.id === targetId ? { ...d, relX: nx, relY: ny } : d)),
        });
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Đặt thành phần mới khi người dùng chọn Game Pen tool và click lên vùng bàn cờ
  const handleArenaClick = (e: React.MouseEvent) => {
    if (activeTool !== 'game_pen' || activeGamePenTool === 'select') return;
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = transform.scale || 1;
    const relX = Math.round((e.clientX - rect.left) / scale);
    const relY = Math.round((e.clientY - rect.top) / scale);

    if (activeGamePenTool === 'create_dice') {
      const newDice: BoardTile = {
        id: `dice-${Date.now()}`,
        role: 'dice_drop_zone',
        shape: 'circle',
        relX: relX - 80,
        relY: relY - 80,
        width: 160,
        height: 160,
        hasFunction: true,
        title: 'Ô Thả Xúc Xắc 3D',
        diceConfig: { diceCount: 2, lastRollValues: [1, 6] },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newDice] });
      setActiveGamePenTool('select');
      return;
    }

    if (activeGamePenTool === 'create_draw_tile') {
      const newDrawTile: BoardTile = {
        id: `draw-tile-${Date.now()}`,
        role: 'draw_card_tile',
        shape: 'square',
        relX: relX - 35,
        relY: relY - 35,
        width: 70,
        height: 70,
        hasFunction: true,
        title: pkg.tiles.some((t) => t.title === 'Cơ Hội') ? 'Khí Vận' : 'Cơ Hội',
        form: {
          hasHeader: true,
          headerBgColor: '#2563eb',
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'solid',
        },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newDrawTile] });
      setActiveGamePenTool('select');
      return;
    }

    if (activeGamePenTool === 'create_external_info') {
      const newInfo: BoardTile = {
        id: `ext-info-${Date.now()}`,
        role: 'external_info',
        shape: 'rect',
        relX,
        relY,
        width: 210,
        height: 165,
        hasFunction: true,
        title: 'Thông tin ô đất',
        price: 120000,
        propertyDetails: {
          baseRent: 20000,
          houseCost: 50000,
          rentsByLevel: [40000, 80000, 120000, 160000, 240000],
          resellValue: 60000,
          currentHouses: 0,
          upgradeRuleText: 'Đủ bộ màu để nâng nhà',
        },
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newInfo] });
      setActiveGamePenTool('select');
      return;
    }

    if (activeGamePenTool === 'create_bank') {
      const newBank: BoardTile = {
        id: `bank-${Date.now()}`,
        role: 'bank_zone',
        shape: 'rect',
        relX,
        relY,
        width: 220,
        height: 120,
        hasFunction: true,
        title: 'Ngân Hàng Trung Ương',
      };
      commitPkg({ ...pkg, tiles: [...pkg.tiles, newBank] });
      setActiveGamePenTool('select');
      return;
    }

    if (activeGamePenTool === 'create_deck') {
      const isDeed = pkg.decks.length >= 2;
      const newDeck: GameCardDeck = {
        id: `deck-${Date.now()}`,
        name: pkg.decks.length === 0 ? 'Cơ Hội' : pkg.decks.length === 1 ? 'Khí Vận' : 'Sổ Đỏ Đất',
        deckType: isDeed ? 'title_deeds' : 'draw_deck',
        color: pkg.decks.length === 0 ? '#E0562D' : pkg.decks.length === 1 ? '#2563eb' : '#16a34a',
        relX: relX - 55,
        relY: relY - 38,
        width: 110,
        height: 76,
        cards: [],
      };
      commitPkg({ ...pkg, decks: [...pkg.decks, newDeck] });
      setActiveGamePenTool('select');
      return;
    }
  };

  // Tìm thẻ Sổ Đỏ sở hữu của 1 ô đất
  const findDeedForTile = (tileId: string) => {
    for (const d of pkg.decks) {
      if (d.deckType === 'title_deeds') {
        const card = d.cards.find((c) => c.linkedTileId === tileId);
        if (card) return { deck: d, card };
      }
    }
    return null;
  };

  // Mua ô đất & nhận thẻ Sổ Đỏ
  const handleBuyProperty = (tile: BoardTile) => {
    const price = tile.price || 100000;
    const curBal = calculateBalanceTotal(pkg.matchState.playerBalances[selectedPlayerId]);
    if (curBal < price) {
      showToast('Không đủ tiền để mua ô đất này!');
      return;
    }

    let deedsDeck = pkg.decks.find((d) => d.deckType === 'title_deeds');
    let nextDecks = [...pkg.decks];

    if (!deedsDeck) {
      deedsDeck = {
        id: `deck-deeds-${Date.now()}`,
        name: 'Bộ Sổ Đỏ',
        deckType: 'title_deeds',
        color: '#16a34a',
        relX: Math.round(w / 2 - 55),
        relY: Math.round(h - 140),
        width: 110,
        height: 76,
        cards: [],
      };
      nextDecks.push(deedsDeck);
    }

    const existingCard = deedsDeck.cards.find((c) => c.linkedTileId === tile.id);
    const updatedCards = existingCard
      ? deedsDeck.cards.map((c) =>
          c.id === existingCard.id ? { ...c, ownerPlayerId: selectedPlayerId } : c
        )
      : [
          ...deedsDeck.cards,
          {
            id: `deed-${Date.now()}`,
            title: `Sổ Đỏ: ${tile.title || tile.id}`,
            description: `Giá mua ${price.toLocaleString('vi-VN')}đ`,
            linkedTileId: tile.id,
            ownerPlayerId: selectedPlayerId,
          },
        ];

    nextDecks = nextDecks.map((d) =>
      d.id === deedsDeck!.id ? { ...d, cards: updatedCards } : d
    );

    const nextBalances = {
      ...pkg.matchState.playerBalances,
      [selectedPlayerId]: breakAmountIntoVndNotes(curBal - price),
    };

    const buyerName =
      playersList.find((p) => p.id === selectedPlayerId)?.name || selectedPlayerId;

    commitPkg({
      ...pkg,
      decks: nextDecks,
      matchState: {
        ...pkg.matchState,
        playerBalances: nextBalances,
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            message: `${buyerName} đã mua "${tile.title}" (${price.toLocaleString('vi-VN')}đ) và nhận Sổ Đỏ.`,
          },
          ...(pkg.matchState.logs || []),
        ].slice(0, 30),
      },
    });
    showToast(`${buyerName} đã sở hữu Sổ Đỏ "${tile.title}"!`);
  };

  // Trả tiền thuê đất cho chủ Sổ Đỏ
  const handlePayRent = (tile: BoardTile, ownerId: string, rentAmount: number) => {
    const payerBal = calculateBalanceTotal(pkg.matchState.playerBalances[selectedPlayerId]);
    if (payerBal < rentAmount) {
      showToast('Số dư không đủ để trả tiền thuê!');
      return;
    }
    const ownerBal = calculateBalanceTotal(pkg.matchState.playerBalances[ownerId]);
    const nextBalances = {
      ...pkg.matchState.playerBalances,
      [selectedPlayerId]: breakAmountIntoVndNotes(payerBal - rentAmount),
      [ownerId]: breakAmountIntoVndNotes(ownerBal + rentAmount),
    };
    const payerName = playersList.find((p) => p.id === selectedPlayerId)?.name || selectedPlayerId;
    const ownerName = playersList.find((p) => p.id === ownerId)?.name || ownerId;

    commitPkg({
      ...pkg,
      matchState: {
        ...pkg.matchState,
        playerBalances: nextBalances,
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            message: `${payerName} trả ${rentAmount.toLocaleString('vi-VN')}đ tiền thuê cho ${ownerName}.`,
          },
          ...(pkg.matchState.logs || []),
        ].slice(0, 30),
      },
    });
    showToast(`Đã chuyển ${rentAmount.toLocaleString('vi-VN')}đ cho ${ownerName}!`);
  };

  // Tự động sinh Sổ Đỏ cho toàn bộ các ô đất
  const handleAutoGenerateDeeds = (targetDeckId: string) => {
    const propertyTiles = pkg.tiles.filter((t) => t.role === 'normal_cell' && t.hasFunction && t.price);
    const deedCards = propertyTiles.map((t, idx) => ({
      id: `deed-auto-${t.id}-${idx}`,
      title: `Sổ Đỏ: ${t.title || `Ô ${idx + 1}`}`,
      description: `Giá trị ${(t.price || 0).toLocaleString('vi-VN')}đ • Thuê ${(t.propertyDetails?.baseRent || Math.round((t.price || 50000) * 0.15)).toLocaleString('vi-VN')}đ`,
      linkedTileId: t.id,
      ownerPlayerId: null,
    }));
    commitPkg({
      ...pkg,
      decks: pkg.decks.map((d) => (d.id === targetDeckId ? { ...d, cards: deedCards } : d)),
    });
    showToast(`Đã sinh ${deedCards.length} Sổ Đỏ liên kết ô đất!`);
  };

  const handleSaveToCabinet = () => {
    const finalPkg: BoardGamePackage = {
      ...pkg,
      title: pkgTitle.trim() || pkg.title,
      description: pkgDesc.trim(),
      minPlayers: pkgMinPlayers,
      maxPlayers: pkgMaxPlayers,
      updatedAt: new Date().toISOString(),
    };
    commitPkg(finalPkg);
    GameCabinetStorage.saveGame(finalPkg);
    setIsPackageModalOpen(false);
    showToast(`Đã đóng gói "${finalPkg.title}" vào Tủ Game cá nhân!`);
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
        className="interactive-control absolute -top-11 left-0 right-0 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl px-3 py-1.5 shadow-lg"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Gamepad2 className="w-4 h-4 text-[#E0562D] shrink-0" />
          <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
            {pkg.title}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {pkg.mapConfig.rows}×{pkg.mapConfig.cols}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Chọn người đang thao tác */}
          {!isEditMode && (
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50"
            >
              {playersList.map((p) => (
                <option key={p.id} value={p.id}>
                  Lượt: {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              const nextEdit = !isEditMode;
              setIsEditMode(nextEdit);
              if (nextEdit) {
                setActiveTool('game_pen');
              } else {
                setActiveTool('cursor');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              isEditMode
                ? 'bg-orange-50 text-[#E0562D] border border-[#FFEDD5]'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isEditMode ? <Pencil className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isEditMode ? 'Đang thiết kế' : 'Đang chơi'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBankOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
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
            className="px-2.5 py-1 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <PackageCheck className="w-3 h-3" />
            <span>Đóng gói</span>
          </button>

          <button
            type="button"
            title="Xóa bàn cờ khỏi bàn học"
            onClick={() => removeDeskItem(item.id)}
            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* THÔNG BÁO CHẾ ĐỘ CHỌN Ô KHỚP QUÂN CỜ */}
      {pendingFitPawnAsset && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-[#E0562D] text-white text-xs font-bold shadow-lg animate-bounce">
          Nhấp vào 1 ô vuông trên bản đồ để đặt quân cờ "{pendingFitPawnAsset.name}" vừa khít!
        </div>
      )}

      {/* LỚP DÂY KẾT NỐI NODE */}
      <GameLinkLayer
        tiles={pkg.tiles}
        decks={pkg.decks}
        links={pkg.links}
        isEditMode={isEditMode}
        draftConnection={
          connectSourceId && draftMousePos
            ? (() => {
                const src = pkg.tiles.find((t) => t.id === connectSourceId);
                if (!src) return null;
                return {
                  fromX: src.relX + src.width / 2,
                  fromY: src.relY + src.height / 2,
                  toX: draftMousePos.x,
                  toY: draftMousePos.y,
                };
              })()
            : null
        }
      />

      {/* RENDER TẤT CẢ CÁC Ô TRÊN MAP VÀ NGOÀI MAP */}
      {pkg.tiles.map((tile) => {
        // Ô ngoài map: ẩn khi đang chơi nếu chưa có quân cờ nào đứng lên ô nguồn
        const isTriggered = pkg.matchState.activeTriggeredInfoTileIds.includes(tile.id);
        if (tile.role === 'external_info' && !isEditMode && !isTriggered) {
          return null;
        }

        // Tìm chủ sở hữu nếu là ô đất
        const deedMatch = tile.role === 'normal_cell' ? findDeedForTile(tile.id) : null;
        const ownerId = deedMatch?.card.ownerPlayerId || null;
        const ownerName = ownerId
          ? playersList.find((p) => p.id === ownerId)?.name || ownerId
          : null;

        // Xác định nếu có quân cờ đang đứng trên ô này
        const standingPawn = pkg.pawns.find((p) => p.currentTileId === tile.id);

        if (tile.role === 'dice_drop_zone') {
          return (
            <div
              key={tile.id}
              onMouseDown={(e) => handleSubItemDrag('tile', tile.id, tile.relX, tile.relY, e)}
              onClick={(e) => handleTileClick(tile, e)}
              style={{
                left: tile.relX,
                top: tile.relY,
                width: tile.width,
                height: tile.height,
              }}
              className="interactive-control absolute rounded-full bg-white/95 border-2 border-dashed border-slate-400 shadow-lg flex items-center justify-center p-2 z-20"
            >
              <TopDownDice3D
                diceCount={tile.diceConfig?.diceCount || 2}
                lastValues={tile.diceConfig?.lastRollValues}
                onRollComplete={(vals) => {
                  const sum = vals.reduce((a, b) => a + b, 0);
                  commitPkg({
                    ...pkg,
                    tiles: pkg.tiles.map((t) =>
                      t.id === tile.id
                        ? { ...t, diceConfig: { diceCount: vals.length, lastRollValues: vals, rollTimestamp: Date.now() } }
                        : t
                    ),
                    matchState: {
                      ...pkg.matchState,
                      logs: [
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toLocaleTimeString('vi-VN'),
                          message: `Tung ${vals.length} xúc xắc được ${vals.join(' + ')} = ${sum} điểm.`,
                        },
                        ...(pkg.matchState.logs || []),
                      ].slice(0, 30),
                    },
                  });
                }}
              />
              {isEditMode && (
                <div className="absolute -top-6 flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-0.5 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-600">Số viên:</span>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        commitPkg({
                          ...pkg,
                          tiles: pkg.tiles.map((t) =>
                            t.id === tile.id
                              ? { ...t, diceConfig: { ...t.diceConfig, diceCount: n } }
                              : t
                          ),
                        });
                      }}
                      className={`w-4 h-4 rounded-full text-[10px] font-bold cursor-pointer ${
                        (tile.diceConfig?.diceCount || 2) === n
                          ? 'bg-[#E0562D] text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (tile.role === 'bank_zone') {
          return (
            <div
              key={tile.id}
              onMouseDown={(e) => handleSubItemDrag('tile', tile.id, tile.relX, tile.relY, e)}
              onClick={(e) => handleTileClick(tile, e)}
              style={{
                left: tile.relX,
                top: tile.relY,
                width: tile.width,
                height: tile.height,
              }}
              className="interactive-control absolute rounded-2xl bg-white border-2 border-[#E0562D] shadow-xl p-3 flex flex-col justify-between cursor-pointer hover:shadow-2xl z-20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#E0562D]" />
                  <span className="text-xs font-black text-slate-900">{tile.title || 'Ngân Hàng'}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-[#E0562D]">
                  9 mệnh giá
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {pkg.currencyDesigns.slice(0, 6).map((c) => (
                  <span
                    key={c.denomination}
                    style={{ backgroundColor: c.colorHex, color: c.accentHex }}
                    className="text-[9px] font-black px-1.5 py-0.5 rounded border border-black/10"
                  >
                    {c.label}
                  </span>
                ))}
                <span className="text-[9px] font-bold text-slate-500">+3</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-500">
                Nhấp để phát tiền & giao dịch
              </div>
            </div>
          );
        }

        if (tile.role === 'external_info') {
          const linkedSourceTile = pkg.tiles.find((src) =>
            pkg.links.some((l) => l.sourceId === src.id && l.targetId === tile.id)
          );
          const sourceDeed = linkedSourceTile ? findDeedForTile(linkedSourceTile.id) : null;
          const sourceOwnerId = sourceDeed?.card.ownerPlayerId || null;
          const rentVal = tile.propertyDetails?.baseRent || 20000;

          return (
            <div
              key={tile.id}
              onMouseDown={(e) => handleSubItemDrag('tile', tile.id, tile.relX, tile.relY, e)}
              onClick={(e) => handleTileClick(tile, e)}
              style={{
                left: tile.relX,
                top: tile.relY,
                width: tile.width,
                minHeight: tile.height,
              }}
              className="interactive-control absolute rounded-xl bg-white border-2 border-slate-800 shadow-2xl p-2.5 flex flex-col justify-between gap-1.5 z-30 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-xs font-black text-slate-900 truncate">
                  {tile.title || linkedSourceTile?.title || 'Thông tin địa điểm'}
                </span>
                {isEditMode && (
                  <span className="text-[9px] font-bold text-[#E0562D] bg-orange-50 px-1.5 py-0.5 rounded">
                    Ô ngoài map
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Tiền phạt dẫm lên:</span>
                  <strong className="text-rose-600">{rentVal.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="flex justify-between">
                  <span>Nâng cấp nhà:</span>
                  <strong>{(tile.propertyDetails?.houseCost || 50000).toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="flex justify-between">
                  <span>Giá bán lại:</span>
                  <strong>{(tile.propertyDetails?.resellValue || 60000).toLocaleString('vi-VN')}đ</strong>
                </div>
                {tile.propertyDetails?.upgradeRuleText && (
                  <div className="text-[10px] italic text-slate-500 pt-0.5">
                    {tile.propertyDetails.upgradeRuleText}
                  </div>
                )}
              </div>
              {!isEditMode && linkedSourceTile && (
                <div className="pt-1 border-t border-slate-100">
                  {!sourceOwnerId ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyProperty(linkedSourceTile);
                      }}
                      className="w-full py-1 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-[10px] font-bold cursor-pointer"
                    >
                      Mua đất ({(linkedSourceTile.price || tile.price || 100000).toLocaleString('vi-VN')}đ)
                    </button>
                  ) : sourceOwnerId !== selectedPlayerId ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayRent(linkedSourceTile, sourceOwnerId, rentVal);
                      }}
                      className="w-full py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Trả {rentVal.toLocaleString('vi-VN')}đ cho{' '}
                      {playersList.find((p) => p.id === sourceOwnerId)?.name || 'Chủ đất'}
                    </button>
                  ) : (
                    <div className="text-[10px] font-bold text-emerald-700 text-center flex items-center justify-center gap-1">
                      <Home className="w-3 h-3" />
                      <span>Đất của bạn</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        // Ô CỜ CHUẨN TRÊN MAP (Ô Vuông Trắng Có Viền) & Ô Rút Thẻ
        return (
          <div
            key={tile.id}
            onMouseDown={(e) => {
              if (tile.role === 'draw_card_tile') {
                handleSubItemDrag('tile', tile.id, tile.relX, tile.relY, e);
              }
            }}
            onClick={(e) => handleTileClick(tile, e)}
            style={{
              left: tile.relX,
              top: tile.relY,
              width: tile.width,
              height: tile.height,
            }}
            className={`interactive-control absolute bg-white border flex flex-col justify-between overflow-hidden cursor-pointer transition-colors ${
              connectSourceId === tile.id
                ? 'border-2 border-[#E0562D] ring-2 ring-[#E0562D]/30 z-20'
                : standingPawn
                ? 'border-2 border-[#E0562D] shadow-md z-15'
                : 'border-slate-300 hover:border-slate-500 z-10'
            }`}
          >
            {/* Header màu nếu có */}
            {tile.form?.hasHeader && (
              <div
                style={{ backgroundColor: tile.form.headerBgColor || '#E0562D' }}
                className="h-3.5 w-full shrink-0 flex items-center justify-center px-1"
              >
                {ownerName && (
                  <span className="text-[8px] font-black text-white truncate">
                    ★ {ownerName}
                  </span>
                )}
              </div>
            )}

            {/* Nội dung chính của ô */}
            <div className="flex-1 flex flex-col items-center justify-center p-1 text-center overflow-hidden">
              {tile.form?.hasBodyImage && tile.imageUrl && (
                <img
                  src={tile.imageUrl}
                  alt={tile.title || ''}
                  className="w-7 h-7 object-contain mb-0.5"
                />
              )}
              {tile.title && (
                <span className="text-[9px] font-bold text-slate-800 leading-tight line-clamp-2">
                  {tile.title}
                </span>
              )}
              {tile.role === 'draw_card_tile' && (
                <span className="text-[8px] font-semibold text-blue-600 mt-0.5">Rút thẻ</span>
              )}
            </div>

            {/* Footer giá tiền */}
            {tile.form?.hasFooterPrice && tile.price !== undefined && (
              <div className="text-[8px] font-black text-slate-700 bg-slate-50 border-t border-slate-100 text-center py-0.5">
                {(tile.price / 1000).toFixed(0)}k
              </div>
            )}
          </div>
        );
      })}

      {/* BỘ THẺ / BÀI ĐẶT TRONG LÒNG MAP */}
      {pkg.decks.map((deck) => (
        <div
          key={deck.id}
          onMouseDown={(e) => handleSubItemDrag('deck', deck.id, deck.relX, deck.relY, e)}
          onClick={(e) => {
            e.stopPropagation();
            if (activeTool === 'game_pen' && activeGamePenTool === 'connect_nodes' && connectSourceId) {
              const newLink = {
                id: `link-${Date.now()}`,
                sourceId: connectSourceId,
                targetId: deck.id,
                linkType: 'on_step_draw_deck' as const,
              };
              commitPkg({ ...pkg, links: [...pkg.links, newLink] });
              setConnectSourceId(null);
              setDraftMousePos(null);
              showToast(`Đã nối ô với bộ thẻ "${deck.name}"!`);
              return;
            }
            if (!isEditMode && deck.deckType === 'draw_deck' && deck.cards.length > 0) {
              const picked = deck.cards[Math.floor(Math.random() * deck.cards.length)];
              commitPkg({
                ...pkg,
                matchState: {
                  ...pkg.matchState,
                  lastDrawnCard: {
                    deckId: deck.id,
                    deckName: deck.name,
                    card: picked,
                    drawnAt: Date.now(),
                  },
                },
              });
            } else {
              setEditingDeck(deck);
            }
          }}
          style={{
            left: deck.relX,
            top: deck.relY,
            width: deck.width,
            height: deck.height,
            borderColor: deck.color,
          }}
          className="interactive-control absolute rounded-xl bg-white border-2 shadow-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform z-20"
        >
          <div className="flex items-center gap-1">
            {deck.deckType === 'title_deeds' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Layers className="w-3.5 h-3.5" style={{ color: deck.color }} />
            )}
            <span className="text-[11px] font-black text-slate-900 truncate max-w-[85px]">
              {deck.name}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
            {deck.cards.length} lá bài
          </span>
          {isEditMode && (
            <span className="text-[9px] text-[#E0562D] font-bold mt-0.5">Nhấp để sửa / AI</span>
          )}
        </div>
      ))}

      {/* QUÂN CỜ TRÊN BÀN */}
      {pkg.pawns.map((pawn) => (
        <div
          key={pawn.id}
          onPointerDown={(e) => handlePawnPointerDown(pawn, e)}
          style={{
            left: pawn.relX,
            top: pawn.relY,
            width: pawn.width,
            height: pawn.height,
          }}
          title={`${pawn.name} (Kéo thả lên ô trên map)`}
          className="interactive-control absolute z-35 cursor-grab active:cursor-grabbing group flex flex-col items-center justify-center"
        >
          <div className="w-full h-full rounded-full bg-white border-2 border-slate-900 shadow-lg overflow-hidden flex items-center justify-center p-0.5 group-hover:ring-2 group-hover:ring-[#E0562D]">
            {pawn.imageUrl ? (
              <img
                src={pawn.imageUrl}
                alt={pawn.name}
                className="w-full h-full object-contain rounded-full pointer-events-none"
              />
            ) : (
              <span className="text-xs font-black text-[#E0562D]">{pawn.name.slice(0, 2)}</span>
            )}
          </div>
        </div>
      ))}

      {/* POPUP THẺ VỪA RÚT Ở GIỮA BÀN */}
      {pkg.matchState.lastDrawnCard && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="interactive-control absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white border-2 border-[#E0562D] rounded-2xl shadow-2xl p-3.5 z-40 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E0562D]">
              {pkg.matchState.lastDrawnCard.deckName}
            </span>
            <button
              type="button"
              onClick={() =>
                commitPkg({
                  ...pkg,
                  matchState: { ...pkg.matchState, lastDrawnCard: null },
                })
              }
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {pkg.matchState.lastDrawnCard.card.title}
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {pkg.matchState.lastDrawnCard.card.description}
          </p>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {savedToast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg">
          {savedToast}
        </div>
      )}

      {/* MODAL CHỈNH FORM Ô */}
      <TileFormEditorModal
        isOpen={Boolean(editingTile)}
        tile={editingTile}
        totalNormalTilesCount={normalTilesCount}
        onClose={() => setEditingTile(null)}
        onSaveTile={(updated) => {
          commitPkg({
            ...pkg,
            tiles: pkg.tiles.map((t) => (t.id === updated.id ? updated : t)),
          });
        }}
        onApplyFormToAll={(formTemplate, hasFn) => {
          commitPkg({
            ...pkg,
            tiles: pkg.tiles.map((t) =>
              t.role === 'normal_cell' ? { ...t, form: formTemplate, hasFunction: hasFn } : t
            ),
          });
          showToast('Đã áp dụng form lên toàn bộ ô cờ!');
        }}
        onAiFillAllTiles={(aiItems) => {
          let aiIdx = 0;
          commitPkg({
            ...pkg,
            tiles: pkg.tiles.map((t) => {
              if (t.role !== 'normal_cell') return t;
              const entry = aiItems[aiIdx % aiItems.length];
              aiIdx++;
              return {
                ...t,
                hasFunction: true,
                title: entry.title,
                price: entry.price,
                form: {
                  hasHeader: true,
                  headerBgColor: entry.headerColor,
                  hasBodyImage: false,
                  hasFooterPrice: true,
                  borderStyle: 'solid',
                },
                propertyDetails: {
                  baseRent: entry.baseRent,
                  houseCost: entry.houseCost,
                  rentsByLevel: [
                    entry.baseRent * 2,
                    entry.baseRent * 4,
                    entry.baseRent * 6,
                    entry.baseRent * 8,
                    entry.baseRent * 12,
                  ],
                  resellValue: Math.round(entry.price * 0.5),
                  currentHouses: 0,
                },
              };
            }),
          });
          showToast('AI đã thiết kế xong toàn bộ các ô đất!');
        }}
      />

      {/* MODAL QUẢN LÝ BỘ THẺ / SỔ ĐỎ */}
      <DeckAndDeedModal
        isOpen={Boolean(editingDeck)}
        deck={editingDeck}
        boardTiles={pkg.tiles}
        playerIds={playersList}
        onClose={() => setEditingDeck(null)}
        onUpdateDeck={(updated) => {
          commitPkg({
            ...pkg,
            decks: pkg.decks.map((d) => (d.id === updated.id ? updated : d)),
          });
        }}
        onAutoGenerateDeeds={() => {
          if (editingDeck) handleAutoGenerateDeeds(editingDeck.id);
        }}
      />

      {/* MODAL NGÂN HÀNG & TIỀN VIỆT NAM */}
      <CurrencyAndBankPanel
        isOpen={isBankOpen}
        pkg={pkg}
        players={playersList}
        onClose={() => setIsBankOpen(false)}
        onUpdatePackage={commitPkg}
      />

      {/* MODAL ĐÓNG GÓI GAME LƯU VÀO TỦ CÁ NHÂN */}
      {isPackageModalOpen &&
        createPortal(
          <div
            data-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9995] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Đóng gói Board Game vào Tủ</h3>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên trò chơi</label>
                  <input
                    type="text"
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    placeholder="VD: Cờ Tỷ Phú Sinh Viên"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#E0562D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả & Luật chơi</label>
                  <textarea
                    rows={3}
                    value={pkgDesc}
                    onChange={(e) => setPkgDesc(e.target.value)}
                    placeholder="Mô tả ngắn gọn cách chơi cho bạn bè..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#E0562D] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số người tối thiểu</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={pkgMinPlayers}
                      onChange={(e) => setPkgMinPlayers(Number(e.target.value) || 2)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số người tối đa</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={pkgMaxPlayers}
                      onChange={(e) => setPkgMaxPlayers(Number(e.target.value) || 4)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveToCabinet}
                  className="px-4 py-2 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold cursor-pointer"
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
