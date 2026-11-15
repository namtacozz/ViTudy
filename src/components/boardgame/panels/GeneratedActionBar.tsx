'use client';

import React, { useMemo } from 'react';
import {
  EngineState,
  EntityId,
  GameAction,
  GamePackageV2,
  evaluateExpr,
  getActivePlayerId,
} from '@/engine/boardgame';

interface GeneratedActionBarProps {
  pkg: GamePackageV2;
  state: EngineState;
  viewerPlayerId?: EntityId | null;
  onAction: (action: GameAction) => void;
}

/**
 * Generates action buttons dynamically from GamePackageV2 UI bindings & phase rules (Cluster F).
 */
export function GeneratedActionBar({
  pkg,
  state,
  viewerPlayerId,
  onAction,
}: GeneratedActionBarProps) {
  const activePlayerId = getActivePlayerId(state);
  const canAct = !viewerPlayerId || viewerPlayerId === activePlayerId;

  const visibleButtons = useMemo(() => {
    if (state.status !== 'playing' || state.pending) return [];
    return pkg.ui.buttons.filter((btn) => {
      if (btn.phases && btn.phases.length > 0 && !btn.phases.includes(state.turn.phase)) {
        return false;
      }
      if (btn.condition !== undefined) {
        return Boolean(
          evaluateExpr(btn.condition, state, { playerId: activePlayerId })
        );
      }
      return true;
    });
  }, [pkg.ui.buttons, state, activePlayerId]);

  if (state.status === 'idle') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAction({ type: 'start_game' })}
          className="px-4 py-2 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold cursor-pointer"
        >
          Bắt đầu ván đấu
        </button>
      </div>
    );
  }

  if (state.status === 'ended') {
    return (
      <div className="px-3 py-2 rounded-xl bg-orange-50 border border-[#FFEDD5] text-xs font-bold text-[#9A3412]">
        Ván đấu kết thúc · Người thắng: {state.winnerIds.join(', ') || 'Hòa'}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleButtons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          disabled={!canAct || !activePlayerId}
          onClick={() =>
            activePlayerId &&
            onAction({
              type: 'press_button',
              playerId: activePlayerId,
              buttonId: btn.id,
            })
          }
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#E0562D] hover:text-[#E0562D] disabled:opacity-50 text-xs font-bold text-slate-800 cursor-pointer transition-colors"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
