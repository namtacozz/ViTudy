'use client';

import React from 'react';

export function VrFrameOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* 4 Corner Sci-Fi / VR Brackets */}
      {/* Top Left */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-sm" />
      {/* Top Right */}
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-sm" />
      {/* Bottom Left */}
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-sm" />
      {/* Bottom Right */}
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500/30 rounded-br-sm" />

      {/* Atmospheric Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 70%, rgba(10, 15, 26, 0.45) 100%)'
        }}
      />

      {/* Subtle VR HUD Mode Indicator at bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-cyan-500/60 bg-slate-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/20 backdrop-blur-[2px]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>STUDYSPACE 2.5D HUD ACTIVE</span>
      </div>
    </div>
  );
}
