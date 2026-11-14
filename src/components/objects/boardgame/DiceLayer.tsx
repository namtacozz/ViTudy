'use client';

import React from 'react';
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
  return (
    <>
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
          className="interactive-control rounded-full bg-white/90 border-2 border-dashed border-[#E0562D]/50 shadow-inner flex flex-col items-center justify-center p-2 group"
        >
          {isEditMode && (
            <button
              type="button"
              title="Xóa ô xúc xắc"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTile(tile.id);
              }}
              className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-rose-600 flex items-center justify-center shadow cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <TopDownDice3D
            diceCount={tile.diceConfig?.diceCount || 2}
            lastValues={tile.diceConfig?.lastRollValues}
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
