'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';
import { useAuth } from '@/hooks/useAuth';
import { GuestBanner } from '@/components/auth/GuestBanner';
import { MigrationDialog } from '@/components/auth/MigrationDialog';
import { HomePage } from '@/components/home/HomePage';
import { useStudySpace } from '@/context/StudySpaceContext';
import { ModalErrorBoundary } from '@/components/common/ModalErrorBoundary';

const StudySpaceDeskView = dynamic(
  () => import('@/components/canvas/StudySpaceDeskView'),
  { ssr: false }
);

function StudySpacePageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMode, setMobileMode] = useState<'companion' | 'canvas'>('canvas');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const viewParam = searchParams.get('view');
  const roomParam = searchParams.get('room');
  const spaceParam = searchParams.get('space');
  const { switchSpace, activeSpaceId } = useStudySpace();

  // URL có view=desk hoặc có room tham gia hoặc có space -> hiển thị Bàn học; ngược lại (view=home hoặc link gốc) -> Trang chủ
  const isDeskView = viewParam === 'desk' || Boolean(roomParam) || Boolean(spaceParam);

  // Đồng bộ space từ URL vào activeSpaceId của StudySpaceContext
  useEffect(() => {
    if (spaceParam && isDeskView && spaceParam !== activeSpaceId) {
      switchSpace(spaceParam);
    }
  }, [spaceParam, isDeskView, activeSpaceId, switchSpace]);

  // Lưu trạng thái view hiện tại vào sessionStorage để các trang con (như /profile, /market) quay về đúng nơi
  useEffect(() => {
    try {
      sessionStorage.setItem('vitudy_last_view', isDeskView ? 'desk' : 'home');
    } catch {
      // ignore
    }
  }, [isDeskView]);

  // Xử lý liên kết mời bạn học (?room=spaceId)
  useEffect(() => {
    if (roomParam && user?.id) {
      import('@/services/StudySpaceService').then(({ StudySpaceService }) => {
        StudySpaceService.joinSpace(roomParam, user.id, 'viewer');
      });
    }
  }, [roomParam, user?.id]);

  const handleEnterDesk = (spaceId?: string) => {
    if (spaceId) {
      router.push(`/?view=desk&space=${encodeURIComponent(spaceId)}`);
    } else {
      router.push('/?view=desk');
    }
  };

  if (!isDeskView) {
    return <HomePage onEnterDesk={handleEnterDesk} />;
  }

  // Mobile Companion Mode (mở khi ?view=companion hoặc người dùng bấm chuyển sang chế độ đọc)
  if (viewParam === 'companion' || (isMobile && mobileMode === 'companion')) {
    return (
      <div className="w-full min-h-[100dvh] bg-white overflow-y-auto">
        <MobileCompanionView onSwitchToCanvas={() => {
          setMobileMode('canvas');
          if (viewParam === 'companion') {
            router.push(spaceParam ? `/?view=desk&space=${encodeURIComponent(spaceParam)}` : '/?view=desk');
          }
        }} />
        <GuestBanner user={user} />
      </div>
    );
  }

  // Desktop, Tablet & Mobile 2.5D Infinite Workspace
  return (
    <>
      <ModalErrorBoundary
        fallbackTitle="Không thể hiển thị bàn học này"
        onReset={() => router.push('/?view=home')}
      >
        <StudySpaceDeskView />
      </ModalErrorBoundary>
      <GuestBanner user={user} />
      <MigrationDialog />
    </>
  );
}

export default function StudySpacePage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#e8ebf0]" />}>
      <StudySpacePageContent />
    </Suspense>
  );
}
