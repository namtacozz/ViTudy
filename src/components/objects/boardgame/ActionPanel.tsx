'use client';

import React from 'react';
import { BoardGamePackage, calculateBalanceTotal } from '@/types/boardgame';
import {
  computeTileRent,
  findDeedForTile,
  getActivePlayerId,
} from '@/lib/boardGameEngine';
import { Undo2, Redo2, SkipForward, Home, Trophy, Move, ArrowLeftRight } from 'lucide-react';

interface ActionPanelProps {
  pkg: BoardGamePackage;
  isViewer: boolean;
  onBuyProperty: (pawnId: string, tileId: string) => void;
  onPayRent: (pawnId: string, tileId: string) => void;
  onUpgradeHouse: (pawnId: string, tileId: string) => void;
  onMortgageProperty: (pawnId: string, tileId: string) => void;
  onDeclareBankruptcy: (pawnId: string) => void;
  onEndTurn: () => void;
  onUndoMove: () => void;
  onRedoMove: () => void;
  onToggleFreeDrag: () => void;
  onAdjustResource?: (pawnId: string, resourceId: string, delta: number) => void;
  onReverseTurn?: () => void;
}

export const ActionPanel = React.memo(function ActionPanel({
  pkg,
  isViewer,
  onBuyProperty,
  onPayRent,
  onUpgradeHouse,
  onMortgageProperty,
  onDeclareBankruptcy,
  onEndTurn,
  onUndoMove,
  onRedoMove,
  onToggleFreeDrag,
  onAdjustResource,
  onReverseTurn,
}: ActionPanelProps) {
  const ruleMode = pkg.ruleMode || 'monopoly';
  const isMonopoly = ruleMode === 'monopoly';
  const activeId = getActivePlayerId(pkg);
  const activePawn = pkg.pawns.find((p) => p.id === activeId);
  const currentTile = activePawn?.currentTileId
    ? pkg.tiles.find((t) => t.id === activePawn.currentTileId)
    : undefined;

  const deed = currentTile ? findDeedForTile(pkg, currentTile.id) : null;
  const ownerId = deed?.card.ownerPlayerId || null;
  const ownerPawn = ownerId ? pkg.pawns.find((p) => p.id === ownerId) : null;
  const balance = activePawn
    ? calculateBalanceTotal(pkg.matchState.playerBalances?.[activePawn.id])
    : 0;

  const canUndo = (pkg.matchState.undoStack?.length || 0) > 0;
  const canRedo = (pkg.matchState.redoStack?.length || 0) > 0;
  const winner = pkg.matchState.winnerId
    ? pkg.pawns.find((p) => p.id === pkg.matchState.winnerId)
    : null;

  if (winner) {
    return (
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="interactive-control absolute -bottom-14 left-1/2 -translate-x-1/2 bg-white border-2 border-[#E0562D] rounded-xl px-4 py-2 shadow-xl flex items-center gap-3 whitespace-nowrap z-30"
      >
        <Trophy className="w-4 h-4 text-[#E0562D]" />
        <span className="text-xs font-black text-slate-900">
          Người chiến thắng: {winner.name}
        </span>
      </div>
    );
  }

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="interactive-control absolute -bottom-14 left-0 right-0 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-1.5 shadow-lg z-30"
    >
      <div className="flex items-center gap-2 min-w-0">
        {activePawn && (
          <span
            style={{ backgroundColor: activePawn.color }}
            className="w-3 h-3 rounded-full shrink-0"
          />
        )}
        <span className="text-xs font-bold text-slate-800 truncate">
          Lượt: {activePawn?.name || 'Chưa có quân'}
        </span>
        {isMonopoly && (
          <span className="text-[11px] font-mono text-slate-500">
            {balance.toLocaleString('vi-VN')}đ
          </span>
        )}
        {currentTile && (
          <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
            • Đứng tại <b>{currentTile.title || currentTile.id}</b>
          </span>
        )}
      </div>

      {!isViewer && activePawn && (
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {isMonopoly &&
            currentTile &&
            currentTile.role === 'normal_cell' &&
            currentTile.price &&
            currentTile.price > 0 &&
            !ownerId && (
              <button
                type="button"
                onClick={() => onBuyProperty(activePawn.id, currentTile.id)}
                className="px-2.5 py-1 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-[11px] font-bold cursor-pointer"
              >
                Mua ({Math.round(currentTile.price / 1000)}k)
              </button>
            )}

          {isMonopoly && currentTile && ownerId === activePawn.id && (
            <>
              <button
                type="button"
                onClick={() => onUpgradeHouse(activePawn.id, currentTile.id)}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3 h-3" />
                <span>Nâng nhà</span>
              </button>
              {!currentTile.propertyDetails?.isMortgaged && (
                <button
                  type="button"
                  onClick={() => onMortgageProperty(activePawn.id, currentTile.id)}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  Thế chấp
                </button>
              )}
            </>
          )}

          {isMonopoly && currentTile && ownerId && ownerId !== activePawn.id && ownerPawn && (
            <button
              type="button"
              onClick={() => onPayRent(activePawn.id, currentTile.id)}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
            >
              Trả thuê {ownerPawn.name} ({Math.round(computeTileRent(currentTile) / 1000)}k)
            </button>
          )}

          <button
            type="button"
            title="Hoàn tác bước chơi"
            onClick={onUndoMove}
            disabled={!canUndo}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-35 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Làm lại bước chơi"
            onClick={onRedoMove}
            disabled={!canRedo}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-35 cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Chế độ kéo quân tự do"
            onClick={onToggleFreeDrag}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              pkg.matchState.freeDragMode
                ? 'bg-orange-50 border border-[#E0562D] text-[#E0562D]'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Move className="w-3 h-3" />
            <span>Tự do</span>
          </button>
          {isMonopoly && balance <= 0 && (
            <button
              type="button"
              onClick={() => onDeclareBankruptcy(activePawn.id)}
              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
            >
              Phá sản
            </button>
          )}
          {!isMonopoly &&
            (pkg.resources || []).map((res) => {
              const val =
                pkg.matchState.playerResources?.[activePawn.id]?.[res.id] ?? res.initialAmount;
              return (
                <div
                  key={res.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[10px]"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: res.color }}
                  />
                  <span className="font-semibold text-slate-700">
                    {res.name}: {val}
                  </span>
                  {onAdjustResource && (
                    <>
                      <button
                        type="button"
                        onClick={() => onAdjustResource(activePawn.id, res.id, -1)}
                        className="px-1 rounded hover:bg-slate-100 font-bold text-slate-600"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustResource(activePawn.id, res.id, 1)}
                        className="px-1 rounded hover:bg-slate-100 font-bold text-[#E0562D]"
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          {!isMonopoly && onReverseTurn && (
            <button
              type="button"
              onClick={onReverseTurn}
              title="Đảo chiều lượt chơi"
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>{(pkg.matchState.turnDirection ?? 1) === -1 ? 'Ngược' : 'Thuận'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onEndTurn}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Hết lượt</span>
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
});
