'use client';

import React, { useMemo } from 'react';
import { BoardGamePackage, BoardTile, GamePawn } from '@/types/boardgame';
import { CanvasTransform } from '@/types/studyspace';
import { GameLinkLayer } from './GameLinkLayer';
import { TileView } from './TileView';
import { DiceLayer } from './DiceLayer';
import { PawnLayer } from './PawnLayer';

interface BoardCanvasProps {
  pkg: BoardGamePackage;
  boardX: number;
  boardY: number;
  transform: CanvasTransform;
  isEditMode: boolean;
  connectSourceId: string | null;
  draftMousePos: { x: number; y: number } | null;
  canConnect: boolean;
  activePlayerId: string | null;
  canDragPawns: boolean;
  onTileClick: (e: React.MouseEvent, tile: BoardTile) => void;
  onDeleteTile: (tileId: string) => void;
  onTriggerDrawDeck: (tile: BoardTile) => void;
  onOpenBank: () => void;
  onRollComplete: (tileId: string, values: number[], total: number) => void;
  onUpdateDiceConfig?: (tileId: string, config: NonNullable<BoardTile['diceConfig']>) => void;
  onStartDragPawn: (e: React.PointerEvent, pawn: GamePawn) => void;
}

export const BoardCanvas = React.memo(function BoardCanvas({
  pkg,
  boardX,
  boardY,
  transform,
  isEditMode,
  connectSourceId,
  draftMousePos,
  canConnect,
  activePlayerId,
  canDragPawns,
  onTileClick,
  onDeleteTile,
  onTriggerDrawDeck,
  onOpenBank,
  onRollComplete,
  onUpdateDiceConfig,
  onStartDragPawn,
}: BoardCanvasProps) {
  const deckById = useMemo(() => {
    const map = new Map(pkg.decks.map((d) => [d.id, d]));
    return map;
  }, [pkg.decks]);

  const ownerByTileId = useMemo(() => {
    const map = new Map<string, GamePawn>();
    const pawnMap = new Map(pkg.pawns.map((p) => [p.id, p]));
    for (const d of pkg.decks) {
      for (const c of d.cards) {
        if (c.linkedTileId && c.ownerPlayerId) {
          const owner = pawnMap.get(c.ownerPlayerId);
          if (owner) map.set(c.linkedTileId, owner);
        }
      }
    }
    return map;
  }, [pkg.decks, pkg.pawns]);

  const triggeredSet = useMemo(
    () => new Set(pkg.matchState?.activeTriggeredInfoTileIds || []),
    [pkg.matchState?.activeTriggeredInfoTileIds]
  );

  // Viewport culling cho bàn cờ lớn (VD: 20x20 = 400 ô) để giữ 60 FPS
  const visibleNonDiceTiles = useMemo(() => {
    const nonDice = pkg.tiles.filter((t) => t.role !== 'dice_drop_zone');
    if (nonDice.length <= 64 || typeof window === 'undefined') {
      return nonDice;
    }

    const scale = transform.scale || 1;
    const buffer = 240;
    const viewLeft = -transform.x / scale - buffer;
    const viewTop = -transform.y / scale - buffer;
    const viewRight = (window.innerWidth - transform.x) / scale + buffer;
    const viewBottom = (window.innerHeight - transform.y) / scale + buffer;

    return nonDice.filter((t) => {
      const tx1 = boardX + t.relX;
      const ty1 = boardY + t.relY;
      const tx2 = tx1 + t.width;
      const ty2 = ty1 + t.height;
      return tx2 >= viewLeft && tx1 <= viewRight && ty2 >= viewTop && ty1 <= viewBottom;
    });
  }, [pkg.tiles, boardX, boardY, transform.x, transform.y, transform.scale]);

  const diceTiles = useMemo(
    () => pkg.tiles.filter((t) => t.role === 'dice_drop_zone'),
    [pkg.tiles]
  );

  return (
    <div className="relative w-full h-full">
      <GameLinkLayer
        tiles={pkg.tiles}
        decks={pkg.decks}
        links={pkg.links}
        isEditMode={isEditMode}
        draftConnection={
          connectSourceId && draftMousePos
            ? (() => {
                const src = pkg.tiles.find((t) => t.id === connectSourceId);
                return src
                  ? {
                      fromX: src.relX + src.width / 2,
                      fromY: src.relY + src.height / 2,
                      toX: draftMousePos.x,
                      toY: draftMousePos.y,
                    }
                  : null;
              })()
            : null
        }
      />

      {visibleNonDiceTiles.map((tile) => (
        <TileView
          key={tile.id}
          tile={tile}
          deck={tile.deckId ? deckById.get(tile.deckId) : undefined}
          deedOwnerPawn={ownerByTileId.get(tile.id)}
          isEditMode={isEditMode}
          isConnectSource={connectSourceId === tile.id}
          isTriggeredInfo={triggeredSet.has(tile.id)}
          canConnect={canConnect}
          onTileClick={onTileClick}
          onDeleteTile={onDeleteTile}
          onTriggerDrawDeck={onTriggerDrawDeck}
          onOpenBank={onOpenBank}
        />
      ))}

      <DiceLayer
        diceTiles={diceTiles}
        isEditMode={isEditMode}
        onRollComplete={onRollComplete}
        onDeleteTile={onDeleteTile}
        onUpdateDiceConfig={onUpdateDiceConfig}
      />

      <PawnLayer
        pawns={pkg.pawns}
        activePlayerId={activePlayerId}
        bankruptPlayerIds={pkg.matchState?.bankruptPlayerIds || []}
        canDragPawns={canDragPawns}
        onStartDragPawn={onStartDragPawn}
      />
    </div>
  );
});
