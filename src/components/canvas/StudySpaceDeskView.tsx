'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useStudySpace } from '@/context/StudySpaceContext';
import { InfiniteDesk } from './InfiniteDesk';
import { VrFrameOverlay } from '../hud/VrFrameOverlay';
import { TopLeftNav } from '../hud/TopLeftNav';
import { TopRightWallet } from '../hud/TopRightWallet';
import { BottomLeftKnowledge } from '../hud/BottomLeftKnowledge';
import { BottomRightToolkit } from '../hud/BottomRightToolkit';
import { LeftCreationBar } from '../hud/LeftCreationBar';
import { MultiplayerBar } from '../hud/MultiplayerBar';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function StudySpaceDeskView() {
  const { focusedItemId } = useStudySpace();
  const isFocusMode = !!focusedItemId;

  const [showLeftInFocus, setShowLeftInFocus] = useState(false);
  const [showTopInFocus, setShowTopInFocus] = useState(false);
  const [showBottomInFocus, setShowBottomInFocus] = useState(false);

  // Automatically collapse all HUDs when entering focus mode
  useEffect(() => {
    if (isFocusMode) {
      setShowLeftInFocus(false);
      setShowTopInFocus(false);
      setShowBottomInFocus(false);
    }
  }, [isFocusMode]);

  const isLeftVisible = !isFocusMode || showLeftInFocus;
  const isTopVisible = !isFocusMode || showTopInFocus;
  const isBottomVisible = !isFocusMode || showBottomInFocus;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white select-none">
      {/* 2.5D Infinite Canvas Desk */}
      <InfiniteDesk />

      {/* VR HUD Frame Brackets & Atmospheric Vignette (fades out in focus mode for zero distraction) */}
      <div className={clsx("transition-opacity duration-300", isFocusMode ? "opacity-30" : "opacity-100")}>
        <VrFrameOverlay />
      </div>

      {/* ================= LEFT TOOL CREATION BAR ================= */}
      <div 
        className={clsx(
          "fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-transform duration-300 ease-out flex items-center",
          isLeftVisible ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <LeftCreationBar />

        {/* Retract button sticking to midpoint of left bar pointing towards the wall */}
        {isFocusMode && isLeftVisible && (
          <button
            type="button"
            onClick={() => setShowLeftInFocus(false)}
            title="Thu gọn thanh công cụ vào vách"
            className="ml-1 z-50 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-r-xl p-1 shadow-md cursor-pointer transition-all hover:bg-slate-50 active:scale-95 pointer-events-auto"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.4]" />
          </button>
        )}
      </div>

      {/* Peek button on left wall when Left bar is collapsed in focus mode */}
      {isFocusMode && !isLeftVisible && (
        <button
          type="button"
          onClick={() => setShowLeftInFocus(true)}
          title="Mở thanh công cụ"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-l-0 border-slate-300 rounded-r-xl p-2 shadow-md cursor-pointer transition-transform hover:translate-x-0.5 active:scale-95 animate-fade-in pointer-events-auto"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.4]" />
        </button>
      )}

      {/* ================= TOP NAV & WALLET HUD ================= */}
      <div 
        className={clsx(
          "fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-out pointer-events-none",
          isTopVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="relative w-full h-full pointer-events-auto">
          <TopLeftNav />
          <TopRightWallet />

          {/* Retract button sticking to midpoint of top bar pointing upwards */}
          {isFocusMode && isTopVisible && (
            <button
              type="button"
              onClick={() => setShowTopInFocus(false)}
              title="Thu gọn thanh điều hướng lên trên"
              className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-b-xl px-3 py-0.5 shadow-md cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-center active:scale-95 pointer-events-auto"
            >
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
          )}
        </div>
      </div>

      {/* Peek button on top wall when Top bar is collapsed in focus mode */}
      {isFocusMode && !isTopVisible && (
        <button
          type="button"
          onClick={() => setShowTopInFocus(true)}
          title="Hiển thị Menu và Điểm danh"
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-t-0 border-slate-300 rounded-b-xl px-3 py-1 shadow-md cursor-pointer transition-transform hover:translate-y-0.5 active:scale-95 animate-fade-in flex items-center gap-1.5 text-xs font-bold pointer-events-auto"
        >
          <ChevronDown className="w-3.5 h-3.5 stroke-[2.4]" />
          <span>Menu</span>
        </button>
      )}

      {/* ================= BOTTOM TOOLS & KNOWLEDGE HUD ================= */}
      <div 
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out pointer-events-none",
          isBottomVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="relative w-full h-full pointer-events-auto">
          <BottomLeftKnowledge />
          <BottomRightToolkit />
          <MultiplayerBar />

          {/* Retract button sticking to midpoint of bottom bar pointing downwards */}
          {isFocusMode && isBottomVisible && (
            <button
              type="button"
              onClick={() => setShowBottomInFocus(false)}
              title="Thu gọn công cụ xuống dưới"
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-t-xl px-3 py-0.5 shadow-md cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-center active:scale-95 pointer-events-auto"
            >
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
          )}
        </div>
      </div>

      {/* Peek button on bottom wall when Bottom bar is collapsed in focus mode */}
      {isFocusMode && !isBottomVisible && (
        <button
          type="button"
          onClick={() => setShowBottomInFocus(true)}
          title="Hiển thị thanh công cụ bàn học"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-b-0 border-slate-300 rounded-t-xl px-3 py-1 shadow-md cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-95 animate-fade-in flex items-center gap-1.5 text-xs font-bold pointer-events-auto"
        >
          <ChevronUp className="w-3.5 h-3.5 stroke-[2.4]" />
          <span>Công cụ</span>
        </button>
      )}
    </div>
  );
}
