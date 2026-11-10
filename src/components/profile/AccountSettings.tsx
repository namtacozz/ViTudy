'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { 
  Check, 
  Loader2, 
  Bot, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Trash2, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  Mail,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { getOpenAiOAuthSession, clearOpenAiOAuthSession, OpenAiOAuthSession } from '@/lib/openaiOAuth';

interface AccountSettingsProps {
  profile: UserProfile | null;
}

export function AccountSettings({ profile }: AccountSettingsProps) {
  const { refreshProfile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [initialDisplayName, setInitialDisplayName] = useState(profile?.display_name || '');
  
  const [nickname, setNickname] = useState('');
  const [initialNickname, setInitialNickname] = useState('');

  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [oauthSession, setOauthSession] = useState<OpenAiOAuthSession | null>(null);

  // Khởi tạo họ tên & nickname
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
      setInitialDisplayName(profile.display_name);
    }
    if (typeof window !== 'undefined') {
      const storedNick = localStorage.getItem('vitudy_user_nickname') || '';
      setNickname(storedNick);
      setInitialNickname(storedNick);
      setOauthSession(getOpenAiOAuthSession());
    }
  }, [profile?.display_name]);

  const hasNameChanged = displayName.trim() !== initialDisplayName.trim() || nickname.trim() !== initialNickname.trim();

  // Xác định phương thức đăng nhập
  const provider = user?.app_metadata?.provider || 'email';
  const providerLabel = provider === 'google' ? 'Đăng nhập bằng Google' : 'Đổi mật khẩu';

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !hasNameChanged) return;

    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError('Họ và tên không được để trống.');
      return;
    }

    setIsUpdatingName(true);
    setNameError(null);
    setNameSuccess(false);

    // Lưu nickname vào LocalStorage để đồng bộ với lời chào trang chủ
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitudy_user_nickname', nickname.trim());
      setInitialNickname(nickname.trim());
    }

    const supabase = getSupabase();
    if (!supabase) {
      setNameSuccess(true);
      setInitialDisplayName(trimmed);
      setTimeout(() => setNameSuccess(false), 3000);
      setIsUpdatingName(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: trimmed })
        .eq('id', profile.id);

      if (error) throw error;

      setNameSuccess(true);
      setInitialDisplayName(trimmed);
      await refreshProfile();
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message || 'Lỗi cập nhật họ và tên.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Name & Nickname Form */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
          <UserCheck className="w-4 h-4 text-slate-700" />
          <span>Thông tin cá nhân</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Tên hiển thị này sẽ xuất hiện trên bàn học, trong các phòng học nhóm và lời chào trang chủ.
        </p>

        <form onSubmit={handleUpdateName} className="space-y-4">
          {/* Email (Chỉ đọc) kèm phương thức đăng nhập */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email tài khoản</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={user?.email || profile?.email || ''}
                className="w-full max-w-md px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-sans outline-none cursor-not-allowed select-all"
              />
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{providerLabel}</span>
              </span>
            </div>
          </div>

          {/* Họ và tên đầy đủ */}
          <div>
            <label htmlFor="accountDisplayName" className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên đầy đủ
            </label>
            <input
              id="accountDisplayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full max-w-md px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E0562D]/20 focus:border-[#E0562D] transition-all"
            />
          </div>

          {/* Tên gọi ngắn */}
          <div>
            <label htmlFor="accountNickname" className="block text-xs font-semibold text-slate-700 mb-0.5">
              Tên gọi ngắn
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              VD: Thành (dùng cho lời chào trang chủ và trên bàn học)
            </p>
            <input
              id="accountNickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="VD: Thành"
              className="w-full max-w-md px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E0562D]/20 focus:border-[#E0562D] transition-all"
            />
          </div>

          {nameError && <p className="text-xs text-red-600 font-medium">{nameError}</p>}
          {nameSuccess && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Đã lưu thông tin cá nhân thành công!</span>
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isUpdatingName || !hasNameChanged}
              className="px-5 py-2.5 bg-[#E0562D] hover:bg-[#c9451e] disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isUpdatingName ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : nameSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
            {!hasNameChanged && !nameSuccess && (
              <span className="text-xs text-slate-500 font-medium">Chưa có thay đổi</span>
            )}
          </div>
        </form>
      </section>

      {/* 2. Kết nối ChatGPT */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Kết nối ChatGPT</h3>
          </div>
          <Link
            href="/?view=desk"
            className="text-[11px] font-bold text-[#E0562D] hover:underline inline-flex items-center gap-1"
            title="Mở giao diện Cài đặt AI đầy đủ trên bàn học"
          >
            <span>Mở Cài đặt kết nối AI</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Dùng tài khoản ChatGPT của bạn để hỏi đáp và phân tích tài liệu mà không tiêu tốn ViToken của hệ thống.
        </p>

        {/* OpenAI OAuth Session Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Trạng thái kết nối:</span>
              {oauthSession ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Đã kết nối
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10.5px] font-bold">
                  Chưa kết nối
                </span>
              )}
              {oauthSession && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                  <RefreshCw className="w-2.5 h-2.5" />
                  Tự gia hạn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate mt-1">
              {oauthSession
                ? `Tài khoản: ${oauthSession.email || (oauthSession.accountId ? `ID #${oauthSession.accountId.slice(0, 8)}` : 'ChatGPT Plus')}`
                : 'Bạn đang dùng AI hệ thống ViTudy (2 ViToken / lượt thao tác chuyên sâu).'}
            </p>
          </div>
          {oauthSession ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && !window.confirm('Sau khi ngắt kết nối ChatGPT, các tính năng AI sẽ tự động chuyển sang AI hệ thống ViTudy (tiêu tốn 2 ViToken/lượt). Bạn có chắc chắn muốn ngắt kết nối?')) {
                  return;
                }
                clearOpenAiOAuthSession();
                setOauthSession(null);
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Ngắt kết nối ChatGPT</span>
            </button>
          ) : (
            <Link
              href="/?view=desk"
              className="px-4 py-2 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold flex items-center justify-center gap-1.5 flex-shrink-0 transition-all shadow-xs"
            >
              <span>Kết nối ChatGPT ngay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
