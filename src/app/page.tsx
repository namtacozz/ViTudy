'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';

const StudySpaceDeskView = dynamic(
  () => import('@/components/canvas/StudySpaceDeskView'),
  { ssr: false }
);

export default function StudySpacePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile Companion Mode (<768px)
  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-white overflow-y-auto">
        <MobileCompanionView />
      </div>
    );
  }

  // Desktop & Tablet 2.5D Infinite Workspace
  return <StudySpaceDeskView />;
}
