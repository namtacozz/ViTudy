'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { MobileCompanionView } from '@/components/mobile/MobileCompanionView';
import { useAuth } from '@/hooks/useAuth';
import { GuestBanner } from '@/components/auth/GuestBanner';
import { MigrationDialog } from '@/components/auth/MigrationDialog';
import { HomePage } from '@/components/home/HomePage';

const StudySpaceDeskView = dynamic(
  () => import('@/components/canvas/StudySpaceDeskView'),
  { ssr: false }
);

function StudySpacePageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMode, setMobileMode] = useState<'companion' | 'canvas'>('companion');

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

  // URL có view=desk hoặc có room tham gia hoặc có space -> hiển thị Bàn học; ngược lại (view=home hoặc link gốc) -> Trang chủ
  const isDeskView = viewParam === 'desk' || Boolean(roomParam) || Boolean(spaceParam);

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

  // Mobile Mode (<768px): Mặc định mở Mobile Companion, có thể chuyển sang Canvas 2.5D
  if (isMobile && mobileMode === 'companion') {
    return (
      <div className="w-full min-h-screen bg-white overflow-y-auto">
        <MobileCompanionView onSwitchToCanvas={() => setMobileMode('canvas')} />
        <GuestBanner user={user} />
      </div>
    );
  }

  // Desktop & Tablet (hoặc Mobile khi chọn chuyển sang Canvas 2.5D)
  return (
    <>
      {isMobile && mobileMode === 'canvas' && (
        <button
          type="button"
          onClick={() => setMobileMode('companion')}
          className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a]/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-slate-700 hover:bg-[#E0562D]"
        >
          <span>Chế độ đọc</span>
        </button>
      )}
      <StudySpaceDeskView />
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
