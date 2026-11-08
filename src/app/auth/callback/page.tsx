'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      const supabase = getSupabase();
      if (!supabase) {
        if (isMounted) router.replace('/auth?error=supabase_not_configured');
        return;
      }

      try {
        // 1. Kiểm tra xem session đã được tự động xử lý bởi detectSessionInUrl chưa
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) router.replace('/');
          return;
        }

        // 2. Nếu chưa có session, kiểm tra query code trong URL để đổi (PKCE)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isMounted) {
              setErrorMsg('Xác thực thất bại hoặc mã phiên đã hết hạn.');
              setTimeout(() => router.replace('/auth?error=exchange_failed'), 1500);
            }
            return;
          }
          if (isMounted) router.replace('/');
          return;
        }

        // 3. Không có code và không có session
        if (isMounted) router.replace('/auth');
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Lỗi trong quá trình hoàn tất xác thực.');
          setTimeout(() => router.replace('/auth?error=unknown'), 1500);
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
        {errorMsg ? (
          <div className="text-red-600 text-sm font-medium">{errorMsg}</div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#E0562D]" />
            <p className="text-sm font-semibold text-slate-800">Đang hoàn tất đăng nhập...</p>
            <p className="text-xs text-slate-400">Vui lòng đợi trong giây lát</p>
          </div>
        )}
      </div>
    </div>
  );
}
