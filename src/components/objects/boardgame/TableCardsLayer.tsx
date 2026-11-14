'use client';

import React from 'react';
import { RotateCw, Eye, Undo2 } from 'lucide-react';
import { TableCardInstance } from '@/types/boardgame';

interface TableCardsLayerProps {
  tableCards: TableCardInstance[];
  isPlayMode: boolean;
  onFlipCard: (instanceId: string) => void;
  onTapCard: (instanceId: string) => void;
  onReturnCard: (instanceId: string) => void;
}

export function TableCardsLayer({
  tableCards,
  isPlayMode,
  onFlipCard,
  onTapCard,
  onReturnCard,
}: TableCardsLayerProps) {
  if (!tableCards || tableCards.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-15">
      {tableCards.map((tc) => (
        <div
          key={tc.instanceId}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            left: tc.relX,
            top: tc.relY,
            transform: tc.tapped ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
          className="absolute pointer-events-auto w-24 min-h-[112px] rounded-lg border border-slate-300 shadow-md transition-transform duration-150 group select-none overflow-hidden bg-white"
        >
          {tc.faceUp ? (
            <div className="p-2 flex flex-col justify-between h-full min-h-[112px]">
              <div>
                <div
                  className="h-1.5 w-full rounded-full mb-1.5"
                  style={{ backgroundColor: tc.card.color || '#E0562D' }}
                />
                <div className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2">
                  {tc.card.title}
                </div>
                {tc.card.description && (
                  <div className="text-[9px] text-slate-500 mt-1 line-clamp-3 leading-tight">
                    {tc.card.description}
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-400 font-medium mt-1">
                {tc.tapped ? 'Đã xoay 90°' : 'Ngửa'}
              </div>
            </div>
          ) : (
            <div className="w-full h-full min-h-[112px] bg-slate-800 flex flex-col items-center justify-center p-2 text-center">
              <div className="w-7 h-7 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-black text-slate-300 mb-1">
                ?
              </div>
              <span className="text-[10px] font-semibold text-slate-300">Bài úp</span>
            </div>
          )}

          {isPlayMode && (
            <div className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded p-0.5 border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => onFlipCard(tc.instanceId)}
                className="p-1 rounded hover:bg-slate-100 text-slate-700"
                title="Lật ngửa / úp"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onTapCard(tc.instanceId)}
                className="p-1 rounded hover:bg-slate-100 text-slate-700"
                title="Xoay 90° (Tap)"
              >
                <RotateCw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onReturnCard(tc.instanceId)}
                className="p-1 rounded hover:bg-rose-50 text-rose-600"
                title="Thu về bộ bài"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
