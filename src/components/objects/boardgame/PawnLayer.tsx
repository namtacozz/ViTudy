'use client';

import React from 'react';
import { GamePawn } from '@/types/boardgame';

interface PawnLayerProps {
  pawns: GamePawn[];
  activePlayerId: string | null;
  bankruptPlayerIds: string[];
  canDragPawns: boolean;
  onStartDragPawn: (e: React.PointerEvent, pawn: GamePawn) => void;
}

export const PawnLayer = React.memo(function PawnLayer({
  pawns,
  activePlayerId,
  bankruptPlayerIds,
  canDragPawns,
  onStartDragPawn,
}: PawnLayerProps) {
  const bankruptSet = new Set(bankruptPlayerIds);

  return (
    <>
      {pawns.map((pawn) => {
        const isActive = activePlayerId === pawn.id;
        const isBankrupt = bankruptSet.has(pawn.id);

        return (
          <div
            key={pawn.id}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              if (!canDragPawns) return;
              onStartDragPawn(e, pawn);
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
            title={`${pawn.name}${isActive ? ' (Đang tới lượt)' : ''}${
              canDragPawns ? ' — Kéo thả tự do' : ' — Di chuyển theo xúc xắc'
            }`}
            className={`interactive-control rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all hover:scale-110 select-none ${
              canDragPawns ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            } ${isActive ? 'ring-3 ring-[#E0562D] scale-105' : ''}`}
          >
            {pawn.imageUrl ? (
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
          </div>
        );
      })}
    </>
  );
});
