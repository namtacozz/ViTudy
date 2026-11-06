'use client';

import React from 'react';

export function DeskGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden bg-[#0c1017]">
      {/* High-performance CSS Grid Pattern (100% viewport, zero massive memory allocation) */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Subtle Central Ambient Lighting */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 75%)'
        }}
      />
    </div>
  );
}
