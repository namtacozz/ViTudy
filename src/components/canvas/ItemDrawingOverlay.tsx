'use client';

import React, { useMemo } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { pointsToSvgPath } from '@/utils/strokeSegmentation';

export const ItemDrawingOverlay = React.memo(function ItemDrawingOverlay({
  itemId,
}: {
  itemId: string;
}) {
  const { strokes } = useStudySpace();
  const itemStrokes = useMemo(
    () => strokes.filter((s) => s.attachedToItemId === itemId),
    [strokes, itemId]
  );

  if (itemStrokes.length === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none z-30 overflow-hidden w-full h-full">
      {itemStrokes.map((stroke) => {
        const isHigh = stroke.isHighlighter;
        const strokeWidth = isHigh ? (stroke.width || 14) : (stroke.width || 2.5);
        const opacity = isHigh ? 0.65 : 0.9;
        const blendMode = isHigh ? ('multiply' as const) : ('normal' as const);

        if (stroke.points.length === 1) {
          return (
            <circle
              key={stroke.id}
              cx={stroke.points[0].x}
              cy={stroke.points[0].y}
              r={strokeWidth / 2}
              fill={stroke.color}
              opacity={opacity}
              style={{ mixBlendMode: blendMode }}
            />
          );
        }

        const pathData = pointsToSvgPath(stroke.points);
        if (!pathData) return null;

        return (
          <path
            key={stroke.id}
            d={pathData}
            stroke={stroke.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={opacity}
            style={{ mixBlendMode: blendMode }}
            fill="none"
          />
        );
      })}
    </svg>
  );
});
