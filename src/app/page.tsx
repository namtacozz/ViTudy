'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';
import { useAuth } from '@/hooks/useAuth';
import { GuestBanner } from '@/components/auth/GuestBanner';
import { MigrationDialog } from '@/components/auth/MigrationDialog';
import { HomePage } from '@/components/home/HomePage';

const StudySpaceDeskView = dynamic(
  () => import('@/components/canvas/StudySpaceDeskView'),
  { ssr: false }
);

export default function StudySpacePage() {
  const { user, status } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'desk' | 'home'>('home');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check URL query parameters for home vs desk view
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkView = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      const roomParam = searchParams.get('room');

      // Chỉ mở Bàn học khi URL explicitly yêu cầu (view=desk hoặc có room tham gia)
      if (viewParam === 'desk' || roomParam) {
        setViewMode('desk');
      } else {
        // Link gốc không tham số hoặc view=home -> Luôn luôn hiển thị Trang chủ (HomePage)
        setViewMode('home');
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

  const handleEnterDesk = (spaceId?: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'desk');
      window.history.pushState({}, '', url.toString());
    }
    setViewMode('desk');
  };

  if (viewMode === 'home') {
    return <HomePage onEnterDesk={handleEnterDesk} />;
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
