'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteAccountProps {
  userEmail: string;
}

export function DeleteAccount({ userEmail }: DeleteAccountProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmEmail.trim() !== userEmail.trim()) {
      setErrorMsg('Email xác nhận không khớp.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    const supabase = getSupabase();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabase || !supabaseUrl) {
      setErrorMsg('Không thể kết nối đến máy chủ.');
      setIsDeleting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwtToken = session?.access_token;

      if (!jwtToken) {
        throw new Error('Phiên đăng nhập không hợp lệ.');
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Lỗi xoá tài khoản.');
      }

      await signOut();
      router.replace('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể xoá tài khoản. Vui lòng thử lại sau.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1 text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <h3 className="text-sm font-bold">Khu vực nguy hiểm</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Xoá tài khoản sẽ huỷ bỏ vĩnh viễn toàn bộ bàn học, tài liệu, số dư ViToken và lịch sử học tập. Hành động này không thể hoàn tác.
      </p>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Xoá tài khoản này</span>
      </button>

      {/* Delete Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-2">
              Xác nhận xoá tài khoản?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Vui lòng gõ chính xác địa chỉ email <strong className="text-slate-900 font-mono">{userEmail}</strong> để xác nhận xoá vĩnh viễn:
            </p>

            <input
              type="text"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
            />

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium mb-3">{errorMsg}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || confirmEmail.trim() !== userEmail.trim()}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xoá...</span>
                  </>
                ) : (
                  <span>Xoá vĩnh viễn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
