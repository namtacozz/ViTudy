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
  LogIn, 
  Star,
  User,
  Sparkles,
  LogOut,
  Store,
  Home,
  BookOpen,
  CalendarCheck,
  HelpCircle,
  LayoutGrid,
  List,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  ArrowRight,
  Layers,
  Clock,
  MousePointer2
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
  const { 
    spaces, 
    switchSpace, 
    createSpaceFromTemplate, 
    toggleStarSpace,
    deleteSpace,
    renameSpace,
    duplicateSpace
  } = useStudySpace();
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
  const [ownershipTab, setOwnershipTab] = useState<'mine' | 'shared'>('mine');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [menuOpenSpaceId, setMenuOpenSpaceId] = useState<string | null>(null);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown and row menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (rowMenuRef.current && !rowMenuRef.current.contains(event.target as Node)) {
        setMenuOpenSpaceId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    if (ownershipTab === 'shared' && !s.isShared) {
      // Demo: if no shared spaces exist, empty list
      return false;
    }
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)) ||
      (s.subject && s.subject.toLowerCase().includes(query))
    );
  });

  const displayedSpaces = showAllSpaces ? filteredSpaces : filteredSpaces.slice(0, 6);
  const latestSpace = spaces[0] || null;

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    await signOut();
    router.refresh();
  };

  const handleStartRename = (space: StudySpace, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSpaceId(space.id);
    setEditingName(space.name.replace(/\(Demo\)/i, '').trim());
    setMenuOpenSpaceId(null);
  };

  const handleSaveRename = (spaceId: string) => {
    if (renameSpace && editingName.trim()) {
      renameSpace(spaceId, editingName.trim());
    }
    setEditingSpaceId(null);
  };

  const handleDuplicate = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (duplicateSpace) {
      duplicateSpace(spaceId);
    }
    setMenuOpenSpaceId(null);
  };

  const handleDelete = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteSpace) {
      if (window.confirm('Bạn có chắc chắn muốn xóa bàn học này?')) {
        deleteSpace(spaceId);
      }
    }
    setMenuOpenSpaceId(null);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-[#faf8f5] text-stone-900 flex font-sans selection:bg-orange-100 selection:text-[#E0562D]">
      {/* ================= LEFT SIDEBAR (Notion/Miro Style) ================= */}
      <aside className="w-60 md:w-64 flex-shrink-0 border-r border-[#ece7e1] bg-[#faf8f5] p-4 flex flex-col justify-between h-screen overflow-y-auto no-scrollbar select-none">
        <div className="flex flex-col">
          {/* Logo Brand: Duy nhất 1 logo ViTudy trên thanh bên */}
          <div className="flex items-center gap-2.5 mb-4 px-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitudy.png')}
              alt="ViTudy"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-contain shadow-2xs flex-shrink-0"
              style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px' }}
            />
            <span className="text-lg font-black tracking-tight text-[#E0562D] leading-none">
              ViTudy
            </span>
          </div>

          {/* Search Input with Ctrl+K Hint */}
          <div className="relative mb-3.5">
            <div className="flex items-center gap-2 bg-[#f3eee8] border border-stone-200/90 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 focus-within:border-stone-400 focus-within:bg-white transition-all shadow-2xs">
              <Search className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 stroke-[2.2]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm bàn học, tài liệu..."
                className="w-full bg-transparent placeholder:text-stone-400 text-stone-800 focus:outline-none text-xs"
              />
              <kbd className="hidden sm:inline-block text-[9.5px] text-stone-400 bg-stone-200/80 px-1 py-0.5 rounded font-mono">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Navigation Links with Slim Clean Icons */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveNav('home')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                activeNav === 'home'
                  ? 'bg-[#eee8df] text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <Home className={`w-4 h-4 ${activeNav === 'home' ? 'text-[#E0562D]' : 'text-stone-500'}`} />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => {
                setActiveNav('my_desks');
                onEnterDesk();
              }}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                activeNav === 'my_desks'
                  ? 'bg-[#eee8df] text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeNav === 'my_desks' ? 'text-[#E0562D]' : 'text-stone-500'}`} />
              <span>Bàn học của tôi</span>
            </button>

            <button
              onClick={() => setActiveNav('starred')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                activeNav === 'starred'
                  ? 'bg-[#eee8df] text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7]'
              }`}
            >
              <Star className={`w-4 h-4 ${activeNav === 'starred' ? 'text-amber-500 fill-amber-400' : 'text-stone-500'}`} />
              <span>Đã gắn dấu sao</span>
            </button>

            <button
              onClick={() => setIsMarketOpen(true)}
              className="w-full text-left px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7] transition-all cursor-pointer flex items-center gap-2.5"
            >
              <Store className="w-4 h-4 text-stone-500" />
              <span>Chợ tài liệu</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-[#f3eee7] transition-all flex items-center gap-2.5"
            >
              <CalendarCheck className="w-4 h-4 text-stone-500" />
              <span>Nhật ký học</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom: Sleek Balance Chip & Help Link */}
        <div className="pt-3 border-t border-stone-200/70 space-y-2">
          {/* Compact Balance Chip */}
          <div className="bg-[#f5efe6] border border-[#e8dfd3] rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={getAssetPath('/icons/vitoken.svg')} 
                alt="ViToken" 
                width={15}
                height={15}
                className="w-3.5 h-3.5 object-contain flex-shrink-0" 
                style={{ width: '15px', height: '15px', maxWidth: '15px', maxHeight: '15px' }}
              />
              <span className="text-xs font-bold text-stone-900 font-sans">
                {(typeof balance === 'number' ? balance : 50).toLocaleString('vi-VN')} ViToken
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-2 py-0.5 bg-[#E0562D] hover:bg-[#c9451e] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              + Nạp
            </button>
          </div>

          {/* Help & About Footer Link */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-1">
            <button
              type="button"
              onClick={() => setIsMarketOpen(true)}
              className="flex items-center gap-1 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
              <span>Trợ giúp & Tài liệu</span>
            </button>
            <span className="text-[10px] text-stone-400 font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT (Fixed Viewport, No Page Scroll) ================= */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col max-w-6xl mx-auto p-4 md:p-6 w-full">
        {/* Top Header Bar: Clean Single Header (No Duplicate Logo) */}
        <header className="py-1.5 mb-2.5 border-b border-[#ece7e1] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">
              Không gian học tập cá nhân
            </span>
          </div>

          {/* Right Actions: Daily Goal (Duolingo Style) + Streak + Miro Avatar Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* 1. Daily Goal Widget (Duolingo Style) */}
            <div 
              onClick={() => {
                startPomodoroSession(25);
                onEnterDesk();
              }}
              title="Mục tiêu hôm nay: 1/4 phiên 25 phút. Nhấp để bắt đầu học ngay."
              className="hidden sm:flex items-center gap-2 bg-white border border-stone-200/90 hover:border-[#E0562D] px-2.5 py-1 rounded-full shadow-2xs transition-all cursor-pointer group active:scale-98 select-none"
            >
              <Target className="w-3.5 h-3.5 text-[#B8431A]" />
              <span className="text-xs font-semibold text-stone-700">
                Mục tiêu: <strong className="text-stone-900 font-bold">1/4</strong>
              </span>
              <div className="w-10 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#E0562D] rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* 2. Streak Badge */}
            <button
              type="button"
              onClick={handleClaimStreak}
              title={isClaimedToday ? "Đã điểm danh nhận ViToken hôm nay" : "Nhấp để điểm danh nhận +2 ViToken"}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 select-none ${
                isClaimedToday 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-white border border-stone-200/90 text-stone-800 hover:border-[#E0562D]'
              }`}
            >
              {isClaimedToday ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.4]" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-[#E0562D] fill-[#E0562D]" />
              )}
              <span>Chuỗi {streakDays || 1} ngày · {isClaimedToday ? 'Đã điểm danh' : 'Điểm danh'}</span>
            </button>

            {/* 3. Profile Avatar with Miro-style Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  title={`Tài khoản (${userName})`}
                  aria-label="Menu tài khoản"
                  className="w-8 h-8 rounded-full border border-stone-300 hover:border-[#E0562D] bg-white shadow-2xs overflow-hidden flex items-center justify-center transition-all cursor-pointer active:scale-95"
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

                {/* Miro-style Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-10 z-50 w-60 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 font-sans animate-fade-in text-xs select-none">
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
                className="px-3 py-1 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </header>

        {/* Feedback alert */}
        {claimFeedback && (
          <div className="mb-2 p-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-[#B8431A] flex items-center justify-between animate-fade-in shadow-xs flex-shrink-0">
            <span>{claimFeedback}</span>
            <button onClick={() => setClaimFeedback(null)} className="text-stone-400 hover:text-stone-600 font-bold px-1.5">✕</button>
          </div>
        )}

        {/* Top Section 1: Hero Continue Recent Desk Card (Large Prominent) */}
        {latestSpace && (
          <div className="mb-2.5 bg-white border border-stone-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between flex-shrink-0 hover:border-[#E0562D]/60 transition-all">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#E0562D]">
                <BookOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8431A] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">
                    Tiếp tục học
                  </span>
                  <span className="text-xs font-bold text-stone-900 truncate">
                    {latestSpace.name.replace(/\(Demo\)/i, '').trim()}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5 truncate flex items-center gap-2">
                  <span>Mở {getRecentTimeString(latestSpace)}</span>
                  <span>•</span>
                  <span>{getSpaceSummary(latestSpace)}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenSpace(latestSpace.id)}
              className="px-4 py-2 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95"
            >
              <span>Vào bàn học</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Section 2: Learning Core Strip (Quizlet/Anki Style Hook) */}
        <div className="mb-2.5 bg-[#FFF7ED]/70 border border-[#FFEDD5] rounded-xl px-3.5 py-2 flex items-center justify-between flex-shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-stone-800">
            <Layers className="w-4 h-4 text-[#E0562D]" />
            <span>
              Hôm nay: <strong className="text-stone-900 font-bold">12 thẻ cần ôn</strong> · 1 đề luyện tập chưa làm
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEnterDesk()}
            className="text-xs font-bold text-[#E0562D] hover:text-[#c9451e] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Ôn ngay</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Greeting & Create Desk Button */}
        <div className="mb-2.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-serif text-stone-900 tracking-tight">
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
            <p className="text-xs text-stone-500 mt-0.5">
              Bạn đã hoàn thành 1 phiên hôm nay (25 phút)
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelectTemplate('blank')}
            className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
            <span>Tạo bàn học</span>
          </button>
        </div>

        {/* 4 Template Quick Start Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 flex-shrink-0">
          {/* Card 1: Bàn học trống (Dashed style preserved) */}
          <div
            onClick={() => handleSelectTemplate('blank')}
            className="bg-white border border-stone-200/90 rounded-xl p-2 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="h-10 w-full rounded-lg border border-dashed border-stone-300 flex items-center justify-center bg-stone-50 group-hover:border-[#E0562D]/60 transition-colors">
              <Plus className="w-4 h-4 text-stone-400 group-hover:text-[#E0562D] stroke-[2]" />
            </div>
            <span className="mt-1.5 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] truncate">
              Bàn học trống
            </span>
            <p className="text-[10px] text-stone-600 truncate">
              Kéo thả tài liệu tùy ý
            </p>
          </div>

          {/* Card 2: Ôn thi giữa kỳ */}
          <div
            onClick={() => handleSelectTemplate('midterm')}
            className="bg-white border border-stone-200/90 rounded-xl p-2 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="h-10 w-full rounded-lg bg-[#eef1f5] flex items-center justify-center gap-1.5 group-hover:bg-[#e8ebf0] transition-colors">
              <div className="w-10 h-7 rounded-xs border border-[#5c3920] bg-white flex overflow-hidden">
                <div className="w-1/2 border-r border-stone-200 p-0.5" />
                <div className="w-1/2 p-0.5 bg-[#FFF7ED]" />
              </div>
              <div className="w-4 h-6 rounded-2xs bg-[#fef08a] border border-amber-200/80" />
            </div>
            <span className="mt-1.5 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] truncate">
              Ôn thi giữa kỳ
            </span>
            <p className="text-[10px] text-stone-600 truncate">
              Giáo trình + ghi chú vàng
            </p>
          </div>

          {/* Card 3: Giáo trình + đề thi */}
          <div
            onClick={() => handleSelectTemplate('curriculum_exam')}
            className="bg-white border border-stone-200/90 rounded-xl p-2 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="h-10 w-full rounded-lg bg-[#eef1f5] flex items-center justify-center gap-1.5 group-hover:bg-[#e8ebf0] transition-colors">
              <div className="w-6 h-8 rounded-xs bg-white border border-stone-300 p-0.5" />
              <div className="w-6 h-8 rounded-xs bg-white border border-stone-300 p-0.5" />
            </div>
            <span className="mt-1.5 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] truncate">
              Giáo trình + đề thi
            </span>
            <p className="text-[10px] text-stone-600 truncate">
              Mở song song 2 tài liệu
            </p>
          </div>

          {/* Card 4: Học nhóm */}
          <div
            onClick={() => handleSelectTemplate('group_study')}
            className="bg-white border border-stone-200/90 rounded-xl p-2 flex flex-col hover:border-[#E0562D] hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="h-10 w-full rounded-lg bg-[#eef1f5] flex items-center justify-center relative overflow-hidden group-hover:bg-[#e8ebf0] transition-colors">
              <div className="w-10 h-6 rounded-xs bg-[#5c3920] flex items-center justify-center text-[7px] font-bold text-amber-100">
                Phòng
              </div>
              <MousePointer2 className="w-2.5 h-2.5 text-[#E0562D] fill-[#E0562D] absolute top-1 left-2" />
              <MousePointer2 className="w-2.5 h-2.5 text-purple-600 fill-purple-600 absolute bottom-1 right-2" />
            </div>
            <span className="mt-1.5 text-xs font-bold text-stone-900 group-hover:text-[#B8431A] truncate">
              Học nhóm
            </span>
            <p className="text-[10px] text-stone-600 truncate">
              Ôn bài trực tuyến cùng bạn
            </p>
          </div>
        </div>

        {/* Section 3: Recent Desks Table with Tabs & View Toggle (Fixed Inner Scroll) */}
        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Controls Bar: Tabs [Của tôi | Được chia sẻ] + View Mode [List | Grid] + Show All */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xs md:text-sm font-bold text-stone-900">Mở lại gần đây</h2>
              {/* Ownership Tabs */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs font-semibold text-stone-700">
                <button
                  type="button"
                  onClick={() => setOwnershipTab('mine')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    ownershipTab === 'mine'
                      ? 'bg-white text-stone-900 font-bold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Của tôi
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipTab('shared')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    ownershipTab === 'shared'
                      ? 'bg-white text-stone-900 font-bold shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Được chia sẻ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs text-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Chế độ danh sách"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#E0562D] shadow-2xs' : 'hover:text-stone-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Chế độ lưới"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#E0562D] shadow-2xs' : 'hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {filteredSpaces.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllSpaces(!showAllSpaces)}
                  className="text-xs font-bold text-[#B8431A] hover:text-[#9A3412] hover:underline cursor-pointer ml-1"
                >
                  {showAllSpaces ? 'Thu gọn' : 'Xem tất cả'}
                </button>
              )}
            </div>
          </div>

          {/* Table Container với vùng cuộn độc lập */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white border border-stone-200/90 rounded-2xl p-2.5 shadow-2xs">
            {viewMode === 'list' ? (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 text-xs font-semibold text-stone-600 pb-2 border-b border-stone-200 px-3 flex-shrink-0">
                  <div className="col-span-6">Tên bàn học</div>
                  <div className="col-span-3 text-left">Tài liệu & ghi chú</div>
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
                      const isEditing = editingSpaceId === space.id;

                      return (
                        <div
                          key={space.id}
                          onClick={() => !isEditing && handleOpenSpace(space.id)}
                          className="grid grid-cols-12 items-center py-2 px-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group relative"
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

                            {/* Thumbnail nhỏ 40x28px */}
                            <div className="w-10 h-7 rounded-lg bg-[#f1ede6] border border-stone-300/80 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {idx % 2 === 0 ? (
                                <div className="w-5 h-3.5 rounded-xs border border-[#5c3920] bg-white flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-2xs bg-[#fef08a]" />
                                </div>
                              ) : (
                                <div className="flex gap-0.5">
                                  <div className="w-2.5 h-4 rounded-xs bg-white border border-stone-300" />
                                  <div className="w-2.5 h-4 rounded-xs bg-white border border-stone-300" />
                                </div>
                              )}
                            </div>

                            {/* Text info & Inline Rename */}
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingName}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onBlur={() => handleSaveRename(space.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(space.id);
                                    if (e.key === 'Escape') setEditingSpaceId(null);
                                  }}
                                  className="w-full text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded px-1.5 py-0.5 outline-none focus:border-[#E0562D]"
                                />
                              ) : (
                                <>
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
                                </>
                              )}
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="col-span-3 text-xs text-stone-600 font-medium truncate">
                            {getSpaceSummary(space)}
                          </div>

                          {/* Last Opened Time & Hover Action Menu "⋯" */}
                          <div className="col-span-3 text-xs text-stone-500 text-right pr-2 flex items-center justify-end gap-2">
                            <span>{getRecentTimeString(space)}</span>
                            
                            {/* "⋯" Menu Button */}
                            <div className="relative" ref={rowMenuRef}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenSpaceId(menuOpenSpaceId === space.id ? null : space.id);
                                }}
                                title="Tùy chọn bàn học"
                                className="w-6 h-6 rounded-md hover:bg-stone-200 text-stone-400 hover:text-stone-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* Row Action Popover */}
                              {menuOpenSpaceId === space.id && (
                                <div 
                                  className="absolute right-0 top-7 z-30 w-36 bg-white rounded-xl border border-stone-200 shadow-xl p-1 text-xs text-stone-700 animate-fade-in font-sans text-left"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(space, e)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Đổi tên</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDuplicate(space.id, e)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                                    <span>Nhân bản</span>
                                  </button>
                                  <div className="border-t border-stone-100 my-0.5" />
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(space.id, e)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* Grid View Mode */
              <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-3 no-scrollbar">
                {displayedSpaces.map((space) => {
                  const cleanSpaceName = space.name.replace(/\(Demo\)/i, '').trim();
                  const isDemo = space.name.includes('(Demo)');

                  return (
                    <div
                      key={space.id}
                      onClick={() => handleOpenSpace(space.id)}
                      className="bg-stone-50/70 border border-stone-200 rounded-xl p-3 flex flex-col justify-between hover:border-[#E0562D] hover:bg-white hover:shadow-2xs transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {getRecentTimeString(space)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarSpace?.(space.id);
                            }}
                            className="text-stone-400 hover:text-amber-500 cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${space.starred ? 'text-amber-500 fill-amber-400' : ''}`} />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#E0562D] truncate">
                          {cleanSpaceName}
                        </h4>
                        {isDemo && (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded shrink-0 inline-block mt-0.5">
                            Mẫu
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-3 pt-2 border-t border-stone-200/80 truncate">
                        {getSpaceSummary(space)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
