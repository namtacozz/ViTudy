'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { Minimap } from '../canvas/Minimap';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  LayoutGrid,
  Focus,
  Sparkles,
  Map
} from 'lucide-react';
import { RotateTwoWay } from '@/components/icons/RotateTwoWay';

export function BottomRightToolkit() {
  const { 
    transform, 
    zoomBy, 
    resetView, 
    tidyUpDesk,
    fitAllToScreen,
    isViewRotateMode,
    setIsViewRotateMode
  } = useStudySpace();

  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);

  // Global shortcut 'm' or 'M' to toggle minimap
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        setIsMinimapVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2.5 pointer-events-auto select-none">
      {/* Minimap Box (Toggled by M or reopening via the map button) */}
      <Minimap isVisible={isMinimapVisible} />

      {/* Standalone Circular Map Reopen Button (shown when map is hidden, per user request & image 1) */}
      {!isMinimapVisible && (
        <button
          onClick={() => setIsMinimapVisible(true)}
          title="Mở bản đồ bàn học (Phím M)"
          className="w-12 h-12 rounded-full bg-[#E0562D] hover:bg-[#c9451e] text-white shadow-lg border border-[#c9451e]/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer animate-fade-in group"
        >
          <Map className="w-5 h-5 text-white stroke-[2.4] group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Navigation & Zoom Controls Bar (+30% size, bold strokes & font) */}
      <div className="flex items-center gap-2 bg-white/95 border border-slate-300 rounded-2xl px-3 py-2 shadow-sm backdrop-blur-md text-slate-900">
        {/* Nút bật chế độ Xoay bàn học (nằm bên trái thanh zoom) */}
        <button
          title={isViewRotateMode ? "Đang bật chế độ xoay (Kéo bất kỳ đâu để xoay, nhấp để tắt)" : "Bật chế độ xoay bàn học (Kéo bất kỳ đâu để xoay)"}
          onClick={() => setIsViewRotateMode(prev => !prev)}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            isViewRotateMode 
              ? 'bg-[#E0562D] text-white shadow-xs' 
              : 'text-slate-800 hover:text-black hover:bg-slate-100'
          }`}
        >
          <RotateTwoWay className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200" />

        {/* Zoom Out */}
        <button
          title="Thu nhỏ"
          onClick={() => zoomBy(0.85)}
          className="p-2 text-slate-800 hover:text-black hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomOut className="w-5 h-5 stroke-[2.4]" />
        </button>

        {/* Zoom Scale Percentage & Miro-style Dropdown Menu */}
        <div className="relative">
          <button
            title="Tùy chọn hiển thị & Zoom (Nhấp để mở menu)"
            onClick={() => setIsZoomMenuOpen(prev => !prev)}
            className="px-2.5 py-1 text-xs font-mono text-slate-900 hover:text-black font-black hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            <span>{Math.round(transform.scale * 100)}%</span>
          </button>

          {isZoomMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-white/95 border border-slate-200 rounded-xl shadow-xl backdrop-blur-md p-1.5 flex flex-col gap-1 z-50 animate-fade-in text-xs font-semibold text-slate-800">
              <button
                onClick={() => {
                  fitAllToScreen?.();
                  setIsZoomMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors text-left text-slate-900 font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Maximize2 className="w-4 h-4 stroke-[2.4] text-slate-700" />
                  <span>Vừa vặn toàn bộ</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">Alt+1</span>
              </button>

              <button
                onClick={() => {
                  tidyUpDesk?.();
                  setIsZoomMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 text-slate-900 rounded-lg transition-colors text-left font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 stroke-[2.4] text-slate-900" />
                  <span>Dọn bàn gọn gàng</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-700">Tidy</span>
              </button>

              <button
                onClick={() => {
                  resetView();
                  setIsZoomMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors text-left text-slate-900 font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Focus className="w-4 h-4 stroke-[2.4] text-slate-700" />
                  <span>Đặt lại 100%</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">Ctrl+0</span>
              </button>

              <div className="w-full h-[1px] bg-slate-200 my-0.5" />

              <button
                onClick={() => {
                  setIsMinimapVisible(prev => !prev);
                  setIsZoomMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors text-left text-slate-900 font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 stroke-[2.4] text-slate-700" />
                  <span>{isMinimapVisible ? 'Ẩn bản đồ nhỏ' : 'Hiện bản đồ nhỏ'}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">M</span>
              </button>
            </div>
          )}
        </div>

        {/* Zoom In */}
        <button
          title="Phóng to"
          onClick={() => zoomBy(1.15)}
          className="p-2 text-slate-800 hover:text-black hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomIn className="w-5 h-5 stroke-[2.4]" />
        </button>

        {/* Fit to screen / Maximize */}
        <button
          title="Căn giữa bàn học"
          onClick={resetView}
          className="p-2 text-slate-800 hover:text-black hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <Maximize2 className="w-5 h-5 stroke-[2.4]" />
        </button>
      </div>
    </div>
  );
}
