'use client';

import React, { useState, useEffect } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';

export function Minimap() {
  const { activeSpace, transform, setTransform } = useStudySpace();

  // Minimap dimensions
  const miniWidth = 160;
  const miniHeight = 100;
  // World bounds approximation
  const worldSize = 3000;
  const scaleRatio = miniWidth / worldSize;

  // Window viewport representation with safe client hydration
  const [viewSize, setViewSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setViewSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setViewSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rectW = Math.max(16, (viewSize.width / transform.scale) * scaleRatio);
  const rectH = Math.max(12, (viewSize.height / transform.scale) * scaleRatio);

  const rectX = miniWidth / 2 - (transform.x * scaleRatio);
  const rectY = miniHeight / 2 - (transform.y * scaleRatio);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = (clickX - miniWidth / 2) / scaleRatio;
    const targetWorldY = (clickY - miniHeight / 2) / scaleRatio;

    setTransform(prev => ({
      ...prev,
      x: -targetWorldX,
      y: -targetWorldY
    }));
  };

  return (
    <div
      onClick={handleMinimapClick}
      style={{ width: miniWidth, height: miniHeight }}
      className="bg-slate-950/80 border border-slate-700/60 rounded-md relative overflow-hidden cursor-crosshair shadow-lg backdrop-blur-sm group"
      title="Bản đồ thu nhỏ bàn học (Click để di chuyển camera)"
    >
      {/* Center crosshair */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-800/60 pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800/60 pointer-events-none" />

      {/* Desk Items on Minimap */}
      {activeSpace.items.map(item => {
        const itemX = miniWidth / 2 + (item.x - 500) * scaleRatio;
        const itemY = miniHeight / 2 + (item.y - 300) * scaleRatio;
        const itemW = item.type === 'book' ? 24 : 14;
        const itemH = item.type === 'book' ? 18 : 16;

        return (
          <div
            key={item.id}
            style={{
              left: Math.max(2, Math.min(miniWidth - 10, itemX)),
              top: Math.max(2, Math.min(miniHeight - 10, itemY)),
              width: itemW,
              height: itemH
            }}
            className={`absolute rounded-[2px] transition-all pointer-events-none ${
              item.type === 'book'
                ? 'bg-sky-500/80'
                : item.type === 'paper'
                ? 'bg-emerald-400/80'
                : 'bg-amber-300/80'
            }`}
          />
        );
      })}

      {/* Viewport Frame */}
      <div
        style={{
          left: Math.max(0, Math.min(miniWidth - rectW, rectX)),
          top: Math.max(0, Math.min(miniHeight - rectH, rectY)),
          width: rectW,
          height: rectH
        }}
        className="absolute border border-cyan-400/80 bg-cyan-500/10 rounded-[2px] pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.3)]"
      />

      <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-slate-500 pointer-events-none">
        MAP
      </div>
    </div>
  );
}
