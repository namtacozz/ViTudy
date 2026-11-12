'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, useAuth } from '@/hooks/useAuth';
import { getSupabase } from '@/lib/supabase';
import { 
  Check, 
  Loader2, 
  UserCheck, 
  ShieldCheck,
  Mail,
  Bot,
  RefreshCw,
  LogOut,
  ExternalLink,
  Sparkles,
  Camera,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { getOpenAiOAuthSession, clearOpenAiOAuthSession, OpenAiOAuthSession } from '@/lib/openaiOAuth';
import { AiConfigModal } from '@/components/modals/AiConfigModal';

interface AccountSettingsProps {
  profile: UserProfile | null;
  activeTab?: 'profile' | 'ai' | 'payments';
  onOpenTopUp?: () => void;
}

export function AccountSettings({ profile, activeTab = 'profile', onOpenTopUp }: AccountSettingsProps) {
  const { refreshProfile, user } = useAuth();
  
  // Form fields
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [initialDisplayName, setInitialDisplayName] = useState(profile?.display_name || '');
  
  const [nickname, setNickname] = useState('');
  const [initialNickname, setInitialNickname] = useState('');

  const [organization, setOrganization] = useState('');
  const [initialOrganization, setInitialOrganization] = useState('');

  const [role, setRole] = useState('student');
  const [initialRole, setInitialRole] = useState('student');

  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Avatar upload/remove
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Modal & OAuth
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [oauthSession, setOauthSession] = useState<OpenAiOAuthSession | null>(null);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
      setInitialDisplayName(profile.display_name);
    }
    if (typeof window !== 'undefined') {
      const storedNick = localStorage.getItem('vitudy_user_nickname') || '';
      setNickname(storedNick);
      setInitialNickname(storedNick);

      const storedOrg = localStorage.getItem('vitudy_user_org') || '';
      setOrganization(storedOrg);
      setInitialOrganization(storedOrg);

      const storedRole = localStorage.getItem('vitudy_user_role') || 'student';
      setRole(storedRole);
      setInitialRole(storedRole);

      setOauthSession(getOpenAiOAuthSession());
    }
  }, [profile?.display_name]);

  const hasFormChanged = 
    displayName.trim() !== initialDisplayName.trim() || 
    nickname.trim() !== initialNickname.trim() ||
    organization.trim() !== initialOrganization.trim() ||
    role !== initialRole;

  const provider = user?.app_metadata?.provider || 'email';
  const providerLabel = provider === 'google' ? 'Google' : 'Email & Mật khẩu';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !hasFormChanged) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setNameError('Họ và tên không được để trống.');
      return;
    }

    setIsUpdatingName(true);
    setNameError(null);
    setNameSuccess(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vitudy_user_nickname', nickname.trim());
      setInitialNickname(nickname.trim());
      localStorage.setItem('vitudy_user_org', organization.trim());
      setInitialOrganization(organization.trim());
      localStorage.setItem('vitudy_user_role', role);
      setInitialRole(role);
    }

    const supabase = getSupabase();
    if (!supabase) {
      setNameSuccess(true);
      setInitialDisplayName(trimmedName);
      setTimeout(() => setNameSuccess(false), 3000);
      setIsUpdatingName(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: trimmedName })
        .eq('id', profile.id);

      if (error) throw error;

      setNameSuccess(true);
      setInitialDisplayName(trimmedName);
      await refreshProfile();
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message || 'Lỗi cập nhật thông tin.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Kích thước ảnh tối đa là 2MB.');
      return;
    }

    setIsAvatarLoading(true);
    setAvatarError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setAvatarError('Chưa kết nối CSDL Supabase.');
      setIsAvatarLoading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } catch (err: any) {
      setAvatarError(err.message || 'Không thể tải ảnh đại diện lên.');
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.id) return;
    setIsAvatarLoading(true);
    setAvatarError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setIsAvatarLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);

      if (error) throw error;
      await refreshProfile();
    } catch (err: any) {
      setAvatarError(err.message || 'Không thể gỡ ảnh đại diện.');
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const initialLetter = (displayName || profile?.display_name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* ================= TAB 1: PROFILE SETTINGS (Ảnh 4 chuẩn Miro) ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Cột trái: Form thông tin cá nhân (65%) */}
            <form onSubmit={handleUpdateProfile} className="md:col-span-8 space-y-4">
              {/* Họ và tên (Name) */}
              <div>
                <label htmlFor="profileName" className="block text-xs font-bold text-stone-800 mb-1">
                  Họ và tên
                </label>
                <input
                  id="profileName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#E0562D] transition-all"
                />
              </div>

              {/* Tên gọi ngắn (Nickname) */}
              <div>
                <label htmlFor="profileNickname" className="block text-xs font-bold text-stone-800 mb-1">
                  Tên gọi ngắn (Nickname)
                </label>
                <input
                  id="profileNickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="VD: Thành"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#E0562D] transition-all"
                />
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Dùng cho lời chào trang chủ và trên bàn học.
                </p>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Email tài khoản
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={user?.email || profile?.email || ''}
                    className="w-full px-3.5 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-600 outline-none cursor-not-allowed select-all"
                  />
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200 whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{providerLabel}</span>
                  </span>
                </div>
              </div>

              {/* Trường học / Đơn vị (Organization) */}
              <div>
                <label htmlFor="profileOrg" className="block text-xs font-bold text-stone-800 mb-1">
                  Trường học / Viện đào tạo
                </label>
                <input
                  id="profileOrg"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="VD: Đại học Bách Khoa, THPT..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#E0562D] transition-all"
                />
              </div>

              {/* Vai trò học tập (Role) */}
              <div>
                <label htmlFor="profileRole" className="block text-xs font-bold text-stone-800 mb-1">
                  Vai trò
                </label>
                <select
                  id="profileRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#E0562D] transition-all cursor-pointer"
                >
                  <option value="student">Học sinh / Sinh viên</option>
                  <option value="lecturer">Giảng viên / Giáo viên</option>
                  <option value="researcher">Nghiên cứu sinh</option>
                  <option value="other">Người tự học</option>
                </select>
              </div>

              {nameError && <p className="text-xs text-red-600 font-medium">{nameError}</p>}
              {nameSuccess && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã lưu thông tin cá nhân.</span>
                </p>
              )}

              {/* Nút lưu */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isUpdatingName || !hasFormChanged}
                  className="px-5 py-2 bg-[#E0562D] hover:bg-[#c9451e] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  {isUpdatingName ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                {!hasFormChanged && !nameSuccess && (
                  <span className="text-xs text-stone-400">Chưa có thay đổi</span>
                )}
              </div>
            </form>

            {/* Cột phải: Avatar to tròn kèm 2 nút Upload / Remove bên dưới (Ảnh 4 chuẩn Miro) */}
            <div className="md:col-span-4 flex flex-col items-center justify-start pt-2">
              <div className="w-36 h-36 rounded-full border-2 border-stone-200 overflow-hidden shadow-xs flex items-center justify-center bg-[#FFF7ED] text-[#E0562D] text-4xl font-black select-none">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>

              {/* 2 nút Upload và Remove bên dưới avatar theo Ảnh 4 */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarLoading}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isAvatarLoading ? 'Đang tải...' : 'Upload'}
                </button>

                {profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isAvatarLoading}
                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>

              {avatarError && (
                <p className="text-[11px] text-red-600 text-center mt-2 font-medium">
                  {avatarError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: KẾT NỐI AI ================= */}
      {activeTab === 'ai' && (
        <section className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-stone-700" />
              <h3 className="text-sm font-bold text-stone-900">Kết nối ChatGPT & AI</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="text-xs font-bold text-[#E0562D] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Mở cài đặt AI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Dùng tài khoản ChatGPT để hỏi đáp, tóm tắt và sinh đề thi không tốn ViToken.
          </p>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <span>Trạng thái:</span>
                {oauthSession ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Đã kết nối ChatGPT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                    Dùng AI hệ thống ViTudy
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 truncate mt-1">
                {oauthSession
                  ? `Tài khoản: ${oauthSession.email || (oauthSession.accountId ? `ID #${oauthSession.accountId.slice(0, 8)}` : 'ChatGPT Plus')}`
                  : 'AI ViTudy: 2 ViToken / lượt thao tác chuyên sâu (nhận miễn phí khi điểm danh).'}
              </p>
            </div>
            {oauthSession ? (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && !window.confirm('Bạn có chắc chắn muốn ngắt kết nối ChatGPT?')) return;
                  clearOpenAiOAuthSession();
                  setOauthSession(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-stone-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Ngắt kết nối</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Kết nối ChatGPT ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* AI Modal */}
      <AiConfigModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
}
