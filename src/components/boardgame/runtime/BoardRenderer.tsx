'use client';

import React, { useMemo } from 'react';
import {
  EngineState,
  EntityId,
  Piece,
  Zone,
} from '@/engine/boardgame';

interface BoardRendererProps {
  state: EngineState;
  viewerPlayerId?: EntityId | null;
  viewportRect?: { x: number; y: number; width: number; height: number } | null;
  onZoneClick?: (zone: Zone) => void;
  onPieceClick?: (piece: Piece) => void;
}

/**
 * Pure state-projection renderer (Cluster F).
 * Knows nothing about Monopoly, Caro, or UNO — only renders Zones and Pieces by layout.
 */
export const BoardRenderer = React.memo(function BoardRenderer({
  state,
  viewportRect,
  onZoneClick,
  onPieceClick,
}: BoardRendererProps) {
  const allZones = useMemo(() => Object.values(state.zones), [state.zones]);

  // Viewport culling for large boards (e.g. 20x20 = 400 zones) to maintain 60 FPS
  const visibleZones = useMemo(() => {
    if (allZones.length <= 64 || !viewportRect) return allZones;
    return allZones.filter((z) => {
      if (z.coords?.x === undefined || z.coords?.y === undefined) return true;
      const zx = z.coords.x;
      const zy = z.coords.y;
      return (
        zx >= viewportRect.x - 120 &&
        zx <= viewportRect.x + viewportRect.width + 120 &&
        zy >= viewportRect.y - 120 &&
        zy <= viewportRect.y + viewportRect.height + 120
      );
    });
  }, [allZones, viewportRect]);

  const gridZones = useMemo(
    () => visibleZones.filter((z) => z.layout === 'grid' || z.layout === 'hex'),
    [visibleZones]
  );
  const stackAndListZones = useMemo(
    () => visibleZones.filter((z) => z.layout !== 'grid' && z.layout !== 'hex'),
    [visibleZones]
  );

  const maxCol = useMemo(
    () => Math.max(1, ...gridZones.map((z) => (z.coords?.col ?? 0) + 1)),
    [gridZones]
  );

  const renderPiece = (piece: Piece) => {
    const face = piece.faces[piece.activeFace] || piece.faces[0];
    return (
      <button
        key={piece.id}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPieceClick?.(piece);
        }}
        style={{
          backgroundColor: piece.hidden ? '#cbd5e1' : face?.color || '#E0562D',
          transform: `rotate(${piece.rotation}deg)`,
        }}
        className="px-2 py-1 rounded-lg text-[11px] font-bold text-white shadow-xs border border-white/40 cursor-pointer transition-transform hover:scale-105"
      >
        {piece.hidden ? '?' : face?.label || piece.name}
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 select-none">
      {gridZones.length > 0 && (
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${maxCol}, minmax(56px, 1fr))`,
          }}
        >
          {gridZones.map((zone) => {
            const pIds = state.zonePieces[zone.id] || [];
            return (
              <div
                key={zone.id}
                onClick={() => onZoneClick?.(zone)}
                className={`min-h-[64px] p-1.5 rounded-xl border bg-white flex flex-col justify-between cursor-pointer transition-colors ${
                  zone.ownerId ? 'border-[#E0562D] bg-orange-50/30' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-700 truncate">{zone.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pIds.map((pid) => state.pieces[pid]).filter(Boolean).map(renderPiece)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stackAndListZones.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stackAndListZones.map((zone) => {
            const pIds = state.zonePieces[zone.id] || [];
            return (
              <div
                key={zone.id}
                onClick={() => onZoneClick?.(zone)}
                className="min-w-[140px] max-w-[260px] p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate">{zone.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{pIds.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {zone.layout === 'stack' && pIds.length > 0
                    ? renderPiece(state.pieces[pIds[pIds.length - 1]])
                    : pIds.map((pid) => state.pieces[pid]).filter(Boolean).map(renderPiece)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
