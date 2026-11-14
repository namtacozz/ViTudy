'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Layers, Shuffle, Send } from 'lucide-react';
import { GameCardDeck, GameCardItem, GamePawn } from '@/types/boardgame';

interface PrivateHandTrayProps {
  pawns: GamePawn[];
  activePawnId: string | null;
  decks: GameCardDeck[];
  playerHands: Record<string, GameCardItem[]>;
  onDrawCard: (deckId: string, pawnId: string) => void;
  onShuffleDeck: (deckId: string) => void;
  onPlayCard: (pawnId: string, cardId: string, faceUp: boolean) => void;
}

export function PrivateHandTray({
  pawns,
  activePawnId,
  decks,
  playerHands,
  onDrawCard,
  onShuffleDeck,
  onPlayCard,
}: PrivateHandTrayProps) {
  const [revealHand, setRevealHand] = useState(true);
  const [playFaceUp, setPlayFaceUp] = useState(true);

  const visiblePawns = pawns.filter((p) => !p.isInfiniteSupply);
  const currentPawn = visiblePawns.find((p) => p.id === activePawnId) || visiblePawns[0] || null;
  const hand = currentPawn ? playerHands[currentPawn.id] || [] : [];
  const primaryDeck = decks[0];

  if (!currentPawn && decks.length === 0) return null;

  return (
    <div
      className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#E0562D]" />
            Tay bài của {currentPawn ? currentPawn.name : 'Người chơi'} ({hand.length})
          </span>
          <button
            type="button"
            onClick={() => setRevealHand((v) => !v)}
            className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
            title="Ẩn/hiện tay bài bí mật"
          >
            {revealHand ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {revealHand ? 'Ẩn tay' : 'Xem tay'}
          </button>
          <button
            type="button"
            onClick={() => setPlayFaceUp((v) => !v)}
            className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold transition-colors ${
              playFaceUp
                ? 'bg-orange-50 border-[#E0562D] text-[#E0562D]'
                : 'bg-slate-800 border-slate-800 text-white'
            }`}
            title="Chọn chế độ đánh bài ngửa hoặc úp"
          >
            Đánh: {playFaceUp ? 'Ngửa' : 'Úp'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {visiblePawns
            .filter((p) => p.id !== currentPawn?.id)
            .map((p) => (
              <span
                key={p.id}
                className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-medium"
                title={`Số lá trên tay của ${p.name}`}
              >
                {p.name}: {(playerHands[p.id] || []).length} lá
              </span>
            ))}

          {primaryDeck && currentPawn && (
            <>
              <button
                type="button"
                onClick={() => onShuffleDeck(primaryDeck.id)}
                className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                title={`Xào bộ bài ${primaryDeck.name}`}
              >
                <Shuffle className="w-3 h-3" />
                Xào ({primaryDeck.cards.length})
              </button>
              <button
                type="button"
                onClick={() => onDrawCard(primaryDeck.id, currentPawn.id)}
                disabled={primaryDeck.cards.length === 0}
                className="px-2.5 py-1 rounded-md bg-[#E0562D] hover:bg-[#c9451e] disabled:opacity-40 text-white text-[11px] font-bold"
              >
                Rút bài
              </button>
            </>
          )}
        </div>
      </div>

      {hand.length > 0 && (
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {hand.map((card) => (
            <div
              key={card.id}
              className="shrink-0 w-36 rounded-lg border border-slate-200 bg-white p-2 flex flex-col justify-between gap-1.5 shadow-sm"
            >
              {revealHand ? (
                <>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: card.color || '#E0562D' }}
                      />
                      <span className="text-[11px] font-bold text-slate-900 truncate">
                        {card.title}
                      </span>
                    </div>
                    {card.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {card.description}
                      </p>
                    )}
                  </div>
                  {currentPawn && (
                    <button
                      type="button"
                      onClick={() => onPlayCard(currentPawn.id, card.id, playFaceUp)}
                      className="w-full py-1 rounded bg-slate-900 hover:bg-[#E0562D] text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Send className="w-2.5 h-2.5" />
                      Đánh {playFaceUp ? 'ngửa' : 'úp'}
                    </button>
                  )}
                </>
              ) : (
                <div className="h-16 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                  Lá bài bí mật
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
