'use client';

import React, { useState, useEffect } from 'react';
import { InfiniteDesk } from '@/components/canvas/InfiniteDesk';
import { TopLeftNav } from '@/components/hud/TopLeftNav';
import { TopRightWallet } from '@/components/hud/TopRightWallet';
import { BottomLeftKnowledge } from '@/components/hud/BottomLeftKnowledge';
import { BottomRightToolkit } from '@/components/hud/BottomRightToolkit';
import { VrFrameOverlay } from '@/components/hud/VrFrameOverlay';
import { MultiplayerBar } from '@/components/hud/MultiplayerBar';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';

export default function StudySpacePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Desktop & Tablet 2.5D Infinite Desk View */}
      <div className="hidden md:block w-full h-full relative">
        {/* Infinite 2.5D Canvas Desk */}
        <InfiniteDesk />

        {/* VR HUD Frame & Vignette */}
        <VrFrameOverlay />

        {/* 4 Fixed HUD Corners & Multiplayer Presence */}
        <TopLeftNav />
        <TopRightWallet />
        <BottomLeftKnowledge />
        <BottomRightToolkit />
        <MultiplayerBar />
      </div>

      {/* Mobile Screen Companion Mode */}
      <div className="block md:hidden w-full h-full overflow-y-auto">
        <MobileCompanionView />
      </div>
    </div>
  );
}
