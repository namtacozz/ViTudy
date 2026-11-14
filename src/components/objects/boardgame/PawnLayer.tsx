'use client';

import React from 'react';
import { GamePawn } from '@/types/boardgame';

interface PawnLayerProps {
  pawns: GamePawn[];
  activePlayerId: string | null;
  bankruptPlayerIds: string[];
  canDragPawns: boolean;
  onStartDragPawn: (e: React.PointerEvent, pawn: GamePawn) => void;
  onFlipPawn?: (pawnId: string) => void;
  onSpawnSupplyPawn?: (pawnId: string) => void;
}

export const PawnLayer = React.memo(function PawnLayer({
  pawns,
  activePlayerId,
  bankruptPlayerIds,
  canDragPawns,
  onStartDragPawn,
  onFlipPawn,
  onSpawnSupplyPawn,
}: PawnLayerProps) {
  const bankruptSet = new Set(bankruptPlayerIds);

  return (
    <>
      {pawns.map((pawn) => {
        const isActive = activePlayerId === pawn.id;
        const isBankrupt = bankruptSet.has(pawn.id);
        const isFaceDown = pawn.faceUp === false;

        return (
          <div
            key={pawn.id}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              if (pawn.isInfiniteSupply && onSpawnSupplyPawn) {
                e.stopPropagation();
                onSpawnSupplyPawn(pawn.id);
                return;
              }
              if (!canDragPawns) return;
              onStartDragPawn(e, pawn);
            }}
            onDoubleClick={(e) => {
              if (!pawn.isInfiniteSupply && onFlipPawn) {
                e.stopPropagation();
                onFlipPawn(pawn.id);
              }
            }}
            style={{
              position: 'absolute',
              left: pawn.relX - pawn.width / 2,
              top: pawn.relY - pawn.height / 2,
              width: pawn.width,
              height: pawn.height,
              zIndex: isActive ? 40 : 30,
              opacity: isBankrupt ? 0.35 : 1,
            }}
            title={`${pawn.name}${pawn.isInfiniteSupply ? ' (Bấm để lấy quân mới)' : ''}${
              isActive ? ' (Đang tới lượt)' : ''
            }${canDragPawns ? ' — Kéo thả / Double-click để lật' : ''}`}
            className={`interactive-control rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all hover:scale-110 select-none ${
              pawn.isInfiniteSupply
                ? 'cursor-copy ring-2 ring-dashed ring-slate-400'
                : canDragPawns
                ? 'cursor-grab active:cursor-grabbing'
                : 'cursor-default'
            } ${isActive ? 'ring-3 ring-[#E0562D] scale-105' : ''}`}
          >
            {isFaceDown ? (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-200 text-[10px] font-black">
                ?
              </div>
            ) : pawn.imageUrl ? (
              <img
                src={pawn.imageUrl}
                alt={pawn.name}
                className="w-full h-full object-contain rounded-full bg-white"
              />
            ) : (
              <div
                style={{ backgroundColor: pawn.color }}
                className="w-full h-full rounded-full flex items-center justify-center text-white text-[10px] font-black"
              >
                {pawn.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {pawn.isInfiniteSupply && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#E0562D] text-white text-[10px] font-black flex items-center justify-center shadow">
                +
              </span>
            )}
          </div>
        );
      })}
    </>
  );
});
