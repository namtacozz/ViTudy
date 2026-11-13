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
import { ActivityService } from '@/services/ActivityService';
import { OnboardingTour } from '../onboarding/OnboardingTour';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getAssetPath } from '@/lib/assets';

export default function StudySpaceDeskView() {
  const { focusedItemId, isDeskReady } = useStudySpace();
  const isFocusMode = !!focusedItemId;

  // Independent drawer states for each of the 5 HUD islands in focus mode
  const [showTopLeftInFocus, setShowTopLeftInFocus] = useState(false);
  const [showTopRightInFocus, setShowTopRightInFocus] = useState(false);
  const [showLeftInFocus, setShowLeftInFocus] = useState(false);
  const [showBottomLeftInFocus, setShowBottomLeftInFocus] = useState(false);
  const [showBottomRightInFocus, setShowBottomRightInFocus] = useState(false);

  // Automatically collapse all 5 HUDs when entering focus mode
  useEffect(() => {
    if (isFocusMode) {
      setShowTopLeftInFocus(false);
      setShowTopRightInFocus(false);
      setShowLeftInFocus(false);
      setShowBottomLeftInFocus(false);
      setShowBottomRightInFocus(false);
    }
  }, [isFocusMode]);

  useEffect(() => {
    let lastActivityTime = Date.now();
    const handleActivity = () => {
      lastActivityTime = Date.now();
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('pointerdown', handleActivity);

    const stopHeartbeat = ActivityService.startHeartbeat(() => {
      return Date.now() - lastActivityTime < 60000;
    });

    return () => {
      stopHeartbeat();
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white select-none">
      {/* Desk Loading Overlay: chờ tải đủ ghi chú, tài liệu, sticker, GIF và nét vẽ trước khi mở bàn */}
      {!isDeskReady && (
        <div
          className="fixed inset-0 z-[9990] bg-slate-50/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 transition-opacity duration-300"
          role="status"
          aria-live="polite"
        >
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-2xl border-2 border-[#E0562D]/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center">
              <img
                src={getAssetPath('/icons/vitudy.png')}
                alt="ViTudy"
                width={32}
                height={32}
                style={{ width: 32, height: 32, maxWidth: 32, maxHeight: 32 }}
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center px-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0562D] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#E0562D] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#E0562D] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">Đang mở bàn học của bạn...</p>
            <p className="text-xs text-slate-500">Đang đồng bộ tài liệu, ghi chú, hình dán và nét vẽ từ đám mây</p>
          </div>
        </div>
      )}

      {/* 2.5D Infinite Canvas Desk */}
      <InfiniteDesk />

      {/* VR HUD Frame Brackets & Atmospheric Vignette (fades out in focus mode for zero distraction) */}
      <div className={clsx("transition-opacity duration-300", isFocusMode ? "opacity-30" : "opacity-100")}>
        <VrFrameOverlay />
      </div>

      {/* ================= 1. TOP-LEFT NAV HUD (ViTudy | Tên bàn học | Search) ================= */}
      <div 
        className={clsx(
          "fixed top-1 left-1 z-40 transition-transform duration-300 ease-out pointer-events-auto",
          isFocusMode && !showTopLeftInFocus ? "-translate-y-[calc(100%+12px)]" : "translate-y-0"
        )}
      >
        <TopLeftNav />

        {/* Attached Pull/Retract Tab for Top-Left Nav in Focus Mode */}
        {isFocusMode && (
          <button
            type="button"
            onClick={() => setShowTopLeftInFocus(prev => !prev)}
            title={showTopLeftInFocus ? "Thu gọn thanh tiêu đề lên trên" : "Mở thanh tiêu đề bàn học"}
            className="absolute top-full left-6 mt-1 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-b-xl px-2.5 py-0.5 shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
          >
            {showTopLeftInFocus ? (
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.4]" />
            )}
          </button>
        )}
      </div>

      {/* ================= 2. TOP-RIGHT WALLET HUD (Chuỗi | Chợ | ViToken | AI) ================= */}
      <div 
        className={clsx(
          "fixed top-1 right-1 z-40 transition-transform duration-300 ease-out pointer-events-auto",
          isFocusMode && !showTopRightInFocus ? "-translate-y-[calc(100%+12px)]" : "translate-y-0"
        )}
      >
        <TopRightWallet />

        {/* Attached Pull/Retract Tab for Top-Right Wallet in Focus Mode */}
        {isFocusMode && (
          <button
            type="button"
            onClick={() => setShowTopRightInFocus(prev => !prev)}
            title={showTopRightInFocus ? "Thu gọn thanh ví & chuỗi lên trên" : "Mở thanh ví & chuỗi điểm danh"}
            className="absolute top-full right-6 mt-1 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-b-xl px-2.5 py-0.5 shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
          >
            {showTopRightInFocus ? (
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.4]" />
            )}
          </button>
        )}
      </div>

      {/* ================= 3. LEFT TOOL CREATION BAR (Responsive Floating Dock on Mobile) ================= */}
      <div 
        className={clsx(
          "fixed z-40 transition-transform duration-300 ease-out pointer-events-auto flex items-center",
          // Desktop & Tablet (Left centered)
          "md:left-1 md:top-1/2 md:-translate-y-1/2",
          isFocusMode && !showLeftInFocus ? "md:-translate-x-[calc(100%+12px)]" : "md:translate-x-0",
          // Mobile (< 768px): Bottom floating dock
          "max-md:bottom-2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-auto",
          isFocusMode && !showLeftInFocus ? "max-md:translate-y-[calc(100%+24px)]" : "max-md:translate-y-0"
        )}
      >
        <LeftCreationBar />

        {/* Attached Pull/Retract Tab for Left Toolbar in Focus Mode */}
        {isFocusMode && (
          <button
            type="button"
            onClick={() => setShowLeftInFocus(prev => !prev)}
            title={showLeftInFocus ? "Thu gọn thanh công cụ" : "Mở thanh công cụ"}
            className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-1 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-r-xl p-1 shadow-md cursor-pointer transition-all active:scale-95 items-center justify-center pointer-events-auto"
          >
            {showLeftInFocus ? (
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.4]" />
            )}
          </button>
        )}
      </div>

      {/* ================= 4. BOTTOM-LEFT KNOWLEDGE HUD (Tải lên, Ghi hình, Chia sẻ) ================= */}
      <div 
        className={clsx(
          "fixed bottom-1 left-1 z-40 transition-transform duration-300 ease-out pointer-events-auto",
          isFocusMode && !showBottomLeftInFocus ? "translate-y-[calc(100%+12px)]" : "translate-y-0"
        )}
      >
        <BottomLeftKnowledge />

        {/* Attached Pull/Retract Tab for Bottom-Left in Focus Mode */}
        {isFocusMode && (
          <button
            type="button"
            onClick={() => setShowBottomLeftInFocus(prev => !prev)}
            title={showBottomLeftInFocus ? "Thu gọn bộ nút tải lên xuống dưới" : "Mở bộ nút tải lên & ghi hình"}
            className="absolute bottom-full left-6 mb-1 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-t-xl px-2.5 py-0.5 shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
          >
            {showBottomLeftInFocus ? (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.4]" />
            )}
          </button>
        )}
      </div>

      {/* ================= 5. BOTTOM-RIGHT TOOLKIT HUD (Zoom, Xoay, Map) ================= */}
      <div 
        className={clsx(
          "fixed bottom-1 right-1 z-40 transition-transform duration-300 ease-out pointer-events-auto",
          isFocusMode && !showBottomRightInFocus ? "translate-y-[calc(100%+12px)]" : "translate-y-0"
        )}
      >
        <BottomRightToolkit />

        {/* Attached Pull/Retract Tab for Bottom-Right in Focus Mode */}
        {isFocusMode && (
          <button
            type="button"
            onClick={() => setShowBottomRightInFocus(prev => !prev)}
            title={showBottomRightInFocus ? "Thu gọn thanh điều khiển xuống dưới" : "Mở thanh zoom & điều khiển bàn học"}
            className="absolute bottom-full right-6 mb-1 bg-white/95 hover:bg-white text-slate-700 hover:text-[#E0562D] border border-slate-300 rounded-t-xl px-2.5 py-0.5 shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
          >
            {showBottomRightInFocus ? (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.4]" />
            )}
          </button>
        )}
      </div>

      {/* ================= MULTIPLAYER PRESENCE BAR (fades in focus mode) ================= */}
      <div className={clsx("transition-opacity duration-300", isFocusMode ? "opacity-0 pointer-events-none" : "opacity-100")}>
        <MultiplayerBar />
      </div>

      {/* ================= 7-STEP ONBOARDING TOUR ================= */}
      <OnboardingTour />
    </div>
  );
}
