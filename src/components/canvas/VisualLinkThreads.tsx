'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';

export function VisualLinkThreads() {
  const { activeSpace, threads, transform, updateThreadSourceOffset } = useStudySpace();

  const [draggingPin, setDraggingPin] = useState<{
    threadId: string;
    sourceItemId: string;
    startClientX: number;
    startClientY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    currentOffsetX: number;
    currentOffsetY: number;
  } | null>(null);

  const dragRef = useRef(draggingPin);
  dragRef.current = draggingPin;

  // Window listeners for smooth global drag of pushpin
  useEffect(() => {
    if (!draggingPin) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cur = dragRef.current;
      if (!cur) return;

      const deltaX = (e.clientX - cur.startClientX) / transform.scale;
      const deltaY = (e.clientY - cur.startClientY) / transform.scale;

      const nextOffset = {
        x: Math.round(cur.initialOffsetX + deltaX),
        y: Math.round(cur.initialOffsetY + deltaY)
      };

      setDraggingPin(prev => prev ? {
        ...prev,
        currentOffsetX: nextOffset.x,
        currentOffsetY: nextOffset.y
      } : null);

      updateThreadSourceOffset(cur.threadId, nextOffset);
    };

    const handleMouseUp = () => {
      setDraggingPin(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPin, transform.scale, updateThreadSourceOffset]);

  if (!threads || threads.length === 0) return null;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 100 }}
    >
      <defs>
        {/* Soft shadow for physical detective pinned thread */}
        <filter id="threadShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.3" />
        </filter>
      </defs>

      {threads.map(thread => {
        const sourceItem = activeSpace.items.find(i => i.id === thread.sourceItemId);
        const targetSticky = activeSpace.items.find(i => i.id === thread.targetStickyId);

        if (!sourceItem || !targetSticky) return null;

        const defaultOffsetX = sourceItem.type === 'book' ? 640 : 300;
        const defaultOffsetY = 140;

        const offsetX = draggingPin && draggingPin.threadId === thread.id
          ? draggingPin.currentOffsetX
          : (thread.sourceOffset?.x ?? defaultOffsetX);

        const offsetY = draggingPin && draggingPin.threadId === thread.id
          ? draggingPin.currentOffsetY
          : (thread.sourceOffset?.y ?? defaultOffsetY);

        // Source anchor on book / paper
        const startX = sourceItem.x + offsetX;
        const startY = sourceItem.y + offsetY;

        // Target anchor on sticky note header pin
        const endX = targetSticky.x + 24;
        const endY = targetSticky.y + 16;

        // Realistic hanging thread curve: Slight catenary gravity droop
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.hypot(deltaX, deltaY);
        const sag = Math.min(distance * 0.15, 45); // gravity sag

        const cp1X = startX + deltaX * 0.35;
        const cp1Y = startY + deltaY * 0.25 + sag;
        const cp2X = startX + deltaX * 0.65;
        const cp2Y = startY + deltaY * 0.75 + sag;

        const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
        const isThisPinDragging = draggingPin?.threadId === thread.id;

        return (
          <g key={thread.id} className="transition-all duration-75">
            {/* Thread Shadow under the yarn */}
            <path
              d={pathData}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeOpacity="0.18"
              filter="url(#threadShadow)"
            />

            {/* Realistic Red Detective String (Sợi chỉ đỏ ghim bảng thám tử) */}
            <path
              d={pathData}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Subtle fiber texture line */}
            <path
              d={pathData}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4 2"
              strokeOpacity="0.8"
            />

            {/* Source Physical Pushpin with Dedicated Small Hitbox */}
            <g 
              transform={`translate(${startX}, ${startY})`}
              className="pointer-events-auto"
              style={{ cursor: isThisPinDragging ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                setDraggingPin({
                  threadId: thread.id,
                  sourceItemId: thread.sourceItemId,
                  startClientX: e.clientX,
                  startClientY: e.clientY,
                  initialOffsetX: offsetX,
                  initialOffsetY: offsetY,
                  currentOffsetX: offsetX,
                  currentOffsetY: offsetY
                });
              }}
            >
              {/* Invisible Small Hitbox Circle (r=14) */}
              <circle r="14" fill="transparent" />

              {/* Pushpin visuals */}
              <circle r="6.5" fill="#000000" opacity="0.3" cx="1" cy="2" />
              <circle 
                r="5.5" 
                fill={isThisPinDragging ? '#b91c1c' : '#dc2626'} 
                stroke="#991b1b" 
                strokeWidth="1.2" 
                className="transition-transform hover:scale-125"
              />
              <circle r="2" fill="#fca5a5" cx="-1" cy="-1" />
            </g>

            {/* Target Physical Pushpin on Sticky Note */}
            <g transform={`translate(${endX}, ${endY})`}>
              <circle r="6" fill="#000000" opacity="0.25" cx="1" cy="2" />
              <circle r="5" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
              <circle r="2" fill="#fca5a5" cx="-1" cy="-1" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
