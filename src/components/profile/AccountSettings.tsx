'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { Check, Loader2, KeyRound, UserCheck } from 'lucide-react';

interface AccountSettingsProps {
  profile: UserProfile | null;
}

export function AccountSettings({ profile }: AccountSettingsProps) {
  const { refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Local BYOK settings (stored on client device only)
  const [openAiKey, setOpenAiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [byokSaved, setByokSaved] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  useEffect(() => {
    // Load BYOK keys from localStorage
    if (typeof window !== 'undefined') {
      const storedOpenAi = localStorage.getItem('vitudy_byok_openai') || '';
      const storedGemini = localStorage.getItem('vitudy_byok_gemini') || '';
      setOpenAiKey(storedOpenAi ? '••••••••••••••••••••••••••••••••' : '');
      setGeminiKey(storedGemini ? '••••••••••••••••••••••••••••••••' : '');
    }
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError('Họ và tên không được để trống.');
      return;
    }

    setIsUpdatingName(true);
    setNameError(null);
    setNameSuccess(false);

    const supabase = getSupabase();
    if (!supabase) {
      setNameError('Chưa kết nối Supabase Cloud.');
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
      await refreshProfile();
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message || 'Lỗi cập nhật họ và tên.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSaveByok = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (openAiKey && !openAiKey.startsWith('••••')) {
        localStorage.setItem('vitudy_byok_openai', openAiKey.trim());
      }
      if (geminiKey && !geminiKey.startsWith('••••')) {
        localStorage.setItem('vitudy_byok_gemini', geminiKey.trim());
      }
      setByokSaved(true);
      setTimeout(() => setByokSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Name Form */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
          <UserCheck className="w-4 h-4 text-slate-700" />
          <span>Thông tin cá nhân</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tên hiển thị này sẽ xuất hiện trên bàn học và trong các phòng học nhóm.
        </p>

        <form onSubmit={handleUpdateName} className="space-y-3">
          <div>
            <label htmlFor="accountDisplayName" className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên hiển thị
            </label>
            <input
              id="accountDisplayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full max-w-md px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent transition-all"
            />
          </div>

          {nameError && <p className="text-xs text-red-600 font-medium">{nameError}</p>}
          {nameSuccess && <p className="text-xs text-emerald-600 font-medium">Đã lưu tên thành công!</p>}

          <button
            type="submit"
            disabled={isUpdatingName}
            className="px-4 py-2 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isUpdatingName ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </button>
        </form>
      </section>

      {/* 2. BYOK Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Khóa AI Cá Nhân (BYOK)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Khóa API cá nhân chỉ được lưu cục bộ trên trình duyệt thiết bị này (không lưu trữ trên máy chủ).
        </p>

        <form onSubmit={handleSaveByok} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="byokOpenAi" className="block text-xs font-semibold text-slate-700 mb-1">
              OpenAI API Key (sk-...)
            </label>
            <input
              id="byokOpenAi"
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent font-mono text-xs"
            />
          </div>

          <div>
            <label htmlFor="byokGemini" className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key (AIzaSy...)
            </label>
            <input
              id="byokGemini"
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0562D] focus:border-transparent font-mono text-xs"
            />
          </div>

          {byokSaved && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Đã lưu khóa API trên thiết bị của bạn!</span>
            </p>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            Lưu khóa cá nhân
          </button>
        </form>
      </section>
    </div>
  );
}
