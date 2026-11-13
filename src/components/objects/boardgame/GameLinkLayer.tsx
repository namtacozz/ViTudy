'use client';

import React from 'react';
import { BoardTile, GameCardDeck, GameNodeLink } from '@/types/boardgame';

interface GameLinkLayerProps {
  tiles: BoardTile[];
  decks: GameCardDeck[];
  links: GameNodeLink[];
  isEditMode: boolean;
  draftConnection?: { fromX: number; fromY: number; toX: number; toY: number } | null;
}

export function GameLinkLayer({
  tiles,
  decks,
  links,
  isEditMode,
  draftConnection,
}: GameLinkLayerProps) {
  if (!isEditMode && !draftConnection) return null;

  const findCenter = (id: string): { x: number; y: number } | null => {
    const t = tiles.find((item) => item.id === id);
    if (t) return { x: t.relX + t.width / 2, y: t.relY + t.height / 2 };
    const d = decks.find((item) => item.id === id);
    if (d) return { x: d.relX + d.width / 2, y: d.relY + d.height / 2 };
    return null;
  };

  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-20">
      {links.map((link) => {
        const p1 = findCenter(link.sourceId);
        const p2 = findCenter(link.targetId);
        if (!p1 || !p2) return null;
        const strokeColor =
          link.linkType === 'on_step_show_info'
            ? '#E0562D'
            : link.linkType === 'on_step_draw_deck'
            ? '#2563eb'
            : '#16a34a';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 24;
        return (
          <g key={link.id}>
            <path
              d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <circle cx={p1.x} cy={p1.y} r="4" fill={strokeColor} />
            <circle cx={p2.x} cy={p2.y} r="4" fill={strokeColor} />
          </g>
        );
      })}
      {draftConnection && (
        <line
          x1={draftConnection.fromX}
          y1={draftConnection.fromY}
          x2={draftConnection.toX}
          y2={draftConnection.toY}
          stroke="#E0562D"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
      )}
    </svg>
  );
}
