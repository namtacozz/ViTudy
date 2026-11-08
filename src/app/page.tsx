'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';
import { useAuth } from '@/hooks/useAuth';
import { GuestBanner } from '@/components/auth/GuestBanner';
import { MigrationDialog } from '@/components/auth/MigrationDialog';
import { LandingPage } from '@/components/landing/LandingPage';

const StudySpaceDeskView = dynamic(
  () => import('@/components/canvas/StudySpaceDeskView'),
  { ssr: false }
);

const HAS_VISITED_DESK_KEY = 'vitudy_has_visited_desk';

export default function StudySpacePage() {
  const { user, status } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'desk' | 'landing'>('desk');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check URL query parameters and local storage for landing vs desk view
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkView = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      const roomParam = searchParams.get('room');

      if (viewParam === 'landing') {
        setViewMode('landing');
        return;
      }

      if (roomParam) {
        setViewMode('desk');
        return;
      }

      const hasVisited = localStorage.getItem(HAS_VISITED_DESK_KEY);
      if (!hasVisited && status === 'guest') {
        setViewMode('landing');
      } else {
        setViewMode('desk');
      }
    };

    checkView();
    window.addEventListener('popstate', checkView);
    return () => window.removeEventListener('popstate', checkView);
  }, [status]);

  // Xử lý liên kết mời bạn học (?room=spaceId)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const roomParam = new URLSearchParams(window.location.search).get('room');
    if (roomParam && user?.id) {
      import('@/services/StudySpaceService').then(({ StudySpaceService }) => {
        StudySpaceService.joinSpace(roomParam, user.id, 'viewer');
      });
    }
  }, [user?.id]);

  const handleEnterDesk = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HAS_VISITED_DESK_KEY, 'true');
    }
    setViewMode('desk');
  };

  if (viewMode === 'landing') {
    return <LandingPage onEnterDesk={handleEnterDesk} />;
  }

  // Mobile Companion Mode (<768px)
  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-white overflow-y-auto">
        <MobileCompanionView />
        <GuestBanner user={user} />
      </div>
    );
  }

  // Desktop & Tablet 2.5D Infinite Workspace
  return (
    <>
      <StudySpaceDeskView />
      <GuestBanner user={user} />
      <MigrationDialog />
    </>
  );
}
