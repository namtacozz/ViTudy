'use client';

import React from 'react';
import { InfiniteDesk } from './InfiniteDesk';
import { VrFrameOverlay } from '../hud/VrFrameOverlay';
import { TopLeftNav } from '../hud/TopLeftNav';
import { TopRightWallet } from '../hud/TopRightWallet';
import { BottomLeftKnowledge } from '../hud/BottomLeftKnowledge';
import { BottomRightToolkit } from '../hud/BottomRightToolkit';
import { LeftCreationBar } from '../hud/LeftCreationBar';
import { MultiplayerBar } from '../hud/MultiplayerBar';

export default function StudySpaceDeskView() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white select-none">
      {/* 2.5D Infinite Canvas Desk */}
      <InfiniteDesk />

      {/* VR HUD Frame Brackets & Atmospheric Vignette */}
      <VrFrameOverlay />

      {/* Miro-style Left Tool Creation Bar */}
      <LeftCreationBar />

      {/* Fixed HUD Corners & Multiplayer Real-Time Presence */}
      <TopLeftNav />
      <TopRightWallet />
      <BottomLeftKnowledge />
      <BottomRightToolkit />
      <MultiplayerBar />
    </div>
  );
}
