'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { Minimap } from '../canvas/Minimap';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  StickyNote, 
  Highlighter, 
  PenTool, 
  Lock, 
  Unlock 
} from 'lucide-react';

export function BottomRightToolkit() {
  const { 
    transform, 
    zoomBy, 
    resetView, 
    addStickyNote, 
    isPanLocked, 
    togglePanLock 
  } = useStudySpace();

  const [activeTool, setActiveTool] = useState<'cursor' | 'highlighter' | 'pen'>('cursor');

  return (
    <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Minimap Box */}
      <Minimap />

      {/* Toolkit & Zoom Controls Bar */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl px-2 py-1.5 shadow-hud-glow backdrop-blur-md">
        {/* Add Sticky Note Button */}
        <button
          title="Tạo tờ giấy ghi chú mới dán lên bàn"
          onClick={() => addStickyNote('Ghi chú học tập mới...', 500, 300)}
          className="flex items-center gap-1 px-2 py-1 bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 rounded-lg text-xs font-medium transition-all"
        >
          <StickyNote className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">+ Note</span>
        </button>

        {/* Highlighter Tool Toggle */}
        <button
          title="Bút dạ quang đánh dấu"
          onClick={() => setActiveTool(activeTool === 'highlighter' ? 'cursor' : 'highlighter')}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            activeTool === 'highlighter'
              ? 'bg-yellow-400 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {/* Freehand Pen Tool Toggle */}
        <button
          title="Bút vẽ tay / Gạch chân tự do"
          onClick={() => setActiveTool(activeTool === 'pen' ? 'cursor' : 'pen')}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            activeTool === 'pen'
              ? 'bg-cyan-400 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        {/* Lock Pan View Toggle */}
        <button
          title={isPanLocked ? 'Mở khoá di chuyển bàn' : 'Khung nhìn cố định'}
          onClick={togglePanLock}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            isPanLocked ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {isPanLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Zoom Out */}
        <button
          title="Thu nhỏ (-)"
          onClick={() => zoomBy(0.85)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Scale Percentage & Reset Button */}
        <button
          title="Nhấn để reset về 100%"
          onClick={resetView}
          className="px-1.5 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors"
        >
          {Math.round(transform.scale * 100)}%
        </button>

        {/* Zoom In */}
        <button
          title="Phóng to (+)"
          onClick={() => zoomBy(1.15)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
