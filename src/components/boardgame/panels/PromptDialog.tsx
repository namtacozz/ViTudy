'use client';

import React from 'react';
import { EngineState, EntityId, GameAction } from '@/engine/boardgame';

interface PromptDialogProps {
  state: EngineState;
  viewerPlayerId?: EntityId | null;
  onAction: (action: GameAction) => void;
}

/**
 * Renders state.pending choices and dispatches resolve_input (Cluster F).
 */
export function PromptDialog({
  state,
  viewerPlayerId,
  onAction,
}: PromptDialogProps) {
  const pending = state.pending;
  if (!pending) return null;

  const isTargetPlayer = !viewerPlayerId || viewerPlayerId === pending.playerId;

  return (
    <div className="p-3.5 rounded-2xl bg-white border-2 border-[#E0562D] shadow-lg space-y-2.5">
      <div className="text-xs font-black text-slate-900">{pending.prompt}</div>
      {!isTargetPlayer ? (
        <div className="text-xs text-slate-500">
          Đang chờ người chơi {pending.playerId} lựa chọn...
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {pending.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() =>
                onAction({
                  type: 'resolve_input',
                  playerId: pending.playerId,
                  choiceId: opt.id,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] hover:bg-[#E0562D] hover:text-white text-xs font-bold text-[#9A3412] cursor-pointer transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
