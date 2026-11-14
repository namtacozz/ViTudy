'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { LogIn, X, Cloud } from 'lucide-react';

interface GuestBannerProps {
  user: User | null;
}

export function GuestBanner({ user }: GuestBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Mặc định ẩn trước khi check sessionStorage trên client

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('vitudy_guest_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  if (user || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('vitudy_guest_banner_dismissed', 'true');
    } catch {}
  };

  return (
    <aside 
      aria-label="Thông báo chế độ khách"
      className="fixed top-12 sm:top-auto sm:bottom-0 left-2 right-2 sm:left-0 sm:right-0 z-30 sm:z-50 bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 sm:border-t sm:border-x-0 sm:border-b-0 rounded-2xl sm:rounded-none px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl transition-all max-w-lg sm:max-w-none mx-auto"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#FFF7ED] text-[#E0562D] flex items-center justify-center font-bold shrink-0">
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <p className="truncate font-medium text-slate-200 text-[11px] sm:text-xs">
            <span className="font-bold text-white">Chế độ khách:</span> Đăng nhập để lưu bàn học lên đám mây và nhận 50 ViToken.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/auth"
            className="px-2.5 py-1 bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs text-xs"
          >
            <LogIn className="w-3 h-3" />
            <span>Đăng nhập</span>
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-md cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
