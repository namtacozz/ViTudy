'use client';

import React from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';

export function VisualLinkThreads() {
  const { activeSpace, threads } = useStudySpace();

  if (!threads || threads.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <defs>
        <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
        </linearGradient>
        <filter id="threadGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {threads.map(thread => {
        const sourceItem = activeSpace.items.find(i => i.id === thread.sourceItemId);
        const targetSticky = activeSpace.items.find(i => i.id === thread.targetStickyId);

        if (!sourceItem || !targetSticky) return null;

        // Source anchor on book / paper
        const startX = sourceItem.x + (sourceItem.type === 'book' ? 640 : 300);
        const startY = sourceItem.y + 140;

        // Target anchor on sticky note pin
        const endX = targetSticky.x + 10;
        const endY = targetSticky.y + 24;

        // Bézier curve control points
        const deltaX = endX - startX;
        const cp1X = startX + deltaX * 0.45;
        const cp1Y = startY - 20;
        const cp2X = startX + deltaX * 0.55;
        const cp2Y = endY + 20;

        const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

        return (
          <g key={thread.id} className="transition-all duration-300">
            {/* Glow Backing */}
            <path
              d={pathData}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="5"
              strokeOpacity="0.25"
              filter="url(#threadGlow)"
            />

            {/* Main Visual Link Thread Line */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#threadGradient)"
              strokeWidth="2"
              strokeDasharray="6 3"
              className="animate-pulse"
            />

            {/* Source Pin Anchor Dot */}
            <circle
              cx={startX}
              cy={startY}
              r="4"
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Target Pin Anchor Dot */}
            <circle
              cx={endX}
              cy={endY}
              r="4"
              fill="#f59e0b"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
}
