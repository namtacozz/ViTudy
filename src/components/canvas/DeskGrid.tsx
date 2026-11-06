'use client';

import React from 'react';

export function DeskGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Dark Modern Study Desk Surface */}
      <div 
        className="w-[10000px] h-[10000px] -translate-x-[5000px] -translate-y-[5000px]"
        style={{
          backgroundColor: '#0c1017',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(12, 16, 23, 0.95) 70%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 60px 60px, 60px 60px'
        }}
      />
      
      {/* Subtle Central Desk Mat / Light Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1800px] h-[1100px] rounded-[40px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.04) 0%, rgba(15, 23, 42, 0) 70%)',
          border: '1px solid rgba(56, 189, 248, 0.05)'
        }}
      />
    </div>
  );
}
