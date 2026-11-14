'use client';

import React, { useState } from 'react';
import { BoardTile } from '@/types/boardgame';
import { TopDownDice3D } from './TopDownDice3D';
import { Trash2 } from 'lucide-react';

interface DiceLayerProps {
  diceTiles: BoardTile[];
  isEditMode: boolean;
  onRollComplete: (tileId: string, values: number[], total: number) => void;
  onDeleteTile: (tileId: string) => void;
}

export const DiceLayer = React.memo(function DiceLayer({
  diceTiles,
  isEditMode,
  onRollComplete,
  onDeleteTile,
}: DiceLayerProps) {
  const [mapOverlayEl, setMapOverlayEl] = useState<HTMLDivElement | null>(null);

  return (
    <>
      {/* Canvas 3D bao phủ toàn bộ map được chọn (pointer-events-none để không chặn click ô cờ) */}
      <div
        ref={setMapOverlayEl}
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
      />

      {diceTiles.map((tile) => (
        <div
          key={tile.id}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: tile.relX,
            top: tile.relY,
            width: tile.width,
            height: tile.height,
          }}
          className="interactive-control rounded-full bg-white/85 border-2 border-dashed border-[#E0562D]/50 shadow-inner flex flex-col items-center justify-center p-2 group z-20"
        >
          {isEditMode && (
            <button
              type="button"
              title="Xóa ô xúc xắc"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTile(tile.id);
              }}
              className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-rose-600 flex items-center justify-center shadow cursor-pointer z-40"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <TopDownDice3D
            diceCount={tile.diceConfig?.diceCount || 2}
            lastValues={tile.diceConfig?.lastRollValues}
            overlayContainer={mapOverlayEl}
            dropZone={{
              centerX: tile.relX + tile.width / 2,
              centerY: tile.relY + tile.height / 2,
              width: tile.width,
              height: tile.height,
            }}
            onRollComplete={(values: number[]) => {
              const total = values.reduce((sum, v) => sum + v, 0);
              onRollComplete(tile.id, values, total);
            }}
          />
        </div>
      ))}
    </>
  );
});
