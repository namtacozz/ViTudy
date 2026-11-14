'use client';

import React, { useSyncExternalStore } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { getActiveStroke, subscribeActiveStroke } from '@/lib/activeStrokeStore';
import { pointsToSvgPath } from '@/utils/strokeSegmentation';

const MemoizedStroke = React.memo(function MemoizedStroke({
  stroke,
}: {
  stroke: import('@/types/studyspace').DrawingStroke;
}) {
  const isHigh = stroke.isHighlighter;
  const strokeWidth = isHigh ? (stroke.width || 14) : (stroke.width || 2.5);
  const opacity = isHigh ? 0.65 : 0.9;
  const blendMode = isHigh ? ('multiply' as const) : ('normal' as const);

  if (stroke.points.length === 1) {
    return (
      <circle
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
});

const ActiveStrokeLayer = React.memo(function ActiveStrokeLayer() {
  const currentStroke = useSyncExternalStore(
    subscribeActiveStroke,
    getActiveStroke,
    () => null
  );

  if (!currentStroke || currentStroke.points.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: 10000, height: 10000, left: -5000, top: -5000, zIndex: 1000 }}
    >
      <g transform="translate(5000, 5000)">
        <MemoizedStroke stroke={currentStroke} />
      </g>
    </svg>
  );
});

export const DeskDrawingCanvas = React.memo(function DeskDrawingCanvas() {
  const { strokes } = useStudySpace();

  const deskStrokes = React.useMemo(() => {
    return strokes.filter((s) => !s.attachedToItemId);
  }, [strokes]);

  return (
    <>
      <svg
        className="absolute inset-0 pointer-events-none z-10 overflow-visible"
        style={{ width: 10000, height: 10000, left: -5000, top: -5000 }}
      >
        <g transform="translate(5000, 5000)">
          {deskStrokes.map((s) => (
            <MemoizedStroke key={s.id} stroke={s} />
          ))}
        </g>
      </svg>

      <ActiveStrokeLayer />
    </>
  );
});
