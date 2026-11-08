'use client';

import React from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';

export function DeskDrawingCanvas() {
  const { strokes, currentStroke } = useStudySpace();

  // Helper to convert points to smooth SVG Path data using midpoint quadratic curves
  const pointsToSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  };

  const renderStrokeElement = (stroke: import('@/types/studyspace').DrawingStroke) => {
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
  };

  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-25 overflow-visible"
      style={{ width: 10000, height: 10000, left: -5000, top: -5000 }}
    >
      <g transform="translate(5000, 5000)">
        {/* Completed Desk Strokes (not attached to any document) */}
        {strokes.filter(s => !s.attachedToItemId).map(renderStrokeElement)}

        {/* Current Active Stroke */}
        {currentStroke && currentStroke.points.length > 0 && renderStrokeElement(currentStroke)}
      </g>
    </svg>
  );
}
