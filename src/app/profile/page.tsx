'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { DeleteAccount } from '@/components/profile/DeleteAccount';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { TopUpModal } from '@/components/payment/TopUpModal';
import { ArrowLeft, LogOut, Loader2, CreditCard, Sparkles, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, status, signOut, isLoading } = useAuth();

  const fromParam = searchParams.get('from');
  const [returnDestination, setReturnDestination] = useState<'desk' | 'home'>('home');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'payments'>('profile');

  useEffect(() => {
    if (fromParam === 'desk' || fromParam === 'home') {
      setReturnDestination(fromParam);
      return;
    }
    try {
      const stored = sessionStorage.getItem('vitudy_last_view');
      if (stored === 'desk' || stored === 'home') {
        setReturnDestination(stored);
      }
    } catch {}
  }, [fromParam]);

  // Bỏ tự động redirect ép buộc sang /auth khi là guest. 
  // Người dùng khách vẫn có thể xem thông tin, chỉnh cài đặt AI và chủ động bấm đăng nhập khi muốn.
  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const returnHref = returnDestination === 'desk' ? '/?view=desk' : '/?view=home';
  const returnLabel = returnDestination === 'desk' ? 'Về bàn học' : 'Về trang chủ';

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(returnHref);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#E0562D]" />
      </div>
    );
  }

  const isGuest = !user;
  const effectiveProfile: any = profile || {
    id: 'guest',
    email: 'khach@vitudy.local',
    display_name: 'Khách trải nghiệm',
    avatar_url: null,
    vitoken_balance: 0,
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-6 px-4 sm:px-6 font-sans text-stone-900">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={returnHref}
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{returnLabel}</span>
          </Link>

          {isGuest ? (
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#E0562D] hover:bg-[#c9451e] transition-colors px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer active:scale-95"
            >
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-rose-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>

        {/* Guest Notification Banner */}
        {isGuest && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="text-xs text-stone-700">
              <span className="font-bold text-[#B8431A]">Bạn đang ở Chế độ Khách:</span>
              <p className="text-stone-600 mt-0.5">
                Các cấu hình AI và nét vẽ được lưu trên trình duyệt này. Đăng nhập để lưu trữ vĩnh viễn trên đám mây và nhận 50 ViToken.
              </p>
            </div>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 self-start sm:self-center"
            >
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        )}

        {/* Header Title: Profile settings (Ảnh 4) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight">
            Cài đặt tài khoản
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Quản lý thông tin hồ sơ, ảnh đại diện và các thiết lập tài khoản ViTudy.
          </p>
        </div>

        {/* Tab Headers (Ảnh 4) */}
        <div className="flex items-center gap-6 border-b border-stone-200 text-xs font-bold select-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === 'profile'
                ? 'text-[#E0562D] border-b-2 border-[#E0562D]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Hồ sơ
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === 'ai'
                ? 'text-[#E0562D] border-b-2 border-[#E0562D]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Kết nối AI
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === 'payments'
                ? 'text-[#E0562D] border-b-2 border-[#E0562D]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Lịch sử nạp ViToken
          </button>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'profile' && (
          <AccountSettings profile={effectiveProfile} activeTab="profile" />
        )}

        {activeTab === 'ai' && (
          <AccountSettings profile={effectiveProfile} activeTab="ai" />
        )}

        {activeTab === 'payments' && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Lịch sử nạp ViToken</h2>
                  <p className="text-xs text-stone-500">Các giao dịch chuyển khoản VietQR qua cổng tự động</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTopUpOpen(true)}
                className="px-3 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Nạp ViToken
              </button>
            </div>

            <PaymentHistory />
          </div>
        )}

        {/* Delete Account Zone at the bottom (chỉ hiển thị khi đã đăng nhập) */}
        {!isGuest && user && (
          <div className="pt-2">
            <DeleteAccount userEmail={user.email || ''} />
          </div>
        )}

        {/* Top Up Modal */}
        <TopUpModal 
          isOpen={isTopUpOpen} 
          onClose={() => setIsTopUpOpen(false)} 
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#E0562D]" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
