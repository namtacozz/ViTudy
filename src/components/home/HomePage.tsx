'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Flame, 
  CheckCircle2, 
  Target, 
  MousePointer2, 
  LogIn, 
  Star,
  User,
  Sparkles,
  BarChart2,
  CreditCard,
  LogOut,
  Store,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useViToken } from '@/context/ViTokenContext';
import { useStudySpace } from '@/context/StudySpaceContext';
import { usePomodoroContext } from '@/context/PomodoroContext';
import { TopUpModal } from '@/components/payment/TopUpModal';
import { MarketModal } from '@/components/modals/MarketModal';
import { AiConfigModal } from '@/components/modals/AiConfigModal';
import { getAssetPath } from '@/lib/assets';
import { StudySpace } from '@/types/studyspace';
import { formatRelativeTimeVN } from '@/lib/dateVN';
import { EmptyState } from '@/components/common/EmptyState';

interface HomePageProps {
  onEnterDesk: (spaceId?: string) => void;
  onCreateSpace?: (templateType?: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study') => void;
}

export function HomePage({ onEnterDesk, onCreateSpace }: HomePageProps) {
  const { user, profile, status, signOut } = useAuth();
  const { wallet, claimDailyStreak } = useViToken();
  const { spaces, switchSpace, createSpaceFromTemplate, toggleStarSpace } = useStudySpace();
  const { startSession: startPomodoroSession } = usePomodoroContext();
  const router = useRouter();

  const balance = wallet?.balance ?? 50;
  const streakDays = wallet?.streakDays ?? 1;

  // Streak status
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = wallet?.lastClaimDate === todayStr;
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'my_desks' | 'starred'>('home');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Username display
  const isAuthenticated = Boolean(user);
  const userName = profile?.display_name || user?.email?.split('@')[0] || '';

  const getShortGreetingName = (fullName: string) => {
    if (typeof window !== 'undefined') {
      const storedNick = localStorage.getItem('vitudy_user_nickname');
      if (storedNick && storedNick.trim()) return storedNick.trim();
    }
    if (!fullName) return 'Bạn';
    const trimmed = fullName.trim();
    if (trimmed.includes('@')) return trimmed.split('@')[0];
    const words = trimmed.split(/\s+/);
    return words[0] || 'Bạn';
  };
  const shortName = isAuthenticated ? getShortGreetingName(userName) : 'Bạn';

  // Handle streak claim
  const handleClaimStreak = () => {
    if (claimDailyStreak) {
      const res = claimDailyStreak();
      if (res.message) {
        setClaimFeedback(res.message);
        setTimeout(() => setClaimFeedback(null), 3000);
      }
    }
  };

  // Handle template selection
  const handleSelectTemplate = (templateType: 'blank' | 'midterm' | 'curriculum_exam' | 'group_study') => {
    if (createSpaceFromTemplate) {
      const newSpaceId = createSpaceFromTemplate(templateType);
      onEnterDesk(newSpaceId);
    } else {
      onEnterDesk();
    }
  };

  // Handle opening a space from recent table
  const handleOpenSpace = (spaceId: string) => {
    switchSpace(spaceId);
    onEnterDesk(spaceId);
  };

  // Helper tính số tài liệu
  const getSpaceSummary = (space: StudySpace) => {
    if (space.items && space.items.length > 0) {
      const books = space.items.filter(i => i.type === 'book').length;
      const papers = space.items.filter(i => i.type === 'paper').length;
      const notes = space.items.filter(i => i.type === 'sticky_note').length;
      
      const parts: string[] = [];
      if (books > 0) parts.push(`${books} sách`);
      if (papers > 0) parts.push(`${papers} tờ`);
      if (notes > 0) parts.push(`${notes} ghi chú`);
      if (parts.length > 0) return parts.join(' · ');
    }
    return 'Chưa có tài liệu';
  };

  const getRecentTimeString = (space: StudySpace) => {
    return formatRelativeTimeVN(space.lastOpenedAt || space.updatedAt || space.createdAt);
  };

  // Filter spaces
  const filteredSpaces = spaces.filter((s) => {
    if (activeNav === 'starred' && !s.starred) return false;
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)) ||
      (s.subject && s.subject.toLowerCase().includes(query))
    );
  });

  const displayedSpaces = showAllSpaces ? filteredSpaces : filteredSpaces.slice(0, 8);

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    await signOut();
    router.refresh();
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-[#faf8f5] text-stone-900 flex font-sans selection:bg-orange-100 selection:text-[#E0562D]">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-60 md:w-64 flex-shrink-0 border-r border-[#ece7e1] bg-[#faf8f5] p-4 md:p-5 flex flex-col justify-between h-screen overflow-y-auto no-scrollbar">
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 mb-4 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitudy.png')}
              alt="ViTudy"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-contain shadow-xs flex-shrink-0"
              style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px' }}
            />
            <span className="text-lg font-black tracking-tight text-[#E0562D] select-none leading-none">
              ViTudy
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2 bg-[#f3eee8] border border-stone-200/90 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus-within:border-stone-400 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 stroke-[2.2]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm bàn học, tài liệu..."
                className="w-full bg-transparent placeholder:text-stone-500 text-stone-800 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Navigation Links: Tinh gọn, bỏ hẳn /about và /faq */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveNav('home')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                activeNav === 'home'
                  ? 'bg-[#eee8df] text-stone-900 font-bold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('my_desks');
                onEnterDesk();
              }}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                activeNav === 'my_desks'
                  ? 'bg-[#eee8df] text-stone-900 font-bold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <span>Bàn học của tôi</span>
            </button>

            <button
              onClick={() => setActiveNav('starred')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                activeNav === 'starred'
                  ? 'bg-[#eee8df] text-stone-900 font-bold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <span>Đã gắn dấu sao</span>
            </button>

            <button
              onClick={() => setIsMarketOpen(true)}
              className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7] transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>Chợ tài liệu</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full block px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7] transition-colors"
            >
              Nhật ký học
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom Section: Thứ tự chuẩn hóa: Mục tiêu -> Chợ tài liệu -> Số dư ví */}
        <div className="pt-2 space-y-2.5">
          {/* 1. Widget: Mục tiêu học hôm nay */}
          <div className="p-3 rounded-2xl bg-[#f5efe6] border border-[#e8dfd3]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#B8431A]" />
                <span>Mục tiêu hôm nay</span>
              </span>
              <span className="text-[11px] font-bold text-[#B8431A]">1 / 4 phiên</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200/90 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-[#E0562D] rounded-full transition-all" style={{ width: '25%' }} />
            </div>
            <button
              type="button"
              onClick={() => {
                startPomodoroSession(25);
                onEnterDesk();
              }}
              className="w-full py-1.5 bg-white hover:bg-orange-50 border border-stone-200 hover:border-[#E0562D] text-[#E0562D] text-[11px] font-bold rounded-lg transition-colors text-center cursor-pointer active:scale-98"
            >
              Bắt đầu phiên 25p
            </button>
          </div>

          {/* 2. Thẻ Chợ tài liệu: Nằm ngay dưới mục tiêu, ngay trên số dư ví */}
          <div className="bg-[#f5efe6] border border-[#e8dfd3] rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#E0562D]" />
                <span>Chợ tài liệu</span>
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-white px-1.5 py-0.5 rounded-md border border-stone-200">
                Cộng đồng
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug mb-2">
              Sách, tóm tắt và đề thi do sinh viên chia sẻ.
            </p>
            <button
              type="button"
              onClick={() => setIsMarketOpen(true)}
              className="w-full py-1.5 bg-white hover:bg-orange-50 border border-stone-200 hover:border-[#E0562D] text-stone-800 hover:text-[#E0562D] text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 active:scale-98"
            >
              <span>Mở chợ tài liệu</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. Thẻ Số dư ViToken */}
          <div className="bg-[#f4efe8] border border-[#e8e1d7] rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600">Số dư khả dụng</span>
              <div className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getAssetPath('/icons/vitoken.svg')} 
                  alt="ViToken" 
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain flex-shrink-0" 
                  style={{ width: '16px', height: '16px', maxWidth: '16px', maxHeight: '16px' }}
                />
                <span className="text-base font-black text-stone-900 tracking-tight font-sans">
                  {typeof balance === 'number' ? balance : 50}
                </span>
                <span className="text-[11px] text-stone-600 font-semibold">V</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="w-full mt-2 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center cursor-pointer active:scale-98"
            >
              Nạp ViToken
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT (Fixed Viewport) ================= */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col max-w-6xl mx-auto p-4 md:p-6 w-full">
        {/* Top Header Bar: Sát lề trên (Ảnh 2) */}
        <header className="py-2 mb-2 bg-[#faf8f5]/95 border-b border-[#ece7e1] flex items-center justify-between flex-shrink-0">
          {/* Logo & Brand text sát lề trên bên trái thay cho text dài */}
          <div className="flex items-center gap-2 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitudy.png')}
              alt="ViTudy"
              width={24}
              height={24}
              className="w-6 h-6 rounded-lg object-contain flex-shrink-0"
              style={{ width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px' }}
            />
            <span className="text-base font-black tracking-tight text-[#E0562D] leading-none">
              ViTudy
            </span>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <button
              type="button"
              onClick={handleClaimStreak}
              title={isClaimedToday ? "Đã điểm danh hôm nay" : "Nhấp để điểm danh nhận ViToken"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 ${
                isClaimedToday 
                  ? 'bg-emerald-50/90 border border-emerald-200 text-emerald-800'
                  : 'bg-white border border-stone-200/90 text-stone-800 hover:border-[#E0562D] hover:shadow-xs'
              }`}
            >
              {isClaimedToday ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.4]" />
              ) : (
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#E0562D] fill-[#E0562D]" />
                </div>
              )}
              <span>Chuỗi {streakDays || 1} ngày · {isClaimedToday ? 'Đã điểm danh' : 'Điểm danh'}</span>
            </button>

            {/* Profile Avatar with Miro-style Dropdown (Ảnh 3) */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  title={`Tài khoản (${userName})`}
                  aria-label="Menu tài khoản"
                  className="w-9 h-9 min-w-[36px] rounded-full border border-stone-300 hover:border-[#E0562D] bg-white shadow-2xs overflow-hidden flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FFF7ED] text-[#B8431A] font-bold text-xs flex items-center justify-center select-none">
                      {shortName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Miro-style Profile Dropdown (Ảnh 3) */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-11 z-50 w-64 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 font-sans animate-fade-in text-xs">
                    {/* Header info */}
                    <div className="flex items-center gap-2.5 p-2 border-b border-stone-100 mb-1">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FFF7ED] text-[#B8431A] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-stone-200">
                        {profile?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          shortName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">
                          {profile?.display_name || userName || 'Học viên'}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* Menu items: Chỉ tính năng app đang có */}
                    <div className="space-y-0.5">
                      <Link
                        href="/profile?from=home"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsAiConfigOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium transition-colors text-left cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#E0562D]" />
                        <span>Cài đặt kết nối AI</span>
                      </button>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium transition-colors"
                      >
                        <BarChart2 className="w-4 h-4 text-stone-500" />
                        <span>Nhật ký học tập</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsTopUpOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-medium transition-colors text-left cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-stone-500" />
                        <span>Nạp ViToken</span>
                      </button>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                title="Đăng nhập tài khoản"
                className="px-3 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </header>

        {/* Feedback alert */}
        {claimFeedback && (
          <div className="mb-2 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-[#B8431A] flex items-center justify-between animate-fade-in shadow-xs flex-shrink-0">
            <span>{claimFeedback}</span>
            <button onClick={() => setClaimFeedback(null)} className="text-stone-400 hover:text-stone-600 font-bold px-1.5">✕</button>
          </div>
        )}

        {/* Lời chào: Gọn gàng, đẩy nội dung sát lên */}
        <div className="mb-3 text-left flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight">
            {isAuthenticated ? (
              <>
                Ôn bài thôi, <span className="text-[#B8431A] font-serif font-normal">{shortName}</span>
              </>
            ) : (
              <>
                Chào mừng đến với <span className="text-[#B8431A] font-serif font-normal">ViTudy</span>
              </>
            )}
          </h1>
        </div>

        {/* ================= SECTION 1: Bắt đầu bàn học mới ================= */}
        <section className="mb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs md:text-sm font-bold text-stone-900">Bắt đầu bàn học mới</h2>
            <button
              type="button"
              onClick={() => handleSelectTemplate('blank')}
              className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3 h-3 stroke-[2.4]" />
              <span>Tạo bàn học</span>
            </button>
          </div>

          {/* 4 Template Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Card 1: Bàn học trống */}
            <div
              onClick={() => handleSelectTemplate('blank')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="aspect-[16/9] w-full rounded-lg border border-dashed border-stone-300 flex flex-col items-center justify-center bg-stone-50/70 group-hover:border-[#E0562D]/60 transition-colors gap-1">
                <Plus className="w-5 h-5 text-stone-400 group-hover:text-[#E0562D] stroke-[1.8]" />
              </div>
              <span className="mt-2 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] transition-colors truncate">
                Bàn học trống
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                Kéo thả tài liệu tùy ý
              </p>
            </div>

            {/* Card 2: Ôn thi giữa kỳ */}
            <div
              onClick={() => handleSelectTemplate('midterm')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="aspect-[16/9] w-full rounded-lg bg-[#eef1f5] p-2 flex items-center justify-center gap-2 overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
                <div className="w-14 h-10 rounded-xs border border-[#5c3920] bg-white shadow-2xs flex overflow-hidden">
                  <div className="w-1/2 border-r border-stone-200 p-1 flex flex-col gap-0.5">
                    <div className="w-4 h-0.5 bg-stone-400 rounded-full" />
                    <div className="w-3 h-0.5 bg-stone-300 rounded-full" />
                  </div>
                  <div className="w-1/2 p-1 flex flex-col gap-0.5">
                    <div className="w-4 h-0.5 bg-[#B8431A] rounded-full" />
                    <div className="w-3 h-0.5 bg-stone-300 rounded-full" />
                  </div>
                </div>
                <div className="w-6 h-8 rounded-2xs bg-[#fef08a] border border-amber-200/80 shadow-2xs" />
              </div>
              <span className="mt-2 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] transition-colors truncate">
                Ôn thi giữa kỳ
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                Giáo trình + ghi chú vàng
              </p>
            </div>

            {/* Card 3: Giáo trình + đề thi */}
            <div
              onClick={() => handleSelectTemplate('curriculum_exam')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="aspect-[16/9] w-full rounded-lg bg-[#eef1f5] p-2 flex items-center justify-center gap-2 overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
                <div className="w-8 h-11 rounded-xs bg-white border border-stone-300/90 shadow-2xs p-1 flex flex-col gap-0.5">
                  <div className="w-4 h-0.5 bg-emerald-500 rounded-full" />
                  <div className="w-5 h-0.5 bg-stone-200 rounded-full mt-0.5" />
                </div>
                <div className="w-8 h-11 rounded-xs bg-white border border-stone-300/90 shadow-2xs p-1 flex flex-col gap-0.5">
                  <div className="w-4 h-0.5 bg-blue-500 rounded-full" />
                  <div className="w-5 h-0.5 bg-stone-200 rounded-full mt-0.5" />
                </div>
              </div>
              <span className="mt-2 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] transition-colors truncate">
                Giáo trình + đề thi
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                Mở song song 2 tài liệu
              </p>
            </div>

            {/* Card 4: Học nhóm */}
            <div
              onClick={() => handleSelectTemplate('group_study')}
              className="bg-white border border-stone-200/90 rounded-xl p-2.5 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="aspect-[16/9] w-full rounded-lg bg-[#eef1f5] p-2 flex items-center justify-center relative overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
                <div className="w-14 h-9 rounded-xs bg-[#5c3920] shadow-2xs flex items-center justify-center opacity-85">
                  <span className="text-[8px] font-bold text-amber-100">Phòng</span>
                </div>
                <div className="absolute top-1 left-2 flex items-start gap-0.5">
                  <MousePointer2 className="w-3 h-3 text-[#E0562D] fill-[#E0562D]" />
                </div>
                <div className="absolute bottom-1 right-2 flex items-start gap-0.5">
                  <MousePointer2 className="w-3 h-3 text-purple-600 fill-purple-600" />
                </div>
              </div>
              <span className="mt-2 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] transition-colors truncate">
                Học nhóm
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                Ôn bài trực tuyến cùng bạn
              </p>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: Mở lại gần đây (Cuộn độc lập trong khung) ================= */}
        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h2 className="text-xs md:text-sm font-bold text-stone-900">Mở lại gần đây</h2>
            {spaces.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllSpaces(!showAllSpaces)}
                className="text-xs font-bold text-[#B8431A] hover:text-[#9A3412] hover:underline cursor-pointer"
              >
                {showAllSpaces ? 'Thu gọn' : 'Xem tất cả'}
              </button>
            )}
          </div>

          {/* Table Container với vùng cuộn độc lập */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white border border-stone-200/90 rounded-2xl p-2.5 shadow-2xs">
            {/* Table Header */}
            <div className="grid grid-cols-12 text-xs font-semibold text-stone-600 pb-2 border-b border-stone-200 px-3 flex-shrink-0">
              <div className="col-span-6">Tên bàn học</div>
              <div className="col-span-3 text-left">Tài liệu</div>
              <div className="col-span-3 text-right pr-2">Mở lần cuối</div>
            </div>

            {/* Table Rows - Cuộn độc lập không ảnh hưởng trang */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 pr-1 no-scrollbar">
              {displayedSpaces.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    title={activeNav === 'starred' ? 'Chưa có bàn học nào được gắn dấu sao' : 'Không tìm thấy bàn học phù hợp'}
                    description={activeNav === 'starred' ? 'Nhấp vào biểu tượng ngôi sao ở bàn học để ghim.' : 'Hãy thử tìm kiếm với từ khóa khác.'}
                    action={activeNav === 'starred' ? { label: 'Xem tất cả bàn học', onClick: () => setActiveNav('my_desks') } : undefined}
                  />
                </div>
              ) : (
                displayedSpaces.map((space, idx) => {
                  const cleanSpaceName = space.name.replace(/\(Demo\)/i, '').trim();
                  const isDemo = space.name.includes('(Demo)');

                  return (
                    <div
                      key={space.id}
                      onClick={() => handleOpenSpace(space.id)}
                      className="grid grid-cols-12 items-center py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group"
                    >
                      {/* Name & Subtitle */}
                      <div className="col-span-6 pr-3 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarSpace?.(space.id);
                          }}
                          title={space.starred ? 'Bỏ gắn dấu sao' : 'Gắn dấu sao'}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            space.starred 
                              ? 'text-amber-500 hover:text-amber-600' 
                              : 'text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${space.starred ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* Thumbnail nhỏ 44x32px */}
                        <div className="w-11 h-8 rounded-lg bg-[#f1ede6] border border-stone-300/80 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {idx % 2 === 0 ? (
                            <div className="w-5 h-4 rounded-xs border border-[#5c3920] bg-white flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-2xs bg-[#fef08a]" />
                            </div>
                          ) : (
                            <div className="flex gap-0.5">
                              <div className="w-3 h-5 rounded-xs bg-white border border-stone-300" />
                              <div className="w-3 h-5 rounded-xs bg-white border border-stone-300" />
                            </div>
                          )}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900 group-hover:text-[#B8431A] transition-colors truncate">
                              {cleanSpaceName}
                            </span>
                            {isDemo && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded shrink-0">
                                Mẫu
                              </span>
                            )}
                          </div>
                          {space.description && (
                            <div className="text-[11px] text-stone-500 truncate">
                              {space.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="col-span-3 text-xs text-stone-600 font-medium truncate">
                        {getSpaceSummary(space)}
                      </div>

                      {/* Last Opened Time */}
                      <div className="col-span-3 text-xs text-stone-500 text-right pr-2">
                        {getRecentTimeString(space)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ================= MODALS ================= */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <MarketModal isOpen={isMarketOpen} onClose={() => setIsMarketOpen(false)} />
      <AiConfigModal isOpen={isAiConfigOpen} onClose={() => setIsAiConfigOpen(false)} />
    </div>
  );
}
