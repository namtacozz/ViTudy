'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { DeleteAccount } from '@/components/profile/DeleteAccount';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { ArrowLeft, LogOut, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, status, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/auth');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (status === 'loading' || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#E0562D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Bàn Học</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* 1. Profile Header */}
        <ProfileHeader profile={profile} email={user.email || ''} />

        {/* 2. Account Settings (Name & BYOK) */}
        <AccountSettings profile={profile} />

        {/* 3. Payment History Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Lịch sử nạp ViToken</h2>
              <p className="text-xs text-slate-500">Các giao dịch chuyển khoản VietQR qua cổng tự động</p>
            </div>
          </div>

          <PaymentHistory />
        </div>

        {/* 4. Delete Account Zone */}
        <DeleteAccount userEmail={user.email || ''} />
      </div>
    </div>
  );
}
