'use client';

import React, { useState, useEffect } from 'react';
import { InfiniteDesk } from '@/components/canvas/InfiniteDesk';
import { TopLeftNav } from '@/components/hud/TopLeftNav';
import { TopRightWallet } from '@/components/hud/TopRightWallet';
import { BottomLeftKnowledge } from '@/components/hud/BottomLeftKnowledge';
import { BottomRightToolkit } from '@/components/hud/BottomRightToolkit';
import { VrFrameOverlay } from '@/components/hud/VrFrameOverlay';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';

export default function StudySpacePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-[#0c1017] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span>Đang tải Bàn Học ViTudy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Desktop & Tablet 2.5D Infinite Desk View */}
      <div className="hidden md:block w-full h-full relative">
        {/* Infinite 2.5D Canvas Desk */}
        <InfiniteDesk />

        {/* VR HUD Frame & Vignette */}
        <VrFrameOverlay />

        {/* 4 Fixed HUD Corners */}
        <TopLeftNav />
        <TopRightWallet />
        <BottomLeftKnowledge />
        <BottomRightToolkit />
      </div>

      {/* Mobile Screen Companion Mode */}
      <div className="block md:hidden w-full h-full overflow-y-auto">
        <MobileCompanionView />
      </div>
    </div>
  );
}
